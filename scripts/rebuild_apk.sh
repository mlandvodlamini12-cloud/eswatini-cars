#!/usr/bin/env bash
# Rebuild the Eswatini Cars Android APK from scratch.
# Safe to run after a sandbox recycle — re-downloads JDK + Android SDK if missing,
# and recovers the keystore from Vercel encrypted env vars if missing.
#
# Outputs:
#   /home/z/my-project/download/Eswatini-Cars.apk  (signed, ready to install)
#
# Prerequisites:
#   - Network access (downloads ~600MB on first run: JDK 17 + Android SDK)
#   - EITHER /home/z/my-project/android.keystore (locally present)
#     OR     Vercel env vars APK_KEYSTORE_BASE64 + APK_KEYSTORE_PASSWORD +
#            APK_KEY_ALIAS + APK_KEY_PASSWORD (encrypted at rest on Vercel)
#     OR     VERCEL_TOKEN env var (to fetch the keystore from Vercel)
#
set -euo pipefail

PROJECT_DIR=/home/z/my-project/android-apk
DOWNLOAD_DIR=/home/z/my-project/download
KEYSTORE=/home/z/my-project/android.keystore
ALIAS=ec-signing
STOREPASS=eswatini123

# === Vercel project info (for keystore recovery) ===
VERCEL_TEAM_ID=${VERCEL_TEAM_ID:-team_kaqwxaOEa2FvSVHo3n9sSYOO}
VERCEL_PROJECT_ID=${VERCEL_PROJECT_ID:-prj_j8kRtTXmiUqdiiZ85BdexeOqAGRt}

# === Recover keystore from Vercel if missing ===
if [ ! -f "$KEYSTORE" ]; then
  echo "[0/5] Keystore missing — recovering from Vercel encrypted env vars..."
  if [ -z "${VERCEL_TOKEN:-}" ]; then
    echo "ERROR: $KEYSTORE is missing and VERCEL_TOKEN is not set."
    echo "Either:"
    echo "  1. Re-upload the android.keystore file to /home/z/my-project/"
    echo "  2. Set VERCEL_TOKEN env var so this script can fetch it from Vercel"
    exit 1
  fi
  # List env vars to find the IDs (Vercel API requires ID, not key name, for decrypt)
  echo "  Looking up APK_KEYSTORE_BASE64 env var ID..."
  KEYSTORE_ENV_ID=$(curl -sS -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID/env?teamId=$VERCEL_TEAM_ID" \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d.get('envs', []):
    if e.get('key') == 'APK_KEYSTORE_BASE64':
        print(e['id'])
        break
")
  if [ -z "$KEYSTORE_ENV_ID" ]; then
    echo "ERROR: APK_KEYSTORE_BASE64 env var not found on Vercel."
    exit 1
  fi
  # Fetch the decrypted value
  echo "  Fetching + decrypting keystore (id=$KEYSTORE_ENV_ID)..."
  KEYSTORE_B64=$(curl -sS -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID/env/$KEYSTORE_ENV_ID?decrypt=true&teamId=$VERCEL_TEAM_ID" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('value',''))")
  if [ -z "$KEYSTORE_B64" ]; then
    echo "ERROR: Could not decrypt APK_KEYSTORE_BASE64 from Vercel."
    exit 1
  fi
  echo "  Decoding base64 → $KEYSTORE..."
  echo "$KEYSTORE_B64" | base64 -d > "$KEYSTORE"
  chmod 600 "$KEYSTORE"
  # Also fetch the password + alias by looking up their IDs
  for envkey in APK_KEYSTORE_PASSWORD APK_KEY_ALIAS; do
    envid=$(curl -sS -H "Authorization: Bearer $VERCEL_TOKEN" \
      "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID/env?teamId=$VERCEL_TEAM_ID" \
      | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d.get('envs', []):
    if e.get('key') == '$envkey':
        print(e['id'])
        break
")
    val=$(curl -sS -H "Authorization: Bearer $VERCEL_TOKEN" \
      "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID/env/$envid?decrypt=true&teamId=$VERCEL_TEAM_ID" \
      | python3 -c "import sys,json; print(json.load(sys.stdin).get('value',''))")
    case "$envkey" in
      APK_KEYSTORE_PASSWORD) STOREPASS="$val" ;;
      APK_KEY_ALIAS)         ALIAS="$val" ;;
    esac
  done
  echo "  ✅ Keystore recovered (alias=$ALIAS, $(wc -c < "$KEYSTORE") bytes)"
