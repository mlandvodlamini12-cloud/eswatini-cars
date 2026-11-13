#!/usr/bin/env python3
"""Create the enhanced 'Grand Reveal' Coming Soon image.

Takes the original theatrical curtains image and overlays:
- "APP UNDER DEVELOPMENT" header (gold, letter-spaced)
- "COMING SOON" (large white)
- A loading progress bar with percentage (87% — looks almost ready)
- Animated-style loading dots
- Feature checklist (some done ✓, some loading ⟳)
- Creative tagline at the bottom
- The app logo with a golden glow

Design: warm gold + red velvet palette, dynamic and alive (not dull).
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

INPUT_PATH = "/home/z/my-project/download/coming-soon-creative/10_the_reveal_original.png"
OUTPUT_PATH = "/home/z/my-project/download/coming-soon-creative/10_the_reveal_ENHANCED.png"
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

def draw_text_centered(draw, text, font, y, img_width, fill=(255, 255, 255), shadow=True, letter_spacing=0):
    """Draw centered text with optional shadow + letter spacing."""
    # Calculate total width with letter spacing
    chars = list(text)
    char_widths = []
    for ch in chars:
        try:
            bbox = draw.textbbox((0, 0), ch, font=font)
            char_widths.append(bbox[2] - bbox[0])
        except AttributeError:
            char_widths.append(draw.textlength(ch, font=font))
    total_width = sum(char_widths) + letter_spacing * (len(chars) - 1)
    x = (img_width - total_width) // 2
    if shadow:
        for ox, oy in [(-2, 2), (2, 2), (-1, -1), (1, 1), (0, 3)]:
            cx = x
            for ch in chars:
                draw.text((cx + ox, y + oy), ch, font=font, fill=(0, 0, 0, 180))
                cx += draw.textlength(ch, font=font) + letter_spacing
    cx = x
    for ch in chars:
        draw.text((cx, y), ch, font=font, fill=fill)
        try:
            bbox = draw.textbbox((0, 0), ch, font=font)
            cw = bbox[2] - bbox[0]
        except AttributeError:
            cw = draw.textlength(ch, font=font)
        cx += cw + letter_spacing

def draw_progress_bar(draw, x, y, width, height, percentage):
    """Draw a modern gradient progress bar with glow."""
    # Background (dark track)
    draw.rounded_rectangle([(x, y), (x + width, y + height)], radius=height // 2, fill=(20, 20, 35, 200))
    # Inner track border (subtle gold)
    draw.rounded_rectangle([(x, y), (x + width, y + height)], radius=height // 2, outline=(255, 200, 50, 100), width=1)
    
    # Filled portion (gradient gold to amber)
    fill_width = int(width * percentage / 100)
    if fill_width > 0:
        # Draw the fill in segments to create a gradient effect
        segments = 40
        for i in range(segments):
            seg_start = x + int(fill_width * i / segments)
            seg_end = x + int(fill_width * (i + 1) / segments)
            if seg_end > x + fill_width:
                seg_end = x + fill_width
            # Gradient from deep gold (left) to bright amber (right)
            t = i / segments
            r = int(255 * (0.85 + 0.15 * t))
            g = int(180 * (0.9 + 0.1 * t))
            b = int(30 + 20 * t)
            # Only draw if within the rounded corners
            draw.rounded_rectangle([(seg_start, y + 1), (seg_end + 1, y + height - 1)], radius=(height - 2) // 2, fill=(r, g, b))
        
        # Add a bright glow at the leading edge
        glow_x = x + fill_width
        for r in range(8, 0, -1):
            alpha = int(80 * (1 - r / 8))
            draw.ellipse([(glow_x - r * 3, y - r), (glow_x + r * 3, y + height + r)], fill=(255, 220, 100, alpha))
    
    return fill_width

def draw_loading_dots(draw, cx, y, radius=6, spacing=18, num_dots=3):
    """Draw animated-style loading dots (3 dots with varying opacity)."""
    total_width = (num_dots - 1) * spacing
    start_x = cx - total_width // 2
    for i in range(num_dots):
        opacity = int(255 * (0.3 + 0.7 * (i + 1) / num_dots))  # increasing opacity
        dot_x = start_x + i * spacing
        # Glow
        for r in range(radius + 4, radius, -1):
            alpha = int(60 * (1 - (r - radius) / 4))
            draw.ellipse([(dot_x - r, y - r), (dot_x + r, y + r)], fill=(255, 200, 50, alpha))
        # Main dot
        draw.ellipse([(dot_x - radius, y - radius), (dot_x + radius, y + radius)], fill=(255, 215, 0, opacity))

def load_logo_circular():
    """Load the app logo as a circular icon with transparent background."""
    if not os.path.exists(LOGO_PATH):
        return None
    logo = Image.open(LOGO_PATH).convert("RGBA")
    size = min(logo.size)
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([(0, 0), (size, size)], fill=255)
    left = (logo.size[0] - size) // 2
    top = (logo.size[1] - size) // 2
    logo = logo.crop((left, top, left + size, top + size))
    output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    output.paste(logo, (0, 0), mask)
    return output

def main():
    print("Creating enhanced Grand Reveal image...")
    
    # Load the original image
    img = Image.open(INPUT_PATH).convert("RGBA")
    draw = ImageDraw.Draw(img)
    w, h = img.size  # 768 x 1344
    
    # === Step 1: Dark gradient overlays for text readability ===
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    # Top gradient (dark, for "APP UNDER DEVELOPMENT" header)
    top_h = int(h * 0.18)
    for y in range(top_h):
        alpha = int(200 * (1 - y / top_h * 0.5))
        overlay_draw.rectangle([(0, y), (w, y + 1)], fill=(10, 15, 30, alpha))
    
    # Bottom gradient (dark, for progress bar + features + tagline)
    bottom_h = int(h * 0.42)
    for y in range(bottom_h):
        alpha = int(220 * (y / bottom_h))
        overlay_draw.rectangle([(0, h - bottom_h + y), (w, h - bottom_h + y + 1)], fill=(10, 15, 30, alpha))
    
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)
    
    # === Step 2: Top header — "APP UNDER DEVELOPMENT" ===
    font_header = get_font(int(w * 0.035))
    draw_text_centered(draw, "APP UNDER DEVELOPMENT", font_header, int(h * 0.03), w, 
                       fill=(255, 200, 50), shadow=True, letter_spacing=3)
    
    # Decorative line under the header
    line_y = int(h * 0.03 + font_header.size + 8)
    line_w = int(w * 0.3)
    line_x = (w - line_w) // 2
    draw.line([(line_x, line_y), (line_x + line_w, line_y)], fill=(255, 200, 50, 150), width=1)
    # Small diamond in the center of the line
    diamond_x = w // 2
    diamond_y = line_y
    draw.polygon([(diamond_x, diamond_y - 3), (diamond_x + 4, diamond_y), (diamond_x, diamond_y + 3), (diamond_x - 4, diamond_y)], fill=(255, 200, 50))
    
    # === Step 3: "COMING SOON" — large, bold, white ===
    font_cs = get_font(int(w * 0.075))
    draw_text_centered(draw, "COMING SOON", font_cs, int(h * 0.07), w, 
                       fill=(255, 255, 255), shadow=True, letter_spacing=2)
    
    # === Step 4: App logo with golden glow (center, between curtains) ===
    logo = load_logo_circular()
    if logo:
        logo_size = int(w * 0.16)
        logo_resized = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        logo_x = (w - logo_size) // 2
        logo_y = int(h * 0.32)
        
        # Golden glow behind logo
        glow_size = int(logo_size * 1.6)
        glow = Image.new("RGBA", (glow_size, glow_size), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        glow_draw.ellipse([(0, 0), (glow_size, glow_size)], fill=(255, 200, 50, 50))
        glow = glow.filter(ImageFilter.GaussianBlur(radius=glow_size // 8))
        img.paste(glow, (logo_x + (logo_size - glow_size) // 2, logo_y + (logo_size - glow_size) // 2), glow)
        
        # Draw a thin gold ring around the logo
        ring_margin = 4
        draw.ellipse([(logo_x - ring_margin, logo_y - ring_margin), 
                      (logo_x + logo_size + ring_margin, logo_y + logo_size + ring_margin)], 
                     outline=(255, 200, 50, 180), width=2)
        
        img.paste(logo_resized, (logo_x, logo_y), logo_resized)
        print("  + logo added with golden glow + ring")
    
    # === Step 5: Loading percentage + progress bar ===
    # "LOADING" label
    font_loading_label = get_font(int(w * 0.03))
    draw_text_centered(draw, "LOADING FEATURES", font_loading_label, int(h * 0.58), w, 
                       fill=(255, 200, 50), shadow=True, letter_spacing=2)
    
    # Progress bar
    bar_w = int(w * 0.7)
    bar_h = int(h * 0.018)
    bar_x = (w - bar_w) // 2
    bar_y = int(h * 0.62)
    percentage = 87
    draw_progress_bar(draw, bar_x, bar_y, bar_w, bar_h, percentage)
    
    # Percentage text (big, bold, gold)
    font_pct = get_font(int(w * 0.06))
    pct_text = f"{percentage}%"
    draw_text_centered(draw, pct_text, font_pct, bar_y + bar_h + 12, w, 
                       fill=(255, 200, 50), shadow=True)
    
    # === Step 6: Feature checklist ===
    font_feat = get_font(int(w * 0.032))
    features = [
        ("Browse verified vehicles", True),   # ✓ done
        ("Sell your car for free", True),      # ✓ done
        ("Safe, managed viewings", False),     # ⟳ loading
        ("No scammers. No brokers.", False),   # ⟳ loading
    ]
    
    feat_y_start = int(h * 0.73)
    feat_line_h = int(h * 0.04)
    feat_x = int(w * 0.15)
    
    for i, (feat, done) in enumerate(features):
        y = feat_y_start + i * feat_line_h
        # Icon: checkmark (done) or loading dots (in progress)
        icon_x = feat_x
        icon_y = y + font_feat.size // 2
        if done:
            # Gold checkmark
            draw.ellipse([(icon_x - 10, icon_y - 10), (icon_x + 10, icon_y + 10)], fill=(80, 200, 120, 200))
            # Check mark (simple)
            draw.line([(icon_x - 4, icon_y), (icon_x - 1, icon_y + 3), (icon_x + 5, icon_y - 4)], fill=(255, 255, 255), width=2)
        else:
            # Loading dots (3 small gold dots)
            draw_loading_dots(draw, icon_x + 5, icon_y, radius=4, spacing=12, num_dots=3)
        
        # Feature text
        text_x = icon_x + 25
        for ox, oy in [(-1, 1), (1, 1), (0, 2)]:
            draw.text((text_x + ox, y + oy), feat, font=font_feat, fill=(0, 0, 0, 180))
        draw.text((text_x, y), feat, font=font_feat, fill=(255, 255, 255) if done else (200, 200, 210))
    
    # === Step 7: Bottom tagline ===
    font_tagline = get_font(int(w * 0.028))
    tagline = "The future of car shopping is loading..."
    draw_text_centered(draw, tagline, font_tagline, int(h * 0.94), w, 
                       fill=(255, 200, 50), shadow=True, letter_spacing=1)
    
    # === Step 8: Decorative corner accents ===
    corner_size = 30
    corner_color = (255, 200, 50, 120)
    # Top-left
    draw.line([(20, 20), (20 + corner_size, 20)], fill=corner_color, width=2)
    draw.line([(20, 20), (20, 20 + corner_size)], fill=corner_color, width=2)
    # Top-right
    draw.line([(w - 20, 20), (w - 20 - corner_size, 20)], fill=corner_color, width=2)
    draw.line([(w - 20, 20), (w - 20, 20 + corner_size)], fill=corner_color, width=2)
    # Bottom-left
    draw.line([(20, h - 20), (20 + corner_size, h - 20)], fill=corner_color, width=2)
    draw.line([(20, h - 20), (20, h - 20 - corner_size)], fill=corner_color, width=2)
    # Bottom-right
    draw.line([(w - 20, h - 20), (w - 20 - corner_size, h - 20)], fill=corner_color, width=2)
    draw.line([(w - 20, h - 20), (w - 20, h - 20 - corner_size)], fill=corner_color, width=2)
    
    # Save
    img.convert("RGB").save(OUTPUT_PATH, "PNG", optimize=True)
    size_kb = os.path.getsize(OUTPUT_PATH) // 1024
    print(f"\n  Saved: {OUTPUT_PATH} ({size_kb} KB)")
    print(f"  Size: {w}x{h}")

if __name__ == "__main__":
    main()
