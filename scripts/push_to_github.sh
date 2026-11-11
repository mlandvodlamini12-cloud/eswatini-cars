#!/usr/bin/env bash
# Push the Eswatini Cars project to GitHub.
#
# BEFORE RUNNING:
#   1. Install gh CLI (or use the pre-installed one at /home/z/.local/bin/gh)
#   2. Run:  gh auth login
#      Choose: GitHub.com → HTTPS → Login with a web browser
#      OR provide a Personal Access Token (PAT) via:
#        echo "ghp_YOUR_TOKEN_HERE" | gh auth login --with-token
#
# WHAT THIS SCRIPT DOES:
#   - Creates a new GitHub repo named 'eswatini-cars' (private by default)
#   - Sets it as the 'origin' remote
#   - Pushes the master branch + all history
#
set -euo pipefail

GH=/home/z/.local/bin/gh
if [ ! -x "$GH" ]; then
  GH=$(which gh 2>/dev/null || echo "")
fi
if [ -z "$GH" ]; then
  echo "ERROR: gh CLI not installed. Install from https://github.com/cli/cli/releases"
  exit 1
fi

# Verify auth
if ! "$GH" auth status >/dev/null 2>&1; then
  echo "ERROR: Not logged in to GitHub."
  echo "Run:  $GH auth login"
  echo "  OR:  echo 'ghp_YOUR_TOKEN' | $GH auth login --with-token"
  exit 1
fi

REPO_NAME="${1:-eswatini-cars}"
VISIBILITY="${2:-private}"   # private | public

cd /home/z/my-project

# Check if origin already exists
if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' already set: $(git remote get-url origin)"
else
  echo "Creating GitHub repo: $REPO_NAME ($VISIBILITY)..."
  "$GH" repo create "$REPO_NAME" --"$VISIBILITY" --source=. --remote=origin --description="Eswatini Cars — Managed vehicle marketplace for Eswatini (Next.js 16 + Turso + Vercel + Android WebView APK)"
fi

echo "Pushing master branch + all history..."
git push -u origin master

echo ""
echo "Push complete."
echo "Repo URL: $("$GH" repo view --json url -q .url)"