fi

# === JDK 17 (Temurin) ===
JDK_DIR=/home/z/jdk17
if [ ! -x "$JDK_DIR/bin/jlink" ]; then
  echo "[1/5] Downloading Temurin JDK 17..."
  curl -fsSL -o /tmp/jdk17.tar.gz \
    "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jdk_x64_linux_hotspot_17.0.13_11.tar.gz"
  rm -rf "$JDK_DIR" && mkdir -p "$JDK_DIR"
  tar -xzf /tmp/jdk17.tar.gz -C "$JDK_DIR" --strip-components=1
  rm /tmp/jdk17.tar.gz
fi
export JAVA_HOME="$JDK_DIR"
export PATH="$JAVA_HOME/bin:$PATH"
echo "  JDK: $(java -version 2>&1 | head -1)"

# === Android SDK ===
SDK_DIR=/home/z/android-sdk
if [ ! -x "$SDK_DIR/build-tools/34.0.0/apksigner" ]; then
  echo "[2/5] Installing Android SDK + build-tools 34..."
  mkdir -p "$SDK_DIR/cmdline-tools"
  if [ ! -x "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" ]; then
    rm -rf "$SDK_DIR/cmdline-tools/latest" "$SDK_DIR/cmdline-tools/cmdline-tools"
    curl -fsSL -o /tmp/cmdline-tools.zip \
      "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    unzip -q /tmp/cmdline-tools.zip -d "$SDK_DIR/cmdline-tools/"
    mv "$SDK_DIR/cmdline-tools/cmdline-tools" "$SDK_DIR/cmdline-tools/latest"
    rm /tmp/cmdline-tools.zip
  fi
  export ANDROID_HOME="$SDK_DIR"
  yes | "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null 2>&1 || true
  "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" \
    "platform-tools" "platforms;android-34" "build-tools;34.0.0" >/dev/null 2>&1
fi
export ANDROID_HOME="$SDK_DIR"
ZIPALIGN="$SDK_DIR/build-tools/34.0.0/zipalign"
APKSIGNER="$SDK_DIR/build-tools/34.0.0/apksigner"

# === local.properties ===
echo "sdk.dir=$SDK_DIR" > "$PROJECT_DIR/local.properties"

# === Build ===
echo "[3/5] Building unsigned release APK with Gradle..."
cd "$PROJECT_DIR"
./gradlew assembleRelease --no-daemon

UNSIGNED="$PROJECT_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
ALIGNED=/tmp/app-release-aligned.apk
SIGNED="$DOWNLOAD_DIR/Eswatini-Cars.apk"

if [ ! -f "$UNSIGNED" ]; then
  echo "ERROR: unsigned APK not found at $UNSIGNED"
  exit 1
fi

# === zipalign ===
echo "[4/5] zipalign..."
rm -f "$ALIGNED"
"$ZIPALIGN" -f 4 "$UNSIGNED" "$ALIGNED"

# === Sign ===
echo "[5/5] Signing with android.keystore (alias=$ALIAS)..."
mkdir -p "$DOWNLOAD_DIR"
"$APKSIGNER" sign \
  --ks "$KEYSTORE" --ks-key-alias "$ALIAS" \
  --ks-pass "pass:$STOREPASS" --key-pass "pass:$STOREPASS" \
  --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true \
  --out "$SIGNED" "$ALIGNED"

rm -f "$SIGNED.idsig"

echo ""
echo "=========================================="
echo " APK BUILD COMPLETE"
echo "=========================================="
echo " File:        $SIGNED"
echo " Size:        $(du -h "$SIGNED" | cut -f1)"
echo " Package:     sz.co.eswatinicars.app"
echo " Version:     1.0.6 (code 7)"
echo ""
echo " Certificate fingerprints:"
"$APKSIGNER" verify --print-certs "$SIGNED" 2>&1 | grep -E "SHA-1|SHA-256"
echo "=========================================="
