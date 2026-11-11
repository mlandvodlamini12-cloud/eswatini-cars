#!/usr/bin/env bash
# Rebuild the Eswatini Cars Android APK from scratch.
# Safe to run after a sandbox recycle — re-downloads JDK + Android SDK if missing,
# and recovers the keystore from Vercel encrypted env vars if missing.
#
# Usage:
#   bash scripts/rebuild_apk.sh             # builds PRODUCTION flavor (default)
#   bash scripts/rebuild_apk.sh production  # builds PRODUCTION flavor explicitly
#   bash scripts/rebuild_apk.sh staging     # builds STAGING flavor (test app)
#
# Outputs:
#   production → /home/z/my-project/download/Eswatini-Cars.apk
#   staging    → /home/z/my-project/download/Eswatini-Cars-TEST.apk
#
# Prerequisites:
#   - Network access (downloads ~600MB on first run: JDK 17 + Android SDK)
#   - EITHER /home/z/my-project/android.keystore (locally present)
#     OR     Vercel env vars APK_KEYSTORE_BASE64 + APK_KEYSTORE_PASSWORD +
#            APK_KEY_ALIAS + APK_KEY_PASSWORD (encrypted at rest on Vercel)
#     OR     VERCEL_TOKEN env var (to fetch the keystore from Vercel)
#
set -euo pipefail

# === Flavor argument (production | staging) ===
FLAVOR="${1:-production}"
if [ "$FLAVOR" != "production" ] && [ "$FLAVOR" != "staging" ]; then
  echo "ERROR: flavor must be 'production' or 'staging' (got: $FLAVOR)"
  exit 1
fi
# Capitalize first letter for Gradle task name (production → Production)
FLAVOR_CAP="$(printf '%s' "$FLAVOR" | sed 's/^./\U&/')"

echo "========================================"
echo " Building APK — flavor: $FLAVOR"
echo "========================================"

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

# === Safety check: refuse to build if there are uncommitted changes ===
# This prevents a dangerous race condition:
#   1. I edit MainActivity.java (uncommitted)
#   2. I build staging APK (uses the uncommitted change)
#   3. Sandbox recycles → uncommitted change is GONE
#   4. I build production APK → uses the LAST COMMITTED code (without the change!)
#   5. Production ships different code than what was tested
# By refusing to build with uncommitted changes, we force a commit before any build,
# which means the code is safely in git + GitHub and survives any recycling.
cd /home/z/my-project
if [ -n "$(git status --porcelain)" ]; then
  echo "========================================"
  echo " ❌ REFUSING TO BUILD: uncommitted changes detected"
  echo "========================================"
  echo ""
  echo "The working tree has uncommitted changes:"
  git status --short
  echo ""
  echo "This is a safety check to prevent the race condition where:"
  echo "  1. A staging APK is built with an uncommitted change"
  echo "  2. The sandbox recycles (wiping the uncommitted change)"
  echo "  3. A production APK is built from the last commit (without the change)"
  echo "  4. Production ships different code than what was tested"
  echo ""
  echo "Fix: commit + push FIRST, then rebuild."
  echo "  git add -A && git commit -m '...' && git push origin main"
  echo "  bash scripts/rebuild_apk.sh $FLAVOR"
  exit 1
fi

# Also verify we're on the correct branch for the flavor
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$FLAVOR" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
  echo "========================================"
  echo " ❌ REFUSING TO BUILD: wrong branch for production"
  echo "========================================"
  echo ""
  echo "Production APKs must be built from the 'main' branch."
  echo "Currently on branch: '$CURRENT_BRANCH'"
  echo ""
  echo "Fix: git checkout main && git pull origin main"
  exit 1
fi
if [ "$FLAVOR" = "staging" ] && [ "$CURRENT_BRANCH" != "staging" ] && [ "$CURRENT_BRANCH" != "main" ]; then
  echo "========================================"
  echo " ⚠ WARNING: building staging from branch '$CURRENT_BRANCH'"
  echo "========================================"
  echo "Staging APKs are normally built from 'staging' or 'main'."
  echo "Currently on branch: '$CURRENT_BRANCH'"
  echo "Continuing in 3 seconds... (Ctrl+C to cancel)"
  sleep 3
fi

# Print the git commit SHA being built (for traceability)
GIT_SHA=$(git rev-parse HEAD)
GIT_SHA_SHORT=$(git rev-parse --short HEAD)
echo ""
echo "========================================"
echo " Building from git commit: $GIT_SHA_SHORT"
echo " Full SHA: $GIT_SHA"
echo " Branch: $CURRENT_BRANCH"
echo "========================================"
echo ""

# === Build ===
echo "[3/5] Building unsigned ${FLAVOR} release APK with Gradle..."
cd "$PROJECT_DIR"
./gradlew "assemble${FLAVOR_CAP}Release" --no-daemon

# Flavor-specific output paths
UNSIGNED="$PROJECT_DIR/app/build/outputs/apk/${FLAVOR}/release/app-${FLAVOR}-release-unsigned.apk"
ALIGNED=/tmp/app-${FLAVOR}-release-aligned.apk
if [ "$FLAVOR" = "production" ]; then
  SIGNED="$DOWNLOAD_DIR/Eswatini-Cars.apk"
else
  SIGNED="$DOWNLOAD_DIR/Eswatini-Cars-TEST.apk"
fi

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
echo " APK BUILD COMPLETE — flavor: $FLAVOR"
echo "=========================================="
echo " File:        $SIGNED"
echo " Size:        $(du -h "$SIGNED" | cut -f1)"
echo " Git commit:  $GIT_SHA_SHORT"
echo " Git branch:  $CURRENT_BRANCH"
if [ "$FLAVOR" = "production" ]; then
  echo " Package:     sz.co.eswatinicars.app"
  echo " App name:    Eswatini Cars"
  echo " Loads:       https://eswatini-cars.vercel.app/"
else
  echo " Package:     sz.co.eswatinicars.app.staging"
  echo " App name:    EC [TEST]"
  echo " Loads:       https://eswatini-cars-git-staging-eswatini-cars.vercel.app/"
  echo ""
  echo " ⚠ This is a TEST build — installs alongside the production app."
  echo "   Do NOT distribute to end users."
fi
echo ""
echo " Certificate fingerprints:"
"$APKSIGNER" verify --print-certs "$SIGNED" 2>&1 | grep -E "SHA-1|SHA-256"
echo ""
echo "=========================================="
echo " TRACEABILITY"
echo "=========================================="
echo " This APK was built from git commit $GIT_SHA_SHORT"
echo " Full SHA: $GIT_SHA"
echo " Branch:   $CURRENT_BRANCH"
echo ""
echo " To verify what code is in this APK:"
echo "   git show $GIT_SHA_SHORT --stat"
echo "   git log --oneline $GIT_SHA_SHORT -5"
echo "=========================================="
