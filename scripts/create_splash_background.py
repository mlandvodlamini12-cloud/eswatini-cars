#!/usr/bin/env python3
"""Create a full-screen splash PNG for the Android app.

The image is 1080x1920 (portrait phone screen) with:
- Navy background (#0a1834) filling the entire image
- The app logo centered, large (500x500), circular crop
- Sky-blue (#38bdf8) glowing border around the logo
- Soft glow effect behind the logo

This image is used as the windowBackground in the Android theme.
When the app launches, this fills the entire screen — no white flash,
no tiny icon. The WebView then loads on top of it seamlessly.
"""
from PIL import Image, ImageDraw, ImageFilter
import os

LOGO_PATH = "/home/z/my-project/upload/icon-preview.png"
OUTPUT = "/home/z/my-project/android-apk/app/src/main/res/drawable/splash_background.png"

# Canvas dimensions (1080x1920 is standard phone resolution)
W, H = 1080, 1920
NAVY = (10, 24, 52)  # #0a1834
SKY_BLUE = (56, 189, 248)  # #38bdf8
SKY_BLUE_GLOW = (14, 165, 233)  # #0ea5e9

# Create the navy background
canvas = Image.new("RGBA", (W, H), NAVY)

# Load + process the logo
logo = Image.open(LOGO_PATH).convert("RGBA")
logo_size = 500  # large — fills ~46% of screen width
logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

# Make the logo circular
mask = Image.new("L", (logo_size, logo_size), 0)
ImageDraw.Draw(mask).ellipse([(0, 0), (logo_size, logo_size)], fill=255)
logo_circular = Image.new("RGBA", (logo_size, logo_size), (0, 0, 0, 0))
logo_circular.paste(logo, (0, 0), mask)

# Create the glow effect behind the logo
glow_size = int(logo_size * 1.8)  # 900px — much larger than the logo
glow = Image.new("RGBA", (glow_size, glow_size), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
# Multiple concentric circles with decreasing opacity for a soft glow
for i in range(20):
    radius = glow_size // 2 - i * 15
    if radius > 0:
        alpha = int(8 * (1 - i / 20))
        glow_draw.ellipse(
            [(glow_size // 2 - radius, glow_size // 2 - radius),
             (glow_size // 2 + radius, glow_size // 2 + radius)],
            fill=(*SKY_BLUE_GLOW, alpha)
        )
glow = glow.filter(ImageFilter.GaussianBlur(radius=40))

# Create the sky-blue border ring around the logo
border_thickness = 8
border_img = Image.new("RGBA", (logo_size + border_thickness * 2, logo_size + border_thickness * 2), (0, 0, 0, 0))
border_draw = ImageDraw.Draw(border_img)
border_draw.ellipse(
    [(0, 0), (logo_size + border_thickness * 2 - 1, logo_size + border_thickness * 2 - 1)],
    outline=(*SKY_BLUE, 200),
    width=border_thickness
)

# Calculate centered positions
logo_x = (W - logo_size) // 2
logo_y = (H - logo_size) // 2
glow_x = (W - glow_size) // 2
glow_y = (H - glow_size) // 2
border_x = logo_x - border_thickness
border_y = logo_y - border_thickness

# Composite everything onto the canvas
# 1. Glow (behind everything)
canvas.paste(glow, (glow_x, glow_y), glow)
# 2. Border ring
canvas.paste(border_img, (border_x, border_y), border_img)
# 3. Logo (on top)
canvas.paste(logo_circular, (logo_x, logo_y), logo_circular)

# Convert to RGB (Android drawable doesn't need alpha for a full-screen background)
canvas = canvas.convert("RGB")
canvas.save(OUTPUT, "PNG", optimize=True)

print(f"Splash background saved: {OUTPUT}")
print(f"Size: {W}x{H}")
print(f"File size: {os.path.getsize(OUTPUT) // 1024} KB")
