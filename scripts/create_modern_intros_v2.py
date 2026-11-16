#!/usr/bin/env python3
"""Create 2 MORE modern Coming Soon images — different layouts, same elements.

Variation 3 (portrait): features in a 2x2 grid instead of vertical list,
copper/amber accent color.

Variation 4 (landscape): centered composition instead of left-right split,
features in a horizontal row.

Both include all required elements: app icon, COMING SOON, APP UNDER
DEVELOPMENT, 87% loading + progress bar, 4 features, tagline, modern design.
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/home/z/my-project/download/coming-soon-modern"
LOGO_PATH = "/home/z/my-project/upload/icon-preview.png"

# Use copper/amber accent instead of gold for variety
ACCENT = (230, 155, 70)  # warm copper
ACCENT_GLOW = (255, 180, 80)

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

def draw_progress_bar(draw, x, y, width, height, percentage, accent=ACCENT):
    draw.rounded_rectangle([(x, y), (x + width, y + height)], radius=height // 2, fill=(25, 25, 40))
    draw.rounded_rectangle([(x, y), (x + width, y + height)], radius=height // 2, outline=(*accent[:3], 80), width=1)
    fill_w = int(width * percentage / 100)
    if fill_w > height:
        segments = 30
        for i in range(segments):
            s = x + int(fill_w * i / segments)
            e = x + int(fill_w * (i + 1) / segments)
            if e > x + fill_w:
                e = x + fill_w
            t = i / segments
            r = int(200 + 40 * t)
            g = int(130 + 40 * t)
            b = int(40 + 20 * t)
            draw.rounded_rectangle([(s, y + 2), (e + 1, y + height - 2)], radius=(height - 4) // 2, fill=(r, g, b))
        gx = x + fill_w
        for r in range(6, 0, -1):
            alpha = int(60 * (1 - r / 6))
            draw.ellipse([(gx - r * 3, y - r), (gx + r * 3, y + height + r)], fill=(*ACCENT_GLOW[:3], alpha))

def draw_feature_grid_item(draw, x, y, text, font, done, box_w, box_h):
    """Draw a feature in a card/box style (for the 2x2 grid)."""
    # Card background
    draw.rounded_rectangle([(x, y), (x + box_w, y + box_h)], radius=10, fill=(20, 25, 40, 180))
    # Card border (subtle accent)
    draw.rounded_rectangle([(x, y), (x + box_w, y + box_h)], radius=10, outline=(*ACCENT[:3], 60), width=1)
    # Icon (top-left of card)
    icon_cx = x + 18
    icon_cy = y + box_h // 2
    if done:
        draw.ellipse([(icon_cx - 10, icon_cy - 10), (icon_cx + 10, icon_cy + 10)], fill=(60, 180, 100))
        draw.line([(icon_cx - 4, icon_cy), (icon_cx - 1, icon_cy + 3), (icon_cx + 5, icon_cy - 4)], fill=(255, 255, 255), width=2)
    else:
        for i in range(3):
            dot_x = icon_cx - 7 + i * 7
            opacity = int(255 * (0.25 + 0.25 * i))
            for r in range(5, 2, -1):
                alpha = int(40 * (1 - (r - 3) / 2))
                draw.ellipse([(dot_x - r, icon_cy - r), (dot_x + r, icon_cy + r)], fill=(*ACCENT_GLOW[:3], alpha))
            draw.ellipse([(dot_x - 3, icon_cy - 3), (dot_x + 3, icon_cy + 3)], fill=(*ACCENT[:3], opacity))
    # Text
    text_x = x + 36
    for ox, oy in [(-1, 1), (1, 1)]:
        draw.text((text_x + ox, y + (box_h - font.size) // 2 + oy), text, font=font, fill=(0, 0, 0, 120))
    draw.text((text_x, y + (box_h - font.size) // 2), text, font=font, fill=(255, 255, 255) if done else (190, 190, 200))

# ============================================================
# VARIATION 3: Portrait with 2x2 feature grid (WhatsApp status)
# ============================================================
def create_portrait_v2():
    print("Creating portrait v2 (2x2 feature grid)...")
    img = Image.open(os.path.join(OUTPUT_DIR, "bg_portrait_2.png")).convert("RGBA")
    draw = ImageDraw.Draw(img)
    w, h = img.size  # 768 x 1344

    # Subtle dark overlays
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(int(h * 0.12)):
        od.rectangle([(0, y), (w, y + 1)], fill=(5, 8, 20, int(100 * (1 - y / (h * 0.12)))))
    for y in range(int(h * 0.18)):
        alpha = int(130 * (y / (h * 0.18)))
        od.rectangle([(0, h - int(h * 0.18) + y), (w, h - int(h * 0.18) + y + 1)], fill=(5, 8, 20, alpha))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Zone 1: App icon
    logo = load_logo_circular()
    logo_size = int(w * 0.16)
    logo_x = (w - logo_size) // 2
    logo_y = int(h * 0.05)
    if logo:
        logo_r = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        glow_s = int(logo_size * 1.7)
        glow = Image.new("RGBA", (glow_s, glow_s), (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([(0, 0), (glow_s, glow_s)], fill=(*ACCENT_GLOW[:3], 40))
        glow = glow.filter(ImageFilter.GaussianBlur(radius=glow_s // 6))
        img.paste(glow, (logo_x + (logo_size - glow_s) // 2, logo_y + (logo_size - glow_s) // 2), glow)
        draw.ellipse([(logo_x - 3, logo_y - 3), (logo_x + logo_size + 3, logo_y + logo_size + 3)], outline=(*ACCENT[:3], 150), width=2)
        img.paste(logo_r, (logo_x, logo_y), logo_r)

    # Zone 2: "COMING SOON"
    font_cs = get_font(int(w * 0.065))
    draw_text_centered(draw, "COMING SOON", font_cs, int(h * 0.20), w, fill=(255, 255, 255), letter_spacing=2)

    # Zone 3: "APP UNDER DEVELOPMENT"
    font_sub = get_font(int(w * 0.030))
    draw_text_centered(draw, "APP UNDER DEVELOPMENT", font_sub, int(h * 0.27), w, fill=ACCENT[:3], letter_spacing=3)

    # Zone 4: Progress bar + percentage (side by side, centered)
    bar_w = int(w * 0.45)
    bar_h = int(h * 0.014)
    pct_text = "87%"
    font_pct = get_font(int(w * 0.045))
    try:
        bbox = draw.textbbox((0, 0), pct_text, font=font_pct)
        pct_w = bbox[2] - bbox[0]
    except:
        pct_w = draw.textlength(pct_text, font=font_pct)
    total_block_w = bar_w + 15 + pct_w
    block_x = (w - total_block_w) // 2
    bar_y = int(h * 0.35)
    draw_progress_bar(draw, block_x, bar_y, bar_w, bar_h, 87)
    # Percentage text to the right of the bar
    pct_x = block_x + bar_w + 15
    pct_y = bar_y - int((font_pct.size - bar_h) / 2)
    for ox, oy in [(-1, 1), (1, 1)]:
        draw.text((pct_x + ox, pct_y + oy), pct_text, font=font_pct, fill=(0, 0, 0, 160))
    draw.text((pct_x, pct_y), pct_text, font=font_pct, fill=ACCENT[:3])

    # Zone 5: "LOADING" label
    font_load = get_font(int(w * 0.025))
    draw_text_centered(draw, "LOADING", font_load, int(h * 0.40), w, fill=(*ACCENT[:3], 200), letter_spacing=4)

    # Zone 6: Features in a 2x2 GRID
    font_feat = get_font(int(w * 0.028))
    features = [
        ("Verified vehicles", True),
        ("Sell for free", True),
        ("Safe viewings", False),
        ("No scammers", False),
    ]
    grid_w = int(w * 0.82)
    grid_x = (w - grid_w) // 2
    gap = 10
    card_w = (grid_w - gap) // 2
    card_h = int(h * 0.07)
    grid_y = int(h * 0.48)

    for i, (text, done) in enumerate(features):
        col = i % 2
        row = i // 2
        cx = grid_x + col * (card_w + gap)
        cy = grid_y + row * (card_h + gap)
        draw_feature_grid_item(draw, cx, cy, text, font_feat, done, card_w, card_h)

    # Zone 7: Tagline
    font_tag = get_font(int(w * 0.026))
    draw_text_centered(draw, "The future of car shopping is loading...", font_tag, int(h * 0.92), w, fill=ACCENT[:3], letter_spacing=1)

    # Corner accents
    cs = 25
    cc = (*ACCENT[:3], 100)
    for cx, cy, dx, dy in [(20, 20, 1, 1), (w-20, 20, -1, 1), (20, h-20, 1, -1), (w-20, h-20, -1, -1)]:
        draw.line([(cx, cy), (cx + dx * cs, cy)], fill=cc, width=2)
        draw.line([(cx, cy), (cx, cy + dy * cs)], fill=cc, width=2)

    out = os.path.join(OUTPUT_DIR, "03_modern_portrait_v2.png")
    img.convert("RGB").save(out, "PNG", optimize=True)
    print(f"  Saved: {out} ({os.path.getsize(out) // 1024} KB)")

# ============================================================
# VARIATION 4: Landscape centered composition (Facebook banner)
# ============================================================
def create_landscape_v2():
    print("Creating landscape v2 (centered composition)...")
    img = Image.open(os.path.join(OUTPUT_DIR, "bg_landscape_2.png")).convert("RGBA")
    draw = ImageDraw.Draw(img)
    w, h = img.size  # 1344 x 768

    # Dark overlay (centered vignette for text)
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    # Vignette from center
    cx, cy = w // 2, h // 2
    for r in range(max(w, h) // 2, 0, -10):
        alpha = int(80 * (1 - r / (max(w, h) // 2)))
        if alpha > 0:
            od.ellipse([(cx - r * 2, cy - r), (cx + r * 2, cy + r)], fill=(5, 8, 20, alpha))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Zone 1: App icon (centered, top)
    logo = load_logo_circular()
    logo_size = int(h * 0.16)
    logo_x = (w - logo_size) // 2
    logo_y = int(h * 0.08)
    if logo:
        logo_r = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        glow_s = int(logo_size * 1.6)
        glow = Image.new("RGBA", (glow_s, glow_s), (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([(0, 0), (glow_s, glow_s)], fill=(*ACCENT_GLOW[:3], 40))
        glow = glow.filter(ImageFilter.GaussianBlur(radius=glow_s // 6))
        img.paste(glow, (logo_x + (logo_size - glow_s) // 2, logo_y + (logo_size - glow_s) // 2), glow)
        draw.ellipse([(logo_x - 3, logo_y - 3), (logo_x + logo_size + 3, logo_y + logo_size + 3)], outline=(*ACCENT[:3], 150), width=2)
        img.paste(logo_r, (logo_x, logo_y), logo_r)

    # Zone 2: "COMING SOON" (centered)
    font_cs = get_font(int(h * 0.065))
    draw_text_centered(draw, "COMING SOON", font_cs, int(h * 0.32), w, fill=(255, 255, 255), letter_spacing=2)

    # Zone 3: "APP UNDER DEVELOPMENT"
    font_sub = get_font(int(h * 0.026))
    draw_text_centered(draw, "APP UNDER DEVELOPMENT", font_sub, int(h * 0.42), w, fill=ACCENT[:3], letter_spacing=3)

    # Zone 4: Progress bar (centered) + percentage
    bar_w = int(w * 0.40)
    bar_h = int(h * 0.013)
    bar_x = (w - bar_w) // 2
    bar_y = int(h * 0.52)
    draw_progress_bar(draw, bar_x, bar_y, bar_w, bar_h, 87)
    font_pct = get_font(int(h * 0.040))
    draw_text_centered(draw, "87%", font_pct, int(h * 0.56), w, fill=ACCENT[:3])

    # Zone 5: Features in a HORIZONTAL row (4 items side by side)
    font_feat = get_font(int(h * 0.026))
    features = [
        ("Verified", True),
        ("Free to sell", True),
        ("Safe viewings", False),
        ("No scammers", False),
    ]
    row_y = int(h * 0.72)
    total_w = w - int(w * 0.10)
    item_w = total_w // 4
    start_x = int(w * 0.05)
    for i, (text, done) in enumerate(features):
        ix = start_x + i * item_w
        # Icon centered above text
        icon_cx = ix + item_w // 2
        icon_cy = row_y
        if done:
            draw.ellipse([(icon_cx - 9, icon_cy - 9), (icon_cx + 9, icon_cy + 9)], fill=(60, 180, 100))
            draw.line([(icon_cx - 4, icon_cy), (icon_cx - 1, icon_cy + 3), (icon_cx + 5, icon_cy - 4)], fill=(255, 255, 255), width=2)
        else:
            for j in range(3):
                dot_x = icon_cx - 6 + j * 6
                opacity = int(255 * (0.25 + 0.25 * j))
                for r in range(4, 2, -1):
                    alpha = int(40 * (1 - (r - 3) / 2))
                    draw.ellipse([(dot_x - r, icon_cy - r), (dot_x + r, icon_cy + r)], fill=(*ACCENT_GLOW[:3], alpha))
                draw.ellipse([(dot_x - 3, icon_cy - 3), (dot_x + 3, icon_cy + 3)], fill=(*ACCENT[:3], opacity))
        # Text centered below icon
        try:
            bbox = draw.textbbox((0, 0), text, font=font_feat)
            tw = bbox[2] - bbox[0]
        except:
            tw = draw.textlength(text, font=font_feat)
        tx = icon_cx - tw // 2
        ty = row_y + 18
        for ox, oy in [(-1, 1), (1, 1)]:
            draw.text((tx + ox, ty + oy), text, font=font_feat, fill=(0, 0, 0, 140))
        draw.text((tx, ty), text, font=font_feat, fill=(255, 255, 255) if done else (190, 190, 200))

    # Zone 6: Tagline (bottom center)
    font_tag = get_font(int(h * 0.028))
    draw_text_centered(draw, "The future of car shopping is loading...", font_tag, int(h * 0.90), w, fill=ACCENT[:3], letter_spacing=1)

    # Corner accents
    cs = 25
    cc = (*ACCENT[:3], 100)
    for cx, cy, dx, dy in [(20, 20, 1, 1), (w-20, 20, -1, 1), (20, h-20, 1, -1), (w-20, h-20, -1, -1)]:
        draw.line([(cx, cy), (cx + dx * cs, cy)], fill=cc, width=2)
        draw.line([(cx, cy), (cx, cy + dy * cs)], fill=cc, width=2)

    out = os.path.join(OUTPUT_DIR, "04_modern_landscape_v2.png")
    img.convert("RGB").save(out, "PNG", optimize=True)
    print(f"  Saved: {out} ({os.path.getsize(out) // 1024} KB)")

def main():
    create_portrait_v2()
    create_landscape_v2()
    print("\nDone.")

if __name__ == "__main__":
    main()
