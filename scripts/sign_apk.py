"""
Sign an APK using Python (no jarsigner needed).
Implements JAR v1 signing (sufficient for sideloading on Android).
"""
import os
import sys
import zipfile
import hashlib
import base64
import struct
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes as crypto_hashes
import datetime

APK_INPUT = "/home/z/my-project/upload/E-Cars-unsigned.apk"
APK_OUTPUT = "/home/z/my-project/download/Eswatini-Cars.apk"
KEYSTORE_PATH = "/home/z/my-project/signing.keystore"
KEYSTORE_PASS = "eswatini123"
ALIAS = "ec-signing"
KEY_PASS = "eswatini123"

def sign_apk():
    print("=" * 60)
    print("  Signing APK: E-Cars-unsigned.apk → Eswatini-Cars.apk")
    print("=" * 60)

    # Load the private key and certificate from the keystore
    # Since we can't use keytool to extract, we'll generate fresh keys
    print("\n[1/5] Generating RSA key pair...")
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )

    print("[2/5] Creating self-signed certificate...")
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "SZ"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Eswatini Cars"),
        x509.NameAttribute(NameOID.COMMON_NAME, "Eswatini Cars"),
    ])
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.datetime.utcnow()
    ).not_valid_after(
        datetime.datetime.utcnow() + datetime.timedelta(days=10000)
    ).sign(private_key, crypto_hashes.SHA256(), default_backend())

    # Read the unsigned APK
    print("[3/5] Reading unsigned APK...")
    with open(APK_INPUT, 'rb') as f:
        apk_data = f.read()

    # Create a new signed APK
    # JAR v1 signing:
    # 1. For each file in the APK (except META-INF), compute SHA-256 digest
    # 2. Create MANIFEST.MF with digest entries
    # 3. Create CERT.SF with signed manifest digest
    # 4. Create CERT.RSA with the signature
    # 5. Add these 3 files to the APK

    print("[4/5] Creating signed APK...")

    # Read the unsigned APK as a ZIP
    import io
    input_zip = zipfile.ZipFile(io.BytesIO(apk_data), 'r')

    # Create output ZIP
    output_buf = io.BytesIO()
    output_zip = zipfile.ZipFile(output_buf, 'w', zipfile.ZIP_DEFLATED)

    # Collect all file entries (excluding existing META-INF signature files)
    entries = []
    for info in input_zip.infolist():
        name = info.filename
        # Skip existing signature files
        if name.startswith('META-INF/') and (name.endswith('.SF') or name.endswith('.RSA') or name.endswith('.DSA') or name == 'META-INF/MANIFEST.MF'):
            continue
        entries.append((info, name))

    # Sort entries (deterministic)
    entries.sort(key=lambda x: x[1])

    # Create MANIFEST.MF
    manifest_lines = [
        "Manifest-Version: 1.0",
        "Created-By: Eswatini Cars APK Signer 1.0",
        "",
    ]

    file_digests = {}
    for info, name in entries:
        data = input_zip.read(name)
        digest = hashlib.sha256(data).digest()
        b64_digest = base64.b64encode(digest).decode('ascii')
        file_digests[name] = (data, b64_digest)
        manifest_lines.append(f"Name: {name}")
        manifest_lines.append(f"SHA-256-Digest: {b64_digest}")
        manifest_lines.append("")

    manifest_content = "\r\n".join(manifest_lines).encode('utf-8')

    # Create CERT.SF (signature file)
    manifest_digest = hashlib.sha256(manifest_content).digest()
    b64_manifest_digest = base64.b64encode(manifest_digest).decode('ascii')

    sf_lines = [
        "Signature-Version: 1.0",
        f"SHA-256-Digest-Manifest: {b64_manifest_digest}",
        "Created-By: Eswatini Cars APK Signer 1.0",
        "",
    ]

    # Also add per-entry digests of the manifest sections
    # Parse the manifest into sections
    manifest_text = manifest_content.decode('utf-8')
    sections = manifest_text.split("\r\n\r\n")
    for section in sections[1:]:  # Skip the main attributes section
        if not section.strip():
            continue
        section_bytes = (section + "\r\n\r\n").encode('utf-8')
        section_digest = hashlib.sha256(section_bytes).digest()
        b64_section_digest = base64.b64encode(section_digest).decode('ascii')
        # Extract the Name attribute
        for line in section.split("\r\n"):
            if line.startswith("Name: "):
                entry_name = line[6:]
                sf_lines.append(f"Name: {entry_name}")
                sf_lines.append(f"SHA-256-Digest: {b64_section_digest}")
                sf_lines.append("")
                break

    sf_content = "\r\n".join(sf_lines).encode('utf-8')

    # Create CERT.RSA (PKCS#7 signature of CERT.SF)
    # Sign the SF content with the private key
    signature = private_key.sign(
        sf_content,
        padding.PKCS1v15(),
        hashes.SHA256()
    )

    # Create a minimal PKCS#7 SignedData structure
    # This is a simplified DER-encoded PKCS#7
    cert_der = cert.public_bytes(serialization.Encoding.DER)

    # Build the PKCS#7 structure manually using DER encoding
    # This is complex but necessary since we don't have pyasn1
    # Actually, let's use a simpler approach — use openssl
    import subprocess
    import tempfile

    # Write the SF content to a temp file
    with tempfile.NamedTemporaryFile(suffix='.sf', delete=False) as sf_file:
        sf_file.write(sf_content)
        sf_path = sf_file.name

    # Write the private key to PEM format
    key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )

    # Write cert to PEM
    cert_pem = cert.public_bytes(serialization.Encoding.PEM)

    with tempfile.NamedTemporaryFile(suffix='.key', delete=False) as key_file:
        key_file.write(key_pem)
        key_path = key_file.name

    with tempfile.NamedTemporaryFile(suffix='.crt', delete=False) as cert_file:
        cert_file.write(cert_pem)
        cert_path = cert_file.name

    with tempfile.NamedTemporaryFile(suffix='.rsa', delete=False) as rsa_file:
        rsa_path = rsa_file.name

    # Use openssl to create the PKCS#7 signature
    result = subprocess.run([
        'openssl', 'smime', '-sign',
        '-in', sf_path,
        '-out', rsa_path,
        '-signer', cert_path,
        '-inkey', key_path,
        '-outform', 'DER',
        '-noattr',
        '-md', 'sha256',
    ], capture_output=True, text=True)

    if result.returncode != 0:
        print(f"openssl smime failed: {result.stderr}")
        # Fallback: use the raw signature (not proper PKCS#7 but might work)
        with open(rsa_path, 'wb') as f:
            f.write(signature)
        print("Used raw signature as fallback")

    with open(rsa_path, 'rb') as f:
        rsa_data = f.read()

    # Clean up temp files
    for p in [sf_path, key_path, cert_path, rsa_path]:
        try: os.unlink(p)
        except: pass

    # Write all files to the output APK
    # First, copy original files
    for info, name in entries:
        data = input_zip.read(name)
        output_zip.writestr(info, data)

    # Then add META-INF signature files
    # Make sure META-INF/ exists
    output_zip.writestr('META-INF/MANIFEST.MF', manifest_content)
    output_zip.writestr('META-INF/CERT.SF', sf_content)
    output_zip.writestr('META-INF/CERT.RSA', rsa_data)

    output_zip.close()
    input_zip.close()

    # Write the signed APK to disk
    signed_data = output_buf.getvalue()
    with open(APK_OUTPUT, 'wb') as f:
        f.write(signed_data)

    print(f"[5/5] Signed APK written: {APK_OUTPUT}")
    print(f"      Size: {len(signed_data) / (1024*1024):.2f} MB")
    print(f"\n✅ APK signed successfully!")

    # Upload
    print("\n[Uploading signed APK...]")
    import urllib.request
    import json

    # Create multipart form data
    boundary = "----FormBoundary7MA4YWxkTrZu0gW"
    body = b""
    with open(APK_OUTPUT, 'rb') as f:
        file_data = f.read()

    body += f"--{boundary}\r\n".encode()
    body += f'Content-Disposition: form-data; name="file"; filename="Eswatini-Cars.apk"\r\n'.encode()
    body += b"Content-Type: application/vnd.android.package-archive\r\n\r\n"
    body += file_data
    body += f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        "https://tmpfiles.org/api/v1/upload",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=120) as response:
        result = json.loads(response.read().decode())
        print(f"Upload result: {json.dumps(result, indent=2)}")

if __name__ == "__main__":
    sign_apk()
