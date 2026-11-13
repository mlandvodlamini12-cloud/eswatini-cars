#!/usr/bin/env python3
"""Create 2 CLEAN, MODERN Coming Soon images — portrait + landscape.

Design principles (fixing the overcrowded previous version):
- GENEROUS spacing between every element (no overlap)
- Clear top-to-bottom visual hierarchy
- Minimal text per zone
- Modern aesthetic: clean sans-serif, subtle gradients, soft glows
- Dark premium background with golden accents

Required elements (all included, cleanly arranged):
1. "App under development" text
2. Percentage loading notation (87% + progress bar)
3. App features (4 items)
4. App icon (circular with glow)
5. "Coming Soon" text
6. Modern design touch

Two versions:
- Portrait (768x1344) — WhatsApp status
- Landscape (1344x768) — Facebook banner
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/home/z/my-project/download/coming-soon-modern"
LOGO_PATH = "/home/z/my-project/upload/icon-preview.png"

def get_font(size, bold=True):
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

def load_logo_circular():
    if not os.path.exists(LOGO_PATH):
        return None
    logo = Image.open(LOGO_PATH).convert("RGBA")
    size = min(logo.size)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([(0, 0), (size, size)], fill=255)
    left = (logo.size[0] - size) // 2
    top = (logo.size[1] - size) // 2
    logo = logo.crop((left, top, left + size, top + size))
    output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    output.paste(logo, (0, 0), mask)
    return output

def draw_text_centered(draw, text, font, y, img_width, fill=(255, 255, 255), letter_spacing=0):
    chars = list(text)
    char_widths = []
    for ch in chars:
        try:
            bbox = draw.textbbox((0, 0), ch, font=font)
            char_widths.append(bbox[2] - bbox[0])
        except:
            char_widths.append(draw.textlength(ch, font=font))
    total_w = sum(char_widths) + letter_spacing * (len(chars) - 1)
    x = (img_width - total_w) // 2
    # Shadow
    for ox, oy in [(-1, 1), (1, 1), (0, 2)]:
        cx = x
        for ch in chars:
            draw.text((cx + ox, y + oy), ch, font=font, fill=(0, 0, 0, 160))
            cx += draw.textlength(ch, font=font) + letter_spacing
    cx = x
    for ch in chars:
        draw.text((cx, y), ch, font=font, fill=fill)
        try:
            bbox = draw.textbbox((0, 0), ch, font=font)
            cw = bbox[2] - bbox[0]
        except:
            cw = draw.textlength(ch, font=font)
        cx += cw + letter_spacing

def draw_text_left(draw, text, font, x, y, fill=(255, 255, 255)):
    for ox, oy in [(-1, 1), (1, 1), (0, 2)]:
        draw.text((x + ox, y + oy), text, font=font, fill=(0, 0, 0, 160))
    draw.text((x, y), text, font=font, fill=fill)

def draw_progress_bar(draw, x, y, width, height, percentage):
    # Dark track
    draw.rounded_rectangle([(x, y), (x + width, y + height)], radius=height // 2, fill=(25, 25, 40))
    # Gold border
    draw.rounded_rectangle([(x, y), (x + width, y + height)], radius=height // 2, outline=(255, 200, 50, 80), width=1)
    # Fill (gradient gold)
    fill_w = int(width * percentage / 100)
    if fill_w > height:  # only draw if enough to show
        segments = 30
        for i in range(segments):
            s = x + int(fill_w * i / segments)
            e = x + int(fill_w * (i + 1) / segments)
            if e > x + fill_w:
                e = x + fill_w
            t = i / segments
            r = int(220 + 35 * t)
            g = int(160 + 40 * t)
            b = int(30 + 20 * t)
            draw.rounded_rectangle([(s, y + 2), (e + 1, y + height - 2)], radius=(height - 4) // 2, fill=(r, g, b))
        # Glow at leading edge
        gx = x + fill_w
        for r in range(6, 0, -1):
            alpha = int(60 * (1 - r / 6))
            draw.ellipse([(gx - r * 3, y - r), (gx + r * 3, y + height + r)], fill=(255, 220, 100, alpha))

def draw_feature_item(draw, x, y, text, font, done, img_w):
    """Draw a feature with checkmark (done) or loading indicator (in progress)."""
    icon_cx = x + 12
    icon_cy = y + font.size // 2
    if done:
        # Green circle with white check
        draw.ellipse([(icon_cx - 11, icon_cy - 11), (icon_cx + 11, icon_cy + 11)], fill=(60, 180, 100))
        # Simple checkmark
        draw.line([(icon_cx - 5, icon_cy), (icon_cx - 1, icon_cy + 4), (icon_cx + 6, icon_cy - 5)], fill=(255, 255, 255), width=2)
    else:
        # Gold pulsing dot (3 dots)
        for i in range(3):
            dot_x = icon_cx - 8 + i * 8
            opacity = int(255 * (0.25 + 0.25 * i))
            # Glow
            for r in range(5, 2, -1):
                alpha = int(40 * (1 - (r - 3) / 2))
                draw.ellipse([(dot_x - r, icon_cy - r), (dot_x + r, icon_cy + r)], fill=(255, 200, 50, alpha))
            draw.ellipse([(dot_x - 3, icon_cy - 3), (dot_x + 3, icon_cy + 3)], fill=(255, 215, 0, opacity))
    # Text
    text_x = x + 32
    draw_text_left(draw, text, font, text_x, y, fill=(255, 255, 255) if done else (190, 190, 200))

# ============================================================
# PORTRAIT VERSION (WhatsApp Status) — 768 x 1344
# ============================================================
def create_portrait():
    print("Creating portrait version (WhatsApp status)...")
    img = Image.open(os.path.join(OUTPUT_DIR, "bg_portrait.png")).convert("RGBA")
    draw = ImageDraw.Draw(img)
    w, h = img.size  # 768 x 1344

    # Subtle dark overlay for text readability (very light, keeps the background visible)
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    # Very subtle top + bottom gradients
    for y in range(int(h * 0.15)):
        od.rectangle([(0, y), (w, y + 1)], fill=(5, 10, 25, int(120 * (1 - y / (h * 0.15)))))
    for y in range(int(h * 0.2)):
        alpha = int(140 * (y / (h * 0.2)))
        od.rectangle([(0, h - int(h * 0.2) + y), (w, h - int(h * 0.2) + y + 1)], fill=(5, 10, 25, alpha))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # --- LAYOUT (generous spacing, top to bottom) ---
    # Zone 1: App icon (y ~5%-16%)
    logo = load_logo_circular()
    logo_size = int(w * 0.18)  # ~138px
    logo_x = (w - logo_size) // 2
    logo_y = int(h * 0.06)
    if logo:
        logo_r = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        # Golden glow
        glow_s = int(logo_size * 1.8)
        glow = Image.new("RGBA", (glow_s, glow_s), (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([(0, 0), (glow_s, glow_s)], fill=(255, 200, 50, 40))
        glow = glow.filter(ImageFilter.GaussianBlur(radius=glow_s // 6))
        img.paste(glow, (logo_x + (logo_size - glow_s) // 2, logo_y + (logo_size - glow_s) // 2), glow)
        # Gold ring
        draw.ellipse([(logo_x - 3, logo_y - 3), (logo_x + logo_size + 3, logo_y + logo_size + 3)], outline=(255, 200, 50, 150), width=2)
        img.paste(logo_r, (logo_x, logo_y), logo_r)

    # Zone 2: "COMING SOON" (y ~22%-27%)
    font_cs = get_font(int(w * 0.07))
    draw_text_centered(draw, "COMING SOON", font_cs, int(h * 0.22), w, fill=(255, 255, 255), letter_spacing=2)

    # Zone 3: "APP UNDER DEVELOPMENT" (y ~29%-31%)
    font_sub = get_font(int(w * 0.032))
    draw_text_centered(draw, "APP UNDER DEVELOPMENT", font_sub, int(h * 0.29), w, fill=(255, 200, 50), letter_spacing=3)

    # Zone 4: Progress bar (y ~37%-39%)
    bar_w = int(w * 0.65)
    bar_h = int(h * 0.016)
    bar_x = (w - bar_w) // 2
    bar_y = int(h * 0.37)
    draw_progress_bar(draw, bar_x, bar_y, bar_w, bar_h, 87)

    # Zone 5: "87%" (y ~41%-45%)
    font_pct = get_font(int(w * 0.055))
    draw_text_centered(draw, "87%", font_pct, int(h * 0.41), w, fill=(255, 200, 50))

    # Zone 6: Divider (y ~50%)
    div_y = int(h * 0.50)
    div_w = int(w * 0.35)
    div_x = (w - div_w) // 2
    draw.line([(div_x, div_y), (div_x + div_w, div_y)], fill=(255, 200, 50, 80), width=1)

    # Zone 7: Features (y ~54%-74%) — generous spacing
    font_feat = get_font(int(w * 0.034))
    features = [
        ("Browse verified vehicles", True),
        ("Sell your car for free", True),
        ("Safe, managed viewings", False),
        ("No scammers. No brokers.", False),
    ]
    feat_x = int(w * 0.18)
    feat_y_start = int(h * 0.54)
    feat_spacing = int(h * 0.055)
    for i, (text, done) in enumerate(features):
        draw_feature_item(draw, feat_x, feat_y_start + i * feat_spacing, text, font_feat, done, w)

    # Zone 8: Tagline (y ~93%-95%) — lots of breathing room above
    font_tag = get_font(int(w * 0.028))
    draw_text_centered(draw, "The future of car shopping is loading...", font_tag, int(h * 0.93), w, fill=(255, 200, 50), letter_spacing=1)

    # Decorative corner accents
    cs = 25
    cc = (255, 200, 50, 100)
    for cx, cy, dx, dy in [(20, 20, 1, 1), (w-20, 20, -1, 1), (20, h-20, 1, -1), (w-20, h-20, -1, -1)]:
        draw.line([(cx, cy), (cx + dx * cs, cy)], fill=cc, width=2)
        draw.line([(cx, cy), (cx, cy + dy * cs)], fill=cc, width=2)

    out = os.path.join(OUTPUT_DIR, "01_modern_portrait.png")
    img.convert("RGB").save(out, "PNG", optimize=True)
    print(f"  Saved: {out} ({os.path.getsize(out) // 1024} KB)")

# ============================================================
# LANDSCAPE VERSION (Facebook Banner) — 1344 x 768
# ============================================================
def create_landscape():
    print("Creating landscape version (Facebook banner)...")
    img = Image.open(os.path.join(OUTPUT_DIR, "bg_landscape.png")).convert("RGBA")
    draw = ImageDraw.Draw(img)
    w, h = img.size  # 1344 x 768

    # Dark overlay on left half for text
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for x in range(int(w * 0.55)):
        alpha = int(160 * (1 - x / (w * 0.55)))
        od.rectangle([(x, 0), (x + 1, h)], fill=(5, 10, 25, alpha))
    for y in range(int(h * 0.15)):
        alpha = int(120 * (y / (h * 0.15)))
        od.rectangle([(0, h - int(h * 0.15) + y), (w, h - int(h * 0.15) + y + 1)], fill=(5, 10, 25, alpha))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    left_x = int(w * 0.06)  # left padding

    # Zone 1: App icon (top-left)
    logo = load_logo_circular()
    logo_size = int(h * 0.18)
    logo_x = left_x
    logo_y = int(h * 0.10)
    if logo:
        logo_r = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        glow_s = int(logo_size * 1.6)
        glow = Image.new("RGBA", (glow_s, glow_s), (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([(0, 0), (glow_s, glow_s)], fill=(255, 200, 50, 40))
        glow = glow.filter(ImageFilter.GaussianBlur(radius=glow_s // 6))
        img.paste(glow, (logo_x + (logo_size - glow_s) // 2, logo_y + (logo_size - glow_s) // 2), glow)
        draw.ellipse([(logo_x - 3, logo_y - 3), (logo_x + logo_size + 3, logo_y + logo_size + 3)], outline=(255, 200, 50, 150), width=2)
        img.paste(logo_r, (logo_x, logo_y), logo_r)

    # Zone 2: "COMING SOON" (below icon)
    font_cs = get_font(int(h * 0.07))
    draw_text_left(draw, "COMING SOON", font_cs, left_x, int(h * 0.35), fill=(255, 255, 255))

    # Zone 3: "APP UNDER DEVELOPMENT"
    font_sub = get_font(int(h * 0.028))
    draw_text_left(draw, "APP UNDER DEVELOPMENT", font_sub, left_x, int(h * 0.46), fill=(255, 200, 50))

    # Zone 4: Progress bar (left side)
    bar_w = int(w * 0.35)
    bar_h = int(h * 0.014)
    bar_x = left_x
    bar_y = int(h * 0.55)
    draw_progress_bar(draw, bar_x, bar_y, bar_w, bar_h, 87)

    # Zone 5: "87%"
    font_pct = get_font(int(h * 0.045))
    draw_text_left(draw, "87%", font_pct, left_x, int(h * 0.60), fill=(255, 200, 50))

    # Zone 6: Features (right side)
    font_feat = get_font(int(h * 0.034))
    features = [
        ("Browse verified vehicles", True),
        ("Sell your car for free", True),
        ("Safe, managed viewings", False),
        ("No scammers. No brokers.", False),
    ]
    feat_x = int(w * 0.52)
    feat_y_start = int(h * 0.20)
    feat_spacing = int(h * 0.12)
    for i, (text, done) in enumerate(features):
        draw_feature_item(draw, feat_x, feat_y_start + i * feat_spacing, text, font_feat, done, w)

    # Zone 7: Tagline (bottom, centered)
    font_tag = get_font(int(h * 0.03))
    tagline = "The future of car shopping is loading..."
    try:
        bbox = draw.textbbox((0, 0), tagline, font=font_tag)
        tw = bbox[2] - bbox[0]
    except:
        tw = draw.textlength(tagline, font=font_tag)
    tx = (w - tw) // 2
    ty = int(h * 0.88)
    for ox, oy in [(-1, 1), (1, 1), (0, 2)]:
        draw.text((tx + ox, ty + oy), tagline, font=font_tag, fill=(0, 0, 0, 160))
    draw.text((tx, ty), tagline, font=font_tag, fill=(255, 200, 50))

    out = os.path.join(OUTPUT_DIR, "02_modern_landscape.png")
    img.convert("RGB").save(out, "PNG", optimize=True)
    print(f"  Saved: {out} ({os.path.getsize(out) // 1024} KB)")

def main():
    create_portrait()
    create_landscape()
    print("\nDone.")

if __name__ == "__main__":
    main()
