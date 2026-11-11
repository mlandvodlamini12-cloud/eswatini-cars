"""
Patch the unsigned APK to change the URL from Netlify to Vercel.
Does a binary search-and-replace, padding the shorter new URL with null bytes
to maintain the same byte length (preserves APK structure).
Then signs the APK with jarsigner.
"""
import zipfile
import io
import os
import subprocess
import shutil

APK_INPUT = "/home/z/my-project/upload/E-Cars-unsigned.apk"
APK_OUTPUT = "/home/z/my-project/download/Eswatini-Cars.apk"
JARSIGNER = "/tmp/jdk-17.0.21+9/bin/jarsigner"
KEYSTORE = "/home/z/my-project/android.keystore"
STOREPASS = "eswatini123"
ALIAS = "ec-signing"

# The old host (40 chars) → new host (24 chars) + 16 null bytes
OLD_HOST = b"magnificent-pastelito-a04324.netlify.app"
NEW_HOST = b"eswatini-cars.vercel.app"
# Pad with null bytes to match old length
PAD_LEN = len(OLD_HOST) - len(NEW_HOST)
NEW_HOST_PADDED = NEW_HOST + (b'\x00' * PAD_LEN)

print(f"Old host: {OLD_HOST.decode()} ({len(OLD_HOST)} bytes)")
print(f"New host: {NEW_HOST.decode()} ({len(NEW_HOST)} bytes)")
print(f"Padding: {PAD_LEN} null bytes")
print(f"Padded: {len(NEW_HOST_PADDED)} bytes (matches old: {len(OLD_HOST)})")
print()

# Read the input APK
print("Reading unsigned APK...")
with open(APK_INPUT, 'rb') as f:
    apk_data = f.read()

# Create output ZIP
print("Patching APK...")
input_zip = zipfile.ZipFile(io.BytesIO(apk_data), 'r')
output_buf = io.BytesIO()
output_zip = zipfile.ZipFile(output_buf, 'w', zipfile.ZIP_DEFLATED)

total_replacements = 0

for info in input_zip.infolist():
    data = input_zip.read(info.filename)
    
    # Skip existing META-INF signature files
    if info.filename.startswith('META-INF/') and (info.filename.endswith('.SF') or info.filename.endswith('.RSA') or info.filename.endswith('.DSA')):
        continue
    
    # Replace old host with new host (padded) in binary data
    if OLD_HOST in data:
        count = data.count(OLD_HOST)
        data = data.replace(OLD_HOST, NEW_HOST_PADDED)
        total_replacements += count
        print(f"  {info.filename}: replaced {count} occurrence(s)")
    
    # Also replace full URLs
    for old_url, new_url in [
        (b"https://magnificent-pastelito-a04324.netlify.app/", 
         b"https://eswatini-cars.vercel.app/" + b'\x00' * 14),
        (b"https://magnificent-pastelito-a04324.netlify.app",
         b"https://eswatini-cars.vercel.app" + b'\x00' * 16),
    ]:
        if old_url in data:
            count = data.count(old_url)
            data = data.replace(old_url, new_url)
            total_replacements += count
            print(f"  {info.filename}: replaced {count} URL(s)")
    
    output_zip.writestr(info, data)

# Add MANIFEST.MF, CERT.SF, CERT.RSA for signing
# First, write the output without signature
output_zip.close()
input_zip.close()

patched_data = output_buf.getvalue()
print(f"\nTotal replacements: {total_replacements}")
print(f"Patched APK size: {len(patched_data)} bytes")

# Write the patched (but unsigned) APK
unsigned_path = "/tmp/patched-unsigned.apk"
with open(unsigned_path, 'wb') as f:
    f.write(patched_data)

# Sign with jarsigner
print("\nSigning APK with jarsigner...")
result = subprocess.run([
    JARSIGNER, '-verbose', '-sigalg', 'SHA256withRSA', '-digestalg', 'SHA-256',
    '-keystore', KEYSTORE, '-storepass', STOREPASS, '-keypass', STOREPASS,
    unsigned_path, ALIAS
], capture_output=True, text=True)

if result.returncode != 0:
    print(f"jarsigner failed: {result.stderr[:500]}")
    # Try alternative: sign with the debug keystore
    print("Trying debug keystore...")
    DEBUG_KS = "/home/z/my-project/debug.keystore"
    result = subprocess.run([
        JARSIGNER, '-verbose', '-sigalg', 'SHA256withRSA', '-digestalg', 'SHA-256',
        '-keystore', DEBUG_KS, '-storepass', 'android', '-keypass', 'android',
        unsigned_path, 'androiddebugkey'
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Debug signing also failed: {result.stderr[:500]}")
        exit(1)
    else:
        print("✅ Signed with debug keystore")

# Copy signed APK to output
shutil.copy(unsigned_path, APK_OUTPUT)
print(f"\n✅ Signed APK written: {APK_OUTPUT}")
print(f"   Size: {os.path.getsize(APK_OUTPUT) / (1024*1024):.2f} MB")

# Verify signature
print("\nVerifying signature...")
verify = subprocess.run([JARSIGNER, '-verify', APK_OUTPUT], capture_output=True, text=True)
print(f"Verification: {verify.stdout.strip()}")

# Upload
print("\nUploading...")
import urllib.request
import json

# Use curl for upload (more reliable)
import subprocess as sp
upload_result = sp.run([
    'curl', '-s', '--max-time', '120',
    '-F', f'file=@{APK_OUTPUT}',
    'https://tmpfiles.org/api/v1/upload'
], capture_output=True, text=True)

try:
    result = json.loads(upload_result.stdout)
    print(f"Upload: {json.dumps(result, indent=2)}")
except:
    print(f"Upload result: {upload_result.stdout[:200]}")
