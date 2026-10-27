#!/usr/bin/env python3
"""
Drive Bubblewrap CLI through its interactive prompts using pexpect.
Builds a signed TWA APK from the PWA at magnificent-pastelito-a04324.netlify.app
"""
import os
import sys
import pexpect
import shutil

# Environment
JAVA_HOME = '/usr/lib/jvm/java-21-openjdk-amd64'
os.environ['JAVA_HOME'] = JAVA_HOME
os.environ['PATH'] = f"/home/z/.npm-global/bin:{JAVA_HOME}/bin:/usr/bin:/bin:" + os.environ.get('PATH', '')

WORK_DIR = '/home/z/my-project/android-apk'
MANIFEST = os.path.join(WORK_DIR, 'twa-manifest.json')
ANDROID_SDK_DIR = os.path.join(WORK_DIR, 'android-sdk')

# Bubblewrap CLI command for `update` (downloads Android SDK)
UPDATE_CMD = f"bubblewrap update --manifest {MANIFEST} --jdkPath {JAVA_HOME} --androidFolder {ANDROID_SDK_DIR}"

print("=" * 60)
print("STEP 1: bubblewrap update (downloads Android SDK ~3GB)")
print("=" * 60)

# Spawn with TTY emulation
child = pexpect.spawn(UPDATE_CMD, encoding='utf-8', timeout=900, cwd=WORK_DIR)
child.logfile_read = sys.stdout  # stream output in real-time

try:
    # Prompt 1: "Do you want Bubblewrap to install the JDK?"
    child.expect(r"Do you want Bubblewrap to install the JDK.*\?", timeout=60)
    child.sendline("n")
    print("\n[Sent: n (use existing JDK)]")

    # Prompt 2: "Path to your existing JDK 17:"
    child.expect(r"Path to your existing JDK 17:", timeout=30)
    child.sendline(JAVA_HOME)
    print(f"\n[Sent JDK path: {JAVA_HOME}]")

    # Prompt 3: Accept Android SDK license agreements
    # Bubblewrap will then download Android SDK and Gradle, takes 5-10 min
    print("\n[Waiting for Android SDK download (5-10 min)...]")
    child.expect(pexpect.EOF, timeout=900)
    print("\n[bubblewrap update completed]")
    update_exit = child.exitstatus
    print(f"Exit code: {update_exit}")
except pexpect.exceptions.TIMEOUT as e:
    print(f"\n[TIMEOUT: {e}]")
    print("Output captured so far:")
    print(child.before)
    sys.exit(1)
except pexpect.exceptions.EOF as e:
    print(f"\n[EOF reached unexpectedly]")
    print("Output captured so far:")
    print(child.before)
    sys.exit(1)

if update_exit != 0:
    print(f"\n❌ bubblewrap update failed (exit {update_exit})")
    sys.exit(1)

print("\n" + "=" * 60)
print("STEP 2: bubblewrap build (compiles the APK)")
print("=" * 60)

BUILD_CMD = f"bubblewrap build --manifest {MANIFEST}"

child = pexpect.spawn(BUILD_CMD, encoding='utf-8', timeout=900, cwd=WORK_DIR)
child.logfile_read = sys.stdout

try:
    # The build will ask for keystore password
    # bubblewrap build prompts for the keystore password interactively
    child.expect(r"[Kk]ey store password.*:", timeout=60)
    child.sendline("eswatini123")
    print("\n[Sent keystore password]")

    child.expect(r"[Kk]ey password.*:", timeout=30)
    child.sendline("eswatini123")
    print("\n[Sent key password]")

    print("\n[Building APK (3-5 min)...]")
    child.expect(pexpect.EOF, timeout=900)
    print("\n[bubblewrap build completed]")
    build_exit = child.exitstatus
    print(f"Exit code: {build_exit}")
except pexpect.exceptions.TIMEOUT as e:
    print(f"\n[TIMEOUT: {e}]")
    print("Output captured so far:")
    print(child.before)
    sys.exit(1)
except pexpect.exceptions.EOF as e:
    # Maybe build didn't ask for password (some versions skip)
    print("\n[EOF reached (no password prompt)]")
    print("Output captured:")
    print(child.before)
    build_exit = child.exitstatus

if build_exit != 0:
    print(f"\n❌ bubblewrap build failed (exit {build_exit})")
    sys.exit(1)

# Find the APK file
print("\n" + "=" * 60)
print("STEP 3: Find generated APK")
print("=" * 60)
import subprocess
result = subprocess.run(['find', WORK_DIR, '-name', '*.apk', '-type', 'f'], capture_output=True, text=True)
apks = result.stdout.strip().split('\n') if result.stdout.strip() else []
if apks:
    for apk in apks:
        if os.path.exists(apk):
            size_mb = os.path.getsize(apk) / (1024 * 1024)
            print(f"✅ APK found: {apk}")
            print(f"   Size: {size_mb:.2f} MB")
            # Copy to download folder
            target = '/home/z/my-project/download/eswatini-cars.apk'
            shutil.copy(apk, target)
            print(f"✅ Copied to: {target}")
else:
    print("❌ No APK file found")
    print("Looking for output directories...")
    subprocess.run(['find', WORK_DIR, '-name', 'app-release*', '-o', '-name', 'output.apk'], cwd=WORK_DIR)
    sys.exit(1)
