"""Generate all PWA icon sizes from the user's uploaded logo."""
from PIL import Image
import os

SOURCE = "/home/z/my-project/upload/icon-preview.png"
OUT_DIR = "/home/z/my-project/public/icons"

SIZES = [
    (192, 192, "icon-192.png"),
    (512, 512, "icon-512.png"),
    (180, 180, "apple-touch-icon.png"),  # iOS
    (32, 32, "favicon-32.png"),
    (16, 16, "favicon-16.png"),
]

# Maskable icons need padding (safe zone = 80% of canvas)
MASKABLE_SIZES = [
    (192, 192, "maskable-192.png"),
    (512, 512, "maskable-512.png"),
]

# Open source and convert to RGBA for proper alpha handling
img = Image.open(SOURCE).convert("RGBA")

# Also save the full-size source as icon-1024 (scaled down from 1254)
img_1024 = img.resize((1024, 1024), Image.LANCZOS)
img_1024.save(os.path.join(OUT_DIR, "icon-1024.png"), "PNG")
print(f"✓ icon-1024.png (1024x1024) [source]")

# Standard icons
for w, h, name in SIZES:
    resized = img.resize((w, h), Image.LANCZOS)
    out = os.path.join(OUT_DIR, name)
    resized.save(out, "PNG")
    print(f"✓ {name} ({w}x{h})")

# Maskable icons (with padding on a navy background for safe zone)
NAVY = (10, 24, 52, 255)  # #0a1834
for w, h, name in MASKABLE_SIZES:
    canvas = Image.new("RGBA", (w, h), NAVY)
    # Scale source to 80% of canvas (safe zone)
    inner_w = int(w * 0.8)
    inner_h = int(h * 0.8)
    inner = img.resize((inner_w, inner_h), Image.LANCZOS)
    # Center it
    offset = ((w - inner_w) // 2, (h - inner_h) // 2)
    canvas.paste(inner, offset, inner)
    out = os.path.join(OUT_DIR, name)
    canvas.save(out, "PNG")
    print(f"✓ {name} ({w}x{h}) [maskable]")

# Favicon (ICO format)
fav = img.resize((32, 32), Image.LANCZOS)
fav.save(os.path.join(OUT_DIR, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print(f"✓ favicon.ico")

print(f"\nAll icons saved to {OUT_DIR}")
