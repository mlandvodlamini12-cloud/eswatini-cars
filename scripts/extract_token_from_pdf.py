"""
Extract the Turso token from the uploaded PDF file and verify character-by-character
"""
import subprocess
import sys

pdf_path = "/home/z/my-project/upload/Turso.pdf"

# Use pdftotext if available, fallback to pypdf
try:
    result = subprocess.run(["pdftotext", "-layout", pdf_path, "-"], capture_output=True, text=True, check=True)
    raw_text = result.stdout
    print("=== Raw PDF text (repr to expose hidden chars) ===")
    print(repr(raw_text))
    print()
except Exception as e:
    print(f"pdftotext failed: {e}")
    sys.exit(1)

# Try pypdf as fallback / cross-check
try:
    from pypdf import PdfReader
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    print("=== pypdf extracted text (repr) ===")
    print(repr(text))
    print()
except Exception as e:
    print(f"pypdf failed: {e}")

# Now extract any token-like string (long base64url with dots)
import re
# JWT pattern: header.payload.signature, each part is base64url
jwt_pattern = re.compile(r'[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+')
matches = jwt_pattern.findall(raw_text)
print(f"=== Found {len(matches)} JWT-like strings ===")
for i, m in enumerate(matches):
    print(f"Match {i+1}: length={len(m)} chars, dots={m.count('.')}")
    print(f"  Value: {m}")
    print()

# Also try removing all whitespace and re-matching
no_ws = re.sub(r'\s+', '', raw_text)
matches2 = jwt_pattern.findall(no_ws)
print(f"=== After whitespace removal: {len(matches2)} JWT-like strings ===")
for i, m in enumerate(matches2):
    if len(m) > 100:
        print(f"Match {i+1}: length={len(m)} chars, dots={m.count('.')}")
        print(f"  Value: {m}")
        print()
