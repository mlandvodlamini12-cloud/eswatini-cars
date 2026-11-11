#!/usr/bin/env python3
"""Generate Android launcher icons (mipmap-*) from the glossy badge logo.

The Android Gradle project expects:
  res/mipmap-anydpi-v26/ic_launcher.xml       (adaptive icon descriptor)
  res/mipmap-anydpi-v26/ic_launcher_round.xml
  res/drawable/ic_launcher_background.xml    (vector color)
  res/drawable/ic_launcher_foreground.xml    (vector — but we use a PNG bitmap)
  res/drawable-v24/ic_launcher_foreground.png (foreground PNG, 108dp)

For simplicity we generate a single bitmap launcher that works on all densities:
  res/mipmap-mdpi/ic_launcher.png       (48x48)
  res/mipmap-hdpi/ic_launcher.png       (72x72)
  res/mipmap-xhdpi/ic_launcher.png      (96x96)
  res/mipmap-xxhdpi/ic_launcher.png     (144x144)
  res/mipmap-xxxhdpi/ic_launcher.png    (192x192)
"""
import os
from PIL import Image

SRC = "/home/z/my-project/upload/icon-preview.png"
DST_BASE = "/home/z/my-project/android-apk/app/src/main/res"

SIZES = {
    "mipmap-mdpi":    48,
    "mipmap-hdpi":    72,
    "mipmap-xhdpi":   96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi":192,
}

src_img = Image.open(SRC).convert("RGBA")
print(f"Source: {src_img.size}")

for folder, size in SIZES.items():
    out_dir = os.path.join(DST_BASE, folder)
    os.makedirs(out_dir, exist_ok=True)
    # Use LANCZOS for downscaling quality
    resized = src_img.resize((size, size), Image.Resampling.LANCZOS)
    # Save as ic_launcher.png AND ic_launcher_round.png (same image, Android
    # accepts a square PNG as the round icon too)
    for name in ("ic_launcher.png", "ic_launcher_round.png"):
        out_path = os.path.join(out_dir, name)
        resized.save(out_path, format="PNG", optimize=True)
        print(f"  Wrote: {out_path} ({size}x{size})")

print("\nAll launcher icons generated.")
