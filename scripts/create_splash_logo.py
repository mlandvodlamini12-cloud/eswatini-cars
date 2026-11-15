#!/usr/bin/env python3
"""Create a large logo PNG with sky-blue glow for the Android splash.

Instead of a full-screen PNG (which gets stretched/distorted on different
phone aspect ratios), this creates just the LOGO (800x800) with:
- The app icon circular-cropped
- Prominent sky-blue glow (matching the CSS box-shadow: 0 0 40px rgba(56,189,248,0.4))
- Sky-blue border ring (matching 3px solid #38bdf8)

The splash_background.xml then uses a layer-list:
- Navy color fills the entire screen (any size, no stretching)
- This logo PNG is centered on top (no distortion)
"""
from PIL import Image, ImageDraw, ImageFilter
import os

LOGO_PATH = "/home/z/my-project/upload/icon-preview.png"
OUTPUT = "/home/z/my-project/android-apk/app/src/main/res/drawable/splash_logo.png"

SKY_BLUE = (56, 189, 248)  # #38bdf8
SKY_BLUE_GLOW = (14, 165, 233)  # #0ea5e9

# Logo canvas: 800x800 (large enough to fill ~74% of a 1080px screen width)
CANVAS_SIZE = 800
LOGO_SIZE = 600  # the actual icon size
GLOW_RADIUS = 100  # how far the glow extends beyond the logo

# Create transparent canvas
canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))

# Load + resize the app icon
logo = Image.open(LOGO_PATH).convert("RGBA")
logo = logo.resize((LOGO_SIZE, LOGO_SIZE), Image.Resampling.LANCZOS)

# Make the logo circular
mask = Image.new("L", (LOGO_SIZE, LOGO_SIZE), 0)
ImageDraw.Draw(mask).ellipse([(0, 0), (LOGO_SIZE, LOGO_SIZE)], fill=255)
logo_circular = Image.new("RGBA", (LOGO_SIZE, LOGO_SIZE), (0, 0, 0, 0))
logo_circular.paste(logo, (0, 0), mask)

# Create the PROMINENT sky-blue glow (matching CSS box-shadow: 0 0 40px rgba(56,189,248,0.4))
# We create a large circle with the glow color, then blur it heavily
glow_canvas_size = LOGO_SIZE + GLOW_RADIUS * 4
glow = Image.new("RGBA", (glow_canvas_size, glow_canvas_size), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)

# Draw multiple concentric circles with decreasing opacity for a smooth glow
# This matches the CSS box-shadow spread + blur effect
for i in range(GLOW_RADIUS):
    radius = LOGO_SIZE // 2 + GLOW_RADIUS - i
    if radius > 0:
        # Opacity decreases from 100 (inner) to 0 (outer)
        alpha = int(100 * (1 - i / GLOW_RADIUS) ** 2)
        glow_draw.ellipse(
            [(glow_canvas_size // 2 - radius, glow_canvas_size // 2 - radius),
             (glow_canvas_size // 2 + radius, glow_canvas_size // 2 + radius)],
            fill=(*SKY_BLUE, alpha)
        )

# Apply Gaussian blur for a smooth glow
glow = glow.filter(ImageFilter.GaussianBlur(radius=30))

# Create the sky-blue border ring (matching CSS: 3px solid #38bdf8)
# Scale up to 800px canvas: 3px at 120px = ~20px at 800px
border_thickness = 12
border_size = LOGO_SIZE + border_thickness * 2
border_img = Image.new("RGBA", (border_size, border_size), (0, 0, 0, 0))
border_draw = ImageDraw.Draw(border_img)
border_draw.ellipse(
    [(0, 0), (border_size - 1, border_size - 1)],
    outline=(*SKY_BLUE, 255),
    width=border_thickness
)

# Calculate centered positions on the canvas
logo_x = (CANVAS_SIZE - LOGO_SIZE) // 2
logo_y = (CANVAS_SIZE - LOGO_SIZE) // 2
glow_x = (CANVAS_SIZE - glow_canvas_size) // 2
glow_y = (CANVAS_SIZE - glow_canvas_size) // 2
border_x = (CANVAS_SIZE - border_size) // 2
border_y = (CANVAS_SIZE - border_size) // 2

# Composite everything onto the canvas
# 1. Glow (behind everything)
canvas.paste(glow, (glow_x, glow_y), glow)
# 2. Border ring
canvas.paste(border_img, (border_x, border_y), border_img)
# 3. Logo (on top)
canvas.paste(logo_circular, (logo_x, logo_y), logo_circular)

canvas.save(OUTPUT, "PNG", optimize=True)

print(f"Logo PNG saved: {OUTPUT}")
print(f"Canvas: {CANVAS_SIZE}x{CANVAS_SIZE}")
print(f"Logo: {LOGO_SIZE}x{LOGO_SIZE} (circular)")
print(f"Glow: {GLOW_RADIUS}px spread, sky-blue")
print(f"Border: {border_thickness}px solid sky-blue")
print(f"File size: {os.path.getsize(OUTPUT) // 1024} KB")
