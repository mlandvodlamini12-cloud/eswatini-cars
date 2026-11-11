#!/usr/bin/env python3
"""Generate staging app icons with a yellow 'TEST' badge.

The staging flavor has its own source set at:
  android-apk/app/src/staging/res/mipmap-*/

This script generates icons there (separate from the production icons
at app/src/main/res/mipmap-*/) so the staging APK shows a different
icon — the production logo + a yellow 'TEST' badge in the corner.

Both icon sets use the same source image (upload/icon-preview.png).
"""
import os
from PIL import Image, ImageDraw, ImageFont

SRC = "/home/z/my-project/upload/icon-preview.png"
DST_BASE = "/home/z/my-project/android-apk/app/src/staging/res"

SIZES = {
    "mipmap-mdpi":    48,
    "mipmap-hdpi":    72,
    "mipmap-xhdpi":   96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi":192,
}

src_img = Image.open(SRC).convert("RGBA")
print(f"Source: {src_img.size}")

def add_test_badge(img):
    """Add a yellow 'TEST' badge in the top-right corner."""
    w, h = img.size
    # Badge size = 40% of icon width
    badge_w = int(w * 0.55)
    badge_h = int(h * 0.28)
    # Position: top-right corner
    pos = (w - badge_w, 0)
    # Yellow rectangle with red border
    badge = Image.new("RGBA", (badge_w, badge_h), (255, 200, 0, 255))
    img.paste(badge, pos, badge)
    # Draw "TEST" text in black, centered on the badge
    draw = ImageDraw.Draw(img)
    # Try a default font, fall back to load_default
    font_size = int(badge_h * 0.7)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()
    text = "TEST"
    # Get text bounding box (using newer API)
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
    except AttributeError:
        # Older PIL fallback
        text_w, text_h = draw.textsize(text, font=font)
    text_x = pos[0] + (badge_w - text_w) // 2
    text_y = pos[1] + (badge_h - text_h) // 2
    draw.text((text_x, text_y), text, fill=(0, 0, 0, 255), font=font)
    return img

for folder, size in SIZES.items():
    out_dir = os.path.join(DST_BASE, folder)
    os.makedirs(out_dir, exist_ok=True)
    # Resize the source icon
    resized = src_img.resize((size, size), Image.Resampling.LANCZOS)
    # Add the TEST badge
    badged = add_test_badge(resized.copy())
    for name in ("ic_launcher.png", "ic_launcher_round.png"):
        out_path = os.path.join(out_dir, name)
        badged.save(out_path, format="PNG", optimize=True)
        print(f"  Wrote: {out_path} ({size}x{size})")

print("\nStaging icons (with TEST badge) generated.")
