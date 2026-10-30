#!/usr/bin/env python3
"""Replace the createPortal-based legal modal with a standalone Radix Dialog."""

import re

FILE = '/home/z/my-project/src/app/page.tsx'

with open(FILE, 'r') as f:
    content = f.read()

# Find the block that starts with the createPortal comment and ends with the closing )} + document.body
# The block starts at: "      {/* Use createPortal to render the legal modal at document.body level."
# The block ends at: "        document.body\n      )}"

# Find start
start_marker = "      {/* Use createPortal to render the legal modal at document.body level."
start_idx = content.find(start_marker)
if start_idx == -1:
    # Try the earlier comment block
    start_marker = "      {/*\n        IN-DIALOG LEGAL MODAL"
    start_idx = content.find(start_marker)

if start_idx == -1:
    print("ERROR: Could not find start of legal modal block")
    exit(1)

# Find end — search for "document.body\n      )}" after start_idx
end_marker = "        document.body\n      )}"
end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print("ERROR: Could not find end of legal modal block")
    exit(1)

end_idx = end_idx + len(end_marker)

print(f"Replacing block from char {start_idx} to {end_idx} ({end_idx - start_idx} chars)")

# The new replacement: a clean standalone Radix Dialog
NEW_BLOCK = '''      {/* LEGAL MODAL — standalone Dialog for T&C / Privacy Policy.
          Opens when the user taps "Terms & Conditions" or "Privacy Policy"
          in the registration form. The registration dialog is closed FIRST
          (setShowRegister(false)) so there's only ONE dialog open at a time —
          this completely avoids the Radix focus-trap conflict that froze
          nested modals on mobile.

          When this dialog closes, the registration dialog reopens automatically
          (setShowRegister(true)), with all form state preserved because it's
          in React state (registerForm, agreedToTerms, phoneVerifyStep, etc.),
          not DOM state. */}
      <Dialog
        open={!!legalModal}
        onOpenChange={(open) => {
          if (!open) {
            setLegalModal(null)
            // Reopen the registration dialog — form state is preserved
            // because it lives in React state, not in the DOM.
            setShowRegister(true)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-500" />
              {legalModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
            <p className="text-xs text-slate-500">Last updated: 30 October 2026</p>'''

# Now we need to extract the content from the old block (the T&C and Privacy Policy text)
# and keep it, just changing the wrapper.

# Actually, the simplest approach: the old block already has all the content.
# I just need to replace the outer wrapper (the div overlay + createPortal)
# with a Radix Dialog, and replace the inner structure.

# Let me find the content section (the {legalModal === 'terms' ? (...) : (...)}) and the footer
# and reuse them inside the new Dialog.

# Find the content start
content_start = content.find("{legalModal === 'terms' ? (", start_idx)
content_end = content.find("            {/* Modal footer", start_idx)

if content_start == -1 or content_end == -1:
    print("ERROR: Could not find content section")
    exit(1)

# Extract the content
old_content = content[content_start:content_end]

# The footer (Close button)
footer = '''            <div className="flex justify-end pt-4">
              <Button
                className="bg-sky-500 text-white hover:bg-sky-400"
                onClick={() => {
                  setLegalModal(null)
                  setShowRegister(true)
                }}
              >
                Close
              </Button>
            </div>'''

# Build the new block
NEW_BLOCK_FULL = NEW_BLOCK + '\n' + old_content + '\n          </div>\n' + footer + '\n        </DialogContent>\n      </Dialog>'

# Replace
new_content = content[:start_idx] + NEW_BLOCK_FULL + content[end_idx:]

with open(FILE, 'w') as f:
    f.write(new_content)

print(f"Done! Replaced {end_idx - start_idx} chars with {len(NEW_BLOCK_FULL)} chars")
