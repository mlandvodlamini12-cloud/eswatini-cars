#!/usr/bin/env python3
"""Clean up test users created during deployment verification."""
import sys
import pypdf

reader = pypdf.PdfReader('/home/z/my-project/upload/Turso.pdf')
TURSO_TOKEN = ''.join(reader.pages[0].extract_text().split())
DB_URL = 'libsql://eswatini-cars-prosper.aws-eu-west-1.turso.io'

try:
    import libsql_experimental as libsql
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--quiet', 'libsql-experimental'])
    import libsql_experimental as libsql

try:
    conn = libsql.connect(DB_URL, auth_token=TURSO_TOKEN)
    cur = conn.cursor()
    cur.execute("DELETE FROM User WHERE email LIKE '%test-apk%' OR email LIKE '%schema-migration-test%'")
    deleted = cur.rowcount
    conn.commit()
    print(f"Deleted {deleted} test user(s)")
except Exception as e:
    print(f"Cleanup failed (expected if Turso token is invalid): {e}")
    print("Test users will need manual cleanup via Turso CLI or dashboard.")
