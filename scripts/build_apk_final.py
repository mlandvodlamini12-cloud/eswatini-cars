#!/usr/bin/env python3
"""Build signed APK — handles prompts flexibly."""
import os, sys, pexpect, shutil, subprocess

JAVA_HOME = '/tmp/jdk-17.0.21+9'
os.environ['JAVA_HOME'] = JAVA_HOME
os.environ['PATH'] = f"/home/z/.npm-global/bin:{JAVA_HOME}/bin:/usr/bin:/bin:" + os.environ.get('PATH', '')

WORK_DIR = '/home/z/my-project/android-apk'
MANIFEST = os.path.join(WORK_DIR, 'twa-manifest.json')

# Step 1: bubblewrap update
print("=" * 60)
print("STEP 1: bubblewrap update")
print("=" * 60, flush=True)

cmd = f"bubblewrap update --manifest {MANIFEST} --jdkPath {JAVA_HOME}"
child = pexpect.spawn(cmd, encoding='utf-8', timeout=900, cwd=WORK_DIR)
child.logfile_read = sys.stdout

try:
    while True:
        idx = child.expect([
            r"install the JDK.*\?",
            r"Path to your existing JDK 17:",
            r"install the Android SDK.*\?",
            r"Accept the Android SDK license",
            r"(?i)y/n",
            pexpect.EOF,
            pexpect.TIMEOUT,
        ], timeout=900)

        if idx == 0:  # Install JDK?
            child.sendline("n")
            print("\n[Sent: n (use existing JDK)]", flush=True)
        elif idx == 1:  # JDK path
            child.sendline(JAVA_HOME)
            print(f"\n[Sent JDK path]", flush=True)
        elif idx == 2:  # Install Android SDK?
            child.sendline("y")
            print("\n[Sent: y (install SDK)]", flush=True)
        elif idx == 3:  # Accept license?
            child.sendline("y")
            print("\n[Sent: y (accept license)]", flush=True)
        elif idx == 4:  # Generic y/n
            child.sendline("y")
            print("\n[Sent: y]", flush=True)
        elif idx == 5:  # EOF
            break
        elif idx == 6:  # TIMEOUT
            print("\n[Timeout waiting for prompt]", flush=True)
            break

    update_exit = child.exitstatus or 0
    print(f"\n[Update exit: {update_exit}]", flush=True)
except Exception as e:
    print(f"\n[Error: {e}]", flush=True)
    update_exit = 1

if update_exit != 0:
    print(f"Update failed, but continuing to build...", flush=True)

# Step 2: bubblewrap build
print("\n" + "=" * 60)
print("STEP 2: bubblewrap build")
print("=" * 60, flush=True)

cmd = f"bubblewrap build --manifest {MANIFEST}"
child = pexpect.spawn(cmd, encoding='utf-8', timeout=900, cwd=WORK_DIR)
child.logfile_read = sys.stdout

try:
    while True:
        idx = child.expect([
            r"[Kk]ey store password.*:",
            r"[Kk]ey password.*:",
            r"(?i)y/n",
            pexpect.EOF,
            pexpect.TIMEOUT,
        ], timeout=900)

        if idx == 0:  # Keystore password
            child.sendline("eswatini123")
            print("\n[Sent keystore password]", flush=True)
        elif idx == 1:  # Key password
            child.sendline("eswatini123")
            print("\n[Sent key password]", flush=True)
        elif idx == 2:  # Generic y/n
            child.sendline("y")
            print("\n[Sent: y]", flush=True)
        elif idx == 3:  # EOF
            break
        elif idx == 4:  # TIMEOUT
            break

    build_exit = child.exitstatus or 0
    print(f"\n[Build exit: {build_exit}]", flush=True)
except Exception as e:
    print(f"\n[Error: {e}]", flush=True)
    build_exit = 1

# Step 3: Find APK
print("\n" + "=" * 60)
print("STEP 3: Find APK")
print("=" * 60, flush=True)

result = subprocess.run(['find', WORK_DIR, '-name', '*.apk', '-type', 'f'], capture_output=True, text=True)
apks = result.stdout.strip().split('\n') if result.stdout.strip() else []
if apks and apks[0]:
    for apk in apks:
        if os.path.exists(apk):
            size_mb = os.path.getsize(apk) / (1024 * 1024)
            print(f"✅ APK: {apk} ({size_mb:.2f} MB)", flush=True)
            target = '/home/z/my-project/download/Eswatini-Cars.apk'
            shutil.copy(apk, target)
            print(f"✅ Copied to: {target}", flush=True)
            print(f"\n{'='*60}")
            print(f"  ✅ APK BUILD COMPLETE!")
            print(f"{'='*60}")
else:
    print("❌ No APK found", flush=True)
    # Check what was built
    subprocess.run(['find', WORK_DIR, '-name', '*.apk', '-o', '-name', '*.aab'], cwd=WORK_DIR)
