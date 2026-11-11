#!/usr/bin/env python3
"""
Build a signed TWA APK pointing to eswatini-cars.vercel.app
Uses bubblewrap CLI (Google's PWA-to-APK tool).
"""
import os
import sys
import pexpect
import shutil
import json

JAVA_HOME = '/usr/lib/jvm/java-21-openjdk-amd64'
os.environ['JAVA_HOME'] = JAVA_HOME
os.environ['PATH'] = f"/home/z/.npm-global/bin:{JAVA_HOME}/bin:/usr/bin:/bin:" + os.environ.get('PATH', '')

WORK_DIR = '/home/z/my-project/android-apk'
os.makedirs(WORK_DIR, exist_ok=True)

# Write the TWA manifest
MANIFEST = {
    "packageId": "sz.co.eswatinicars.app",
    "host": "eswatini-cars.vercel.app",
    "name": "Eswatini Cars",
    "themeColor": "#0a1834",
    "navigationColor": "#0a1834",
    "backgroundColor": "#0a1834",
    "enableNotifications": True,
    "startUrl": "/?utm_source=pwa",
    "iconUrl": "https://eswatini-cars.vercel.app/icons/icon-512.png",
    "maskableIconUrl": "https://eswatini-cars.vercel.app/icons/maskable-512.png",
    "splashScreenFadeOutDuration": 300,
    "signingKey": {
        "path": "/home/z/my-project/android.keystore",
        "alias": "ec-signing"
    },
    "appVersionName": "1.0.0",
    "appVersionCode": 1,
    "shortcuts": [
        {"name": "Browse Vehicles", "shortName": "Browse", "url": "/?view=browse"},
        {"name": "Sell Your Car", "shortName": "Sell", "url": "/?action=sell"},
        {"name": "How It Works", "shortName": "Help", "url": "/?view=how"}
    ],
    "generatorApp": "bubblewrap-cli",
    "webManifestUrl": "https://eswatini-cars.vercel.app/manifest.json",
    "fallbackType": "customtabs",
    "features": {"locationDelegation": {"enabled": False}},
    "alphaDependencies": {"enabled": False},
    "enableSiteSettingsShortcut": False,
    "isChromeOSOnly": False,
    "isMetaQuest": False,
    "fullScopeUrl": "https://eswatini-cars.vercel.app/",
    "minSdkVersion": 21,
    "_internalAppVersionCode": 1,
}

manifest_path = os.path.join(WORK_DIR, 'twa-manifest.json')
with open(manifest_path, 'w') as f:
    json.dump(MANIFEST, f, indent=2)

# Create keystore if it doesn't exist
keystore_path = "/home/z/my-project/android.keystore"
if not os.path.exists(keystore_path):
    print("Creating signing keystore...")
    import subprocess
    subprocess.run([
        'keytool', '-genkeypair', '-v',
        '-keystore', keystore_path,
        '-alias', 'ec-signing',
        '-keyalg', 'RSA', '-keysize', '2048',
        '-validity', '10000',
        '-storepass', 'eswatini123',
        '-keypass', 'eswatini123',
        '-dname', 'CN=Eswatini Cars, O=Eswatini Cars, C=SZ',
        '-storetype', 'PKCS12'
    ], check=True)
    print("Keystore created.")

# Step 1: bubblewrap update (downloads Android SDK)
print("\n" + "=" * 60)
print("STEP 1: bubblewrap update (downloads Android SDK ~3GB)")
print("=" * 60)

UPDATE_CMD = f"bubblewrap update --manifest {manifest_path} --jdkPath {JAVA_HOME}"
child = pexpect.spawn(UPDATE_CMD, encoding='utf-8', timeout=900, cwd=WORK_DIR)
child.logfile_read = sys.stdout

try:
    child.expect(r"Do you want Bubblewrap to install the JDK.*\?", timeout=60)
    child.sendline("n")
    child.expect(r"Path to your existing JDK 17:", timeout=30)
    child.sendline(JAVA_HOME)
    print("\n[Waiting for Android SDK download (5-10 min)...]")
    child.expect(pexpect.EOF, timeout=900)
    update_exit = child.exitstatus
    print(f"\nExit code: {update_exit}")
except pexpect.exceptions.TIMEOUT as e:
    print(f"\n[TIMEOUT: {e}]")
    sys.exit(1)
except pexpect.exceptions.EOF:
    update_exit = child.exitstatus

if update_exit != 0:
    print(f"\nbubblewrap update failed (exit {update_exit})")
    sys.exit(1)

# Step 2: bubblewrap build
print("\n" + "=" * 60)
print("STEP 2: bubblewrap build (compiles + signs the APK)")
print("=" * 60)

BUILD_CMD = f"bubblewrap build --manifest {manifest_path}"
child = pexpect.spawn(BUILD_CMD, encoding='utf-8', timeout=900, cwd=WORK_DIR)
child.logfile_read = sys.stdout

try:
    child.expect(r"[Kk]ey store password.*:", timeout=60)
    child.sendline("eswatini123")
    child.expect(r"[Kk]ey password.*:", timeout=30)
    child.sendline("eswatini123")
    print("\n[Building APK (3-5 min)...]")
    child.expect(pexpect.EOF, timeout=900)
    build_exit = child.exitstatus
except pexpect.exceptions.EOF:
    build_exit = child.exitstatus
except pexpect.exceptions.TIMEOUT as e:
    print(f"\n[TIMEOUT: {e}]")
    build_exit = 1

if build_exit != 0:
    print(f"\nbubblewrap build failed (exit {build_exit})")
    sys.exit(1)

# Step 3: Find the APK
print("\n" + "=" * 60)
print("STEP 3: Find and copy APK")
print("=" * 60)

import subprocess
result = subprocess.run(['find', WORK_DIR, '-name', '*.apk', '-type', 'f'], capture_output=True, text=True)
apks = result.stdout.strip().split('\n') if result.stdout.strip() else []
if apks:
    for apk in apks:
        if os.path.exists(apk):
            size_mb = os.path.getsize(apk) / (1024 * 1024)
            print(f"APK found: {apk}")
            print(f"Size: {size_mb:.2f} MB")
            target = '/home/z/my-project/download/Eswatini-Cars.apk'
            shutil.copy(apk, target)
            print(f"Copied to: {target}")
else:
    print("No APK file found!")
    sys.exit(1)
