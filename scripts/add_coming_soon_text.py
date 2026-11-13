#!/usr/bin/env python3
"""Add 'Coming Soon' text overlays to the two intro images.

No app name mentioned. Just:
- "COMING SOON" (big, bold)
- Feature highlights (smaller)
- "Loading..." / "Under Development" mood

Two images:
1. Portrait (768x1344) — WhatsApp status
   - Top: "COMING SOON"
   - Middle: feature icons (browse, sell, verified, safe)
   - Bottom: "Something big is coming to Eswatini"

2. Landscape (1344x768) — Facebook banner
   - Left: "COMING SOON"
   - Right: feature list
   - Bottom: "Premium vehicle marketplace. Loading..."
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "/home/z/my-project/download/coming-soon-intros"

def get_font(size, bold=True):
    """Get a bold sans-serif font at the given size."""
    paths = [
        "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Bold.otf" if bold else "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Regular.otf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except (IOError, OSError):
            continue
    return ImageFont.load_default()

def draw_text_centered(draw, text, font, y, img_width, fill=(255, 255, 255), shadow=True):
    """Draw centered text with optional shadow."""
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
    except AttributeError:
        text_width = draw.textlength(text, font=font)
    x = (img_width - text_width) // 2
    if shadow:
        # Draw dark shadow for readability
        for ox, oy in [(-2, 2), (2, 2), (-2, -2), (2, -2), (0, 3)]:
            draw.text((x + ox, y + oy), text, font=font, fill=(0, 0, 0, 200))
    draw.text((x, y), text, font=font, fill=fill)

def draw_text_left(draw, text, font, x, y, fill=(255, 255, 255), shadow=True):
    """Draw left-aligned text with optional shadow."""
    if shadow:
        for ox, oy in [(-2, 2), (2, 2), (-2, -2), (2, -2), (0, 3)]:
            draw.text((x + ox, y + oy), text, font=font, fill=(0, 0, 0, 200))
    draw.text((x, y), text, font=font, fill=fill)

# ============================================================
# IMAGE 1: Portrait (WhatsApp Status) — 768x1344
# ============================================================
def process_whatsapp_status():
    img_path = os.path.join(OUTPUT_DIR, "01_coming_soon_whatsapp_status.png")
    img = Image.open(img_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    w, h = img.size  # 768 x 1344

    # Dark gradient overlay at top and bottom for text readability
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    # Top gradient (dark)
    for y in range(h // 3):
        alpha = int(180 * (1 - y / (h // 3)))
        overlay_draw.rectangle([(0, y), (w, y + 1)], fill=(10, 24, 52, alpha))
    # Bottom gradient (dark)
    for y in range(h // 3):
        alpha = int(180 * (y / (h // 3)))
        overlay_draw.rectangle([(0, h - h // 3 + y), (w, h - h // 3 + y + 1)], fill=(10, 24, 52, alpha))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # "COMING SOON" — big, bold, centered, top third
    font_huge = get_font(int(w * 0.11))
    draw_text_centered(draw, "COMING", font_huge, int(h * 0.08), w, fill=(255, 215, 0))  # gold
    draw_text_centered(draw, "SOON", font_huge, int(h * 0.08 + w * 0.13), w, fill=(255, 255, 255))

    # Feature highlights — middle/lower area
    font_med = get_font(int(w * 0.045))
    font_small = get_font(int(w * 0.035))

    features = [
        "Browse verified vehicles",
        "Sell your car for free",
        "Safe, managed viewings",
        "No scammers. No brokers.",
    ]
    y_start = int(h * 0.65)
    for i, feature in enumerate(features):
        y = y_start + i * int(w * 0.06)
        # Draw a small gold dot before each feature
        dot_x = w // 2 - int(w * 0.25)
        draw.ellipse([(dot_x, y + font_small.size // 3), (dot_x + 8, y + font_small.size // 3 + 8)], fill=(255, 215, 0))
        draw_text_centered(draw, feature, font_small, y, w, fill=(255, 255, 255))

    # Bottom tagline
    font_tagline = get_font(int(w * 0.04))
    draw_text_centered(draw, "Something big is coming to Eswatini", font_tagline, int(h * 0.92), w, fill=(255, 215, 0))

    img.convert("RGB").save(img_path, "PNG", optimize=True)
    print(f"  + text overlay added to {img_path}")

# ============================================================
# IMAGE 2: Landscape (Facebook Banner) — 1344x768
# ============================================================
def process_facebook_banner():
    img_path = os.path.join(OUTPUT_DIR, "02_coming_soon_facebook_banner.png")
    img = Image.open(img_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    w, h = img.size  # 1344 x 768

    # Dark overlay on left half for text readability
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    # Left gradient (dark)
    for x in range(w // 2):
        alpha = int(200 * (1 - x / (w // 2)))
        overlay_draw.rectangle([(x, 0), (x + 1, h)], fill=(10, 24, 52, alpha))
    # Bottom gradient (dark)
    for y in range(h // 4):
        alpha = int(150 * (y / (h // 4)))
        overlay_draw.rectangle([(0, h - h // 4 + y), (w, h - h // 4 + y + 1)], fill=(10, 24, 52, alpha))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # "COMING SOON" — left side, big and bold
    font_huge = get_font(int(h * 0.16))
    draw_text_left(draw, "COMING", font_huge, int(w * 0.05), int(h * 0.15), fill=(255, 215, 0))
    draw_text_left(draw, "SOON", font_huge, int(w * 0.05), int(h * 0.15 + h * 0.18), fill=(255, 255, 255))

    # Feature highlights — left side, below "COMING SOON"
    font_med = get_font(int(h * 0.045))
    features = [
        "Browse verified vehicles",
        "Sell your car for free",
        "Safe, managed viewings",
        "No scammers. No brokers.",
    ]
    y_start = int(h * 0.55)
    for i, feature in enumerate(features):
        y = y_start + i * int(h * 0.06)
        draw.ellipse([(int(w * 0.05), y + font_med.size // 3), (int(w * 0.05) + 8, y + font_med.size // 3 + 8)], fill=(255, 215, 0))
        draw.text((int(w * 0.05) + 18, y), feature, font=font_med, fill=(255, 255, 255), shadow=None)

    # Bottom tagline — centered
    font_tagline = get_font(int(h * 0.04))
    tagline = "Premium vehicle marketplace. Loading..."
    try:
        bbox = draw.textbbox((0, 0), tagline, font=font_tagline)
        tw = bbox[2] - bbox[0]
    except AttributeError:
        tw = draw.textlength(tagline, font=font_tagline)
    tx = (w - tw) // 2
    ty = int(h * 0.92)
    for ox, oy in [(-2, 2), (2, 2), (0, 3)]:
        draw.text((tx + ox, ty + oy), tagline, font=font_tagline, fill=(0, 0, 0, 200))
    draw.text((tx, ty), tagline, font=font_tagline, fill=(255, 215, 0))

    img.convert("RGB").save(img_path, "PNG", optimize=True)
    print(f"  + text overlay added to {img_path}")

def main():
    print("Adding text overlays to Coming Soon images...\n")
    process_whatsapp_status()
    process_facebook_banner()
    print("\nDone.")

if __name__ == "__main__":
    main()
