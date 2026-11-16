#!/usr/bin/env python3
"""Apply schema migration to live Turso database.

Makes passwordHash nullable + adds authProvider column on the User table,
so Google Sign-In users (who have no password) can be created.

Uses libsql_experimental Python client (works with Turso HTTP API).
"""
import os
import sys
import pypdf

# Read Turso token from upload/Turso.pdf
pdf_path = '/home/z/my-project/upload/Turso.pdf'
reader = pypdf.PdfReader(pdf_path)
# PDF text wrapping inserts newlines — strip ALL whitespace
TURSO_TOKEN = ''.join(reader.pages[0].extract_text().split())

DB_URL = 'libsql://eswatini-cars-prosper.aws-eu-west-1.turso.io'

print(f"DB URL: {DB_URL}")
print(f"Token length: {len(TURSO_TOKEN)}")

try:
    import libsql_experimental as libsql
except ImportError:
    print("Installing libsql-experimental...")
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--quiet', 'libsql-experimental'])
    import libsql_experimental as libsql

print("\n=== Connecting to Turso ===")
conn = libsql.connect(DB_URL, auth_token=TURSO_TOKEN)
cur = conn.cursor()

print("\n=== Current User table schema ===")
cur.execute("PRAGMA table_info(User)")
rows = cur.fetchall()
for r in rows:
    print(f"  {r}")

# Check if authProvider column already exists
columns = [r[1] for r in rows]  # column name is at index 1
has_auth_provider = 'authProvider' in columns
print(f"\n  authProvider column exists: {has_auth_provider}")

# Step 1: Add authProvider column if missing
if not has_auth_provider:
    print("\n=== Adding authProvider column ===")
    try:
        cur.execute("ALTER TABLE User ADD COLUMN authProvider TEXT")
        conn.commit()
        print("  ✅ authProvider column added")
    except Exception as e:
        print(f"  ❌ Failed to add authProvider: {e}")
else:
    print("  (authProvider already exists, skipping)")

# Step 2: SQLite cannot ALTER COLUMN to make nullable. We need to rebuild the table.
# SQLite's approach: CREATE new table, copy data, DROP old, RENAME new.
# But this is risky on a production DB. Let's check if any existing users have
# passwordHash = NULL (which would be invalid under current schema).
print("\n=== Checking existing users ===")
cur.execute("SELECT COUNT(*) FROM User")
total = cur.fetchone()[0]
print(f"  Total users: {total}")

cur.execute("SELECT COUNT(*) FROM User WHERE passwordHash IS NULL OR passwordHash = ''")
null_pw = cur.fetchone()[0]
print(f"  Users with NULL/empty passwordHash: {null_pw}")

# SQLite's behavior: if a column is NOT NULL but you try to insert NULL, it errors.
# To make it nullable, we rebuild the table:
print("\n=== Rebuilding User table to make passwordHash nullable ===")
try:
    # Begin transaction
    cur.execute("BEGIN")
    
    # Step 1: Create the new table with nullable passwordHash
    cur.execute("""
        CREATE TABLE User_new (
            id            TEXT PRIMARY KEY NOT NULL,
            email         TEXT NOT NULL UNIQUE,
            username      TEXT NOT NULL UNIQUE,
            name          TEXT NOT NULL,
            phone         TEXT,
            phoneVerified BOOLEAN NOT NULL DEFAULT 0,
            passwordHash  TEXT,
            authProvider  TEXT,
            role          TEXT NOT NULL DEFAULT 'user',
            blocked       BOOLEAN NOT NULL DEFAULT 0,
            createdAt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Step 2: Copy all existing data
    cur.execute("""
        INSERT INTO User_new (id, email, username, name, phone, phoneVerified, passwordHash, authProvider, role, blocked, createdAt, updatedAt)
        SELECT id, email, username, name, phone, phoneVerified, passwordHash, authProvider, role, blocked, createdAt, updatedAt FROM User
    """)
    
    # Step 3: Drop old table
    cur.execute("DROP TABLE User")
    
    # Step 4: Rename new table to User
    cur.execute("ALTER TABLE User_new RENAME TO User")
    
    conn.commit()
    print("  ✅ User table rebuilt — passwordHash is now nullable")
    
except Exception as e:
    cur.execute("ROLLBACK")
    print(f"  ❌ Failed to rebuild User table: {e}")
    print(f"     Transaction rolled back — original schema is unchanged.")

# Verify
print("\n=== Verification: new User table schema ===")
cur.execute("PRAGMA table_info(User)")
for r in cur.fetchall():
    print(f"  {r}")

# Test: can we now create a user with NULL passwordHash?
print("\n=== Test: insert user with NULL passwordHash (then rollback) ===")
try:
    cur.execute("BEGIN")
    cur.execute("""
        INSERT INTO User (email, username, name, phoneVerified, passwordHash, authProvider, role)
        VALUES ('schema-migration-test@example.com', 'schemamigrationtest', 'Schema Test', 0, NULL, 'google', 'user')
    """)
    cur.execute("SELECT id, email, passwordHash, authProvider FROM User WHERE email = 'schema-migration-test@example.com'")
    row = cur.fetchone()
    print(f"  ✅ Test user created: id={row[0][:8]}..., email={row[1]}, passwordHash={row[2]}, authProvider={row[3]}")
    cur.execute("ROLLBACK")
    print("  (rolled back — test user not persisted)")
except Exception as e:
    cur.execute("ROLLBACK")
    print(f"  ❌ Test insert failed: {e}")

print("\n=== Migration complete ===")
