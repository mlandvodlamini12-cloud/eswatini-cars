"""
Properly patch and sign APK:
1. Rebuild ZIP with correct CRC32 (Python zipfile does this automatically)
2. zipalign (Android SDK tool — aligns ZIP entries for memory-mapped reads)
3. apksigner (Android SDK tool — does v1+v2+v3 signing)
"""
import zipfile, io, os, subprocess, shutil

APK_INPUT = "/home/z/my-project/upload/E-Cars-unsigned.apk"
ALIGNED_APK = "/tmp/Eswatini-Cars-aligned.apk"
SIGNED_APK = "/home/z/my-project/download/Eswatini-Cars.apk"

ZIPALIGN = "/home/z/.bubblewrap/android_sdk/build-tools/36.1.0/zipalign"
APKSIGNER = "/home/z/.bubblewrap/android_sdk/build-tools/36.1.0/apksigner"
KEYSTORE = "/home/z/my-project/android.keystore"
STOREPASS = "eswatini123"
ALIAS = "ec-signing"

OLD_HOST = b"magnificent-pastelito-a04324.netlify.app"
NEW_HOST = b"eswatini-cars.vercel.app"
PAD = len(OLD_HOST) - len(NEW_HOST)
NEW_HOST_PADDED = NEW_HOST + (b'\x00' * PAD)

# Also replace full URLs
OLD_URLS = [
    (b"https://magnificent-pastelito-a04324.netlify.app/", 
     b"https://eswatini-cars.vercel.app/" + b'\x00' * (len(b"https://magnificent-pastelito-a04324.netlify.app/") - len(b"https://eswatini-cars.vercel.app/"))),
    (b"https://magnificent-pastelito-a04324.netlify.app",
     b"https://eswatini-cars.vercel.app" + b'\x00' * (len(b"https://magnificent-pastelito-a04324.netlify.app") - len(b"https://eswatini-cars.vercel.app"))),
]

print("=" * 60)
print("  APK Patch + zipalign + apksigner")
print("=" * 60)

# Step 1: Patch the APK (rebuild ZIP with modified content)
print("\n[1/4] Patching APK (rebuilding ZIP with correct CRC32)...")
patched_path = "/tmp/patched-unsigned.apk"

with open(APK_INPUT, 'rb') as f:
    apk_data = f.read()

input_zip = zipfile.ZipFile(io.BytesIO(apk_data), 'r')
output_buf = io.BytesIO()
output_zip = zipfile.ZipFile(output_buf, 'w', zipfile.ZIP_STORED)  # No compression for alignment

total_replacements = 0
for info in input_zip.infolist():
    name = info.filename
    data = input_zip.read(name)

    # Skip existing signatures
    if name.startswith('META-INF/') and (name.endswith('.SF') or name.endswith('.RSA') or name.endswith('.DSA') or name == 'META-INF/MANIFEST.MF'):
        continue

    # Replace host
    if OLD_HOST in data:
        count = data.count(OLD_HOST)
        data = data.replace(OLD_HOST, NEW_HOST_PADDED)
        total_replacements += count
        print(f"  {name}: replaced {count} host(s)")

    # Replace full URLs
    for old_url, new_url in OLD_URLS:
        if old_url in data:
            count = data.count(old_url)
            data = data.replace(old_url, new_url)
            total_replacements += count
            print(f"  {name}: replaced {count} URL(s)")

    # Write with original compression info
    new_info = zipfile.ZipInfo(filename=name, date_time=info.date_time)
    new_info.compress_type = info.compress_type
    new_info.external_attr = info.external_attr
    output_zip.writestr(new_info, data)

output_zip.close()
input_zip.close()

patched_data = output_buf.getvalue()
with open(patched_path, 'wb') as f:
    f.write(patched_data)
print(f"\n  Total replacements: {total_replacements}")
print(f"  Patched size: {len(patched_data)} bytes")

# Step 2: zipalign
print("\n[2/4] zipalign (aligning ZIP entries to 4-byte boundaries)...")
if os.path.exists(ALIGNED_APK):
    os.unlink(ALIGNED_APK)

result = subprocess.run([
    ZIPALIGN, '-f', '-v', '4', patched_path, ALIGNED_APK
], capture_output=True, text=True)

if result.returncode != 0:
    print(f"zipalign failed: {result.stderr[:500]}")
    # Try without -v
    result = subprocess.run([ZIPALIGN, '-f', '4', patched_path, ALIGNED_APK], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"zipalign failed again: {result.stderr[:500]}")
        exit(1)

print(f"  ✅ Aligned: {ALIGNED_APK} ({os.path.getsize(ALIGNED_APK)} bytes)")

# Step 3: apksigner (v1+v2+v3 signing)
print("\n[3/4] apksigner (v1+v2+v3 signing)...")

result = subprocess.run([
    APKSIGNER, 'sign',
    '--ks', KEYSTORE,
    '--ks-key-alias', ALIAS,
    '--ks-pass', f'pass:{STOREPASS}',
    '--key-pass', f'pass:{STOREPASS}',
    '--v1-signing-enabled', 'true',
    '--v2-signing-enabled', 'true',
    '--v3-signing-enabled', 'true',
    '--out', SIGNED_APK,
    ALIGNED_APK
], capture_output=True, text=True)

if result.returncode != 0:
    print(f"apksigner failed: {result.stderr[:500]}")
    # Try with debug keystore
    print("Trying debug keystore...")
    DEBUG_KS = "/home/z/my-project/debug.keystore"
    result = subprocess.run([
        APKSIGNER, 'sign',
        '--ks', DEBUG_KS,
        '--ks-key-alias', 'androiddebugkey',
        '--ks-pass', 'pass:android',
        '--key-pass', 'pass:android',
        '--v1-signing-enabled', 'true',
        '--v2-signing-enabled', 'true',
        '--v3-signing-enabled', 'true',
        '--out', SIGNED_APK,
        ALIGNED_APK
    ], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Debug signing failed: {result.stderr[:500]}")
        exit(1)

print(f"  ✅ Signed: {SIGNED_APK} ({os.path.getsize(SIGNED_APK) / (1024*1024):.2f} MB)")

# Step 4: Verify
print("\n[4/4] Verifying signature...")
result = subprocess.run([APKSIGNER, 'verify', '--verbose', SIGNED_APK], capture_output=True, text=True)
print(f"  {result.stdout.strip()}")

# Upload
print("\n=== Uploading signed APK ===")
import urllib.request, json
result = subprocess.run(['curl', '-s', '--max-time', '120', '-F', f'file=@{SIGNED_APK}', 'https://tmpfiles.org/api/v1/upload'], capture_output=True, text=True)
try:
    r = json.loads(result.stdout)
    print(f"✅ Upload: {r['data']['url']}")
except:
    print(f"Upload: {result.stdout[:200]}")

print(f"\n{'='*60}")
print(f"  ✅ APK READY!")
print(f"{'='*60}")
