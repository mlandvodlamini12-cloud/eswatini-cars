#!/usr/bin/env python3
"""Generate 10 CREATIVE 'Coming Soon' intro images for Eswatini Cars.

Each image is a DIFFERENT creative concept (not all "car at sunset"):
1. The Key — car key floating in golden light, app logo as keychain
2. The Road — winding Eswatini road, warm morning light
3. The Phone — hand holding glowing phone, logo faintly on screen
4. The Showroom — spotlight on a premium car, warm luxury
5. The Community — hands reaching toward glowing car icon
6. The Dawn — sunrise over cars, warm golden morning
7. The Lens — magnifying glass focusing on a car, logo on lens
8. The Hands — hands cupping a glowing car, intimate + warm
9. The Puzzle — puzzle pieces forming a car, logo as last piece
10. The Reveal — curtain parting to reveal a car silhouette, warm spotlight

Some images include the app logo icon (from upload/icon-preview.png) as a
design element — but NO app name text anywhere.

Warm color palettes: gold, amber, warm cream, sunset orange, warm navy.
"""
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/home/z/my-project/download/coming-soon-creative"
LOGO_PATH = "/home/z/my-project/upload/icon-preview.png"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 10 creative concepts — each is (filename, size, AI prompt, tagline, include_logo, logo_position)
# logo_position: "top-center", "bottom-center", "center", "none"
CONCEPTS = [
    (
        "01_the_key.png",
        "1024x1024",
        "A car key floating in mid-air surrounded by warm golden light particles, "
        "the key is modern and premium, soft bokeh background in warm amber and "
        "gold tones, a subtle glow emanating from the key, photorealistic, 4K, "
        "intimate and premium atmosphere, warm color palette, dark background "
        "with golden light rays. The top center area should be relatively clear "
        "for a logo overlay.",
        "Your next car is one tap away.",
        True, "top-center"
    ),
    (
        "02_the_road.png",
        "768x1344",
        "A winding road through the beautiful Eswatini landscape at golden hour, "
        "rolling green hills and mountains in the background, warm morning light "
        "flooding the scene, a single car driving toward the horizon, dust trail "
        "behind it, acacia trees lining the road, photorealistic, 4K, warm and "
        "hopeful atmosphere, golden and emerald color palette. The top third "
        "should be sky (relatively clear for text).",
        "The road to your next car starts here.",
        False, "none"
    ),
    (
        "03_the_phone.png",
        "768x1344",
        "A close-up of a hand holding a smartphone, the phone screen is glowing "
        "with warm golden light but the screen content is blurred and obscured, "
        "warm bokeh in the background, soft intimate lighting, photorealistic, "
        "4K, anticipation and mystery, warm amber and gold tones, the phone "
        "screen's glow illuminates the hand. The center of the phone screen "
        "should be a soft glowing area where a logo can be overlaid.",
        "The app you've been waiting for.",
        True, "center"
    ),
    (
        "04_the_showroom.png",
        "1344x768",
        "A premium car showroom at night, a single luxury car on a rotating "
        "platform under a dramatic warm spotlight, golden light beam from above, "
        "dark surroundings with subtle reflections on the glossy floor, the car "
        "is partially in shadow with warm light highlighting its curves, "
        "photorealistic, 4K, luxurious and exclusive atmosphere, warm gold and "
        "deep navy palette. The left third should be relatively dark for text.",
        "Premium cars. Zero hassle.",
        False, "none"
    ),
    (
        "05_the_community.png",
        "1024x1024",
        "Multiple diverse hands reaching upward toward a central glowing golden "
        "car silhouette floating above, the hands are raised in a gesture of "
        "offering and community, warm golden light radiating from the car, "
        "dark warm background, photorealistic, 4K, warm and human atmosphere, "
        "gold and warm brown tones. The center where the car silhouette floats "
        "should be clear for a logo overlay.",
        "Eswatini's car community. Coming together.",
        True, "center"
    ),
    (
        "06_the_dawn.png",
        "1344x768",
        "Sunrise over a row of cars parked on a hill, the first warm golden rays "
        "of dawn light hitting the cars, morning mist on the ground, Eswatini "
        "mountains in the background, warm orange and gold sky transitioning to "
        "soft blue, dew on the car surfaces catching the light, photorealistic, "
        "4K, hopeful and fresh atmosphere, warm dawn color palette. The top "
        "third should be sky for text overlay.",
        "A new way to buy cars. Dawning soon.",
        False, "none"
    ),
    (
        "07_the_lens.png",
        "1024x1024",
        "A large magnifying glass held over a row of cars, the magnifying lens "
        "is focusing on one specific car and magnifying it, warm golden light "
        "passing through the lens creating a bright spot, the background cars "
        "are slightly blurred, photorealistic, 4K, discovery and focus theme, "
        "warm gold and amber tones. The lens area should have a circular clear "
        "space where a logo can be overlaid.",
        "Find the perfect car. Coming into focus.",
        True, "center"
    ),
    (
        "08_the_hands.png",
        "1024x1024",
        "Two hands cupped together gently holding a small glowing golden car "
        "silhouette, warm light emanating from between the hands, dark warm "
        "background with bokeh, intimate and careful gesture, photorealistic, "
        "4K, trust and care atmosphere, warm gold and amber palette. The area "
        "above the hands should be clear for a logo or text overlay.",
        "Your next car, in good hands.",
        True, "top-center"
    ),
    (
        "09_the_puzzle.png",
        "1344x768",
        "A jigsaw puzzle coming together on a warm wooden table, the puzzle "
        "pieces are forming the image of a car, some pieces are still scattered "
        "around, warm golden light from the side, the last piece being placed "
        "is glowing, photorealistic, 4K, satisfying and anticipation-building, "
        "warm wood and gold tones. The top right area should be clear for a "
        "logo overlay.",
        "Every piece in place. Almost there.",
        True, "top-right"
    ),
    (
        "10_the_reveal.png",
        "768x1344",
        "A dramatic stage with heavy red velvet curtains parting to reveal a "
        "car silhouette in warm golden spotlight behind them, dust particles in "
        "the light beam, theatrical and grand, the curtains are rich warm red, "
        "the background is dark with warm gold light, photorealistic, 4K, "
        "grand reveal atmosphere, warm red and gold palette. The center where "
        "the car is revealed should be clear for a logo overlay.",
        "The grand reveal is coming.",
        True, "center"
    ),
]

def generate_base_image(prompt, size, output_path):
    cmd = ["z-ai", "image", "--prompt", prompt, "--output", output_path, "--size", size]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    return result.returncode == 0 and os.path.exists(output_path), result.stderr

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

def load_logo():
    """Load the app logo and make it circular with a golden glow."""
    if not os.path.exists(LOGO_PATH):
        return None
    logo = Image.open(LOGO_PATH).convert("RGBA")
    # Make it circular
    size = min(logo.size)
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([(0, 0), (size, size)], fill=255)
    # Crop to square center
    left = (logo.size[0] - size) // 2
    top = (logo.size[1] - size) // 2
    logo = logo.crop((left, top, left + size, top + size))
    # Apply circular mask
    output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    output.paste(logo, (0, 0), mask)
    return output

def add_logo_to_image(base_img, logo_img, position):
    """Composite the app logo onto the base image at the specified position."""
    if logo_img is None:
        return base_img
    w, h = base_img.size
    logo_size = int(min(w, h) * 0.15)  # 15% of the smaller dimension
    logo_resized = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Add a soft golden glow behind the logo
    glow_size = int(logo_size * 1.4)
    glow = Image.new("RGBA", (glow_size, glow_size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([(0, 0), (glow_size, glow_size)], fill=(255, 200, 50, 60))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=glow_size // 6))
    
    # Calculate position
    if position == "top-center":
        x = (w - glow_size) // 2
        y = int(h * 0.08)
    elif position == "center":
        x = (w - glow_size) // 2
        y = (h - glow_size) // 2
    elif position == "bottom-center":
        x = (w - glow_size) // 2
        y = int(h * 0.75)
    elif position == "top-right":
        x = int(w * 0.75)
        y = int(h * 0.08)
    else:
        return base_img
    
    # Composite glow first, then logo
    img = base_img.convert("RGBA")
    img.paste(glow, (x, y), glow)
    logo_x = x + (glow_size - logo_size) // 2
    logo_y = y + (glow_size - logo_size) // 2
    img.paste(logo_resized, (logo_x, logo_y), logo_resized)
    return img

def add_text_overlay(img, tagline, include_logo, logo_position):
    """Add 'COMING SOON' + tagline text to the image."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    
    # Dark gradient overlay at bottom for text readability
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    gradient_height = int(h * 0.35)
    for y in range(gradient_height):
        alpha = int(180 * (y / gradient_height))
        overlay_draw.rectangle([(0, h - gradient_height + y), (w, h - gradient_height + y + 1)], fill=(10, 24, 52, alpha))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)
    
    # "COMING SOON" — smaller, gold, at the top of the text area
    font_cs = get_font(int(min(w, h) * 0.045))
    cs_text = "COMING SOON"
    try:
        bbox = draw.textbbox((0, 0), cs_text, font=font_cs)
        cs_w = bbox[2] - bbox[0]
    except AttributeError:
        cs_w = draw.textlength(cs_text, font=font_cs)
    cs_x = (w - cs_w) // 2
    cs_y = h - int(h * 0.22)
    # Shadow
    for ox, oy in [(-2, 2), (2, 2), (0, 3)]:
        draw.text((cs_x + ox, cs_y + oy), cs_text, font=font_cs, fill=(0, 0, 0, 200))
    draw.text((cs_x, cs_y), cs_text, font=font_cs, fill=(255, 200, 50))  # gold
    
    # Tagline — larger, white, centered, below "COMING SOON"
    font_tag = get_font(int(min(w, h) * 0.055))
    # Wrap tagline if needed
    max_width = int(w * 0.85)
    words = tagline.split()
    lines = []
    current = []
    for word in words:
        test = " ".join(current + [word])
        try:
            bbox = draw.textbbox((0, 0), test, font=font_tag)
            tw = bbox[2] - bbox[0]
        except AttributeError:
            tw = draw.textlength(test, font=font_tag)
        if tw <= max_width:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    
    line_height = font_tag.size + 4
    total_height = len(lines) * line_height
    start_y = cs_y + font_cs.size + 15
    for i, line in enumerate(lines):
        try:
            bbox = draw.textbbox((0, 0), line, font=font_tag)
            lw = bbox[2] - bbox[0]
        except AttributeError:
            lw = draw.textlength(line, font=font_tag)
        lx = (w - lw) // 2
        ly = start_y + i * line_height
        for ox, oy in [(-2, 2), (2, 2), (0, 3)]:
            draw.text((lx + ox, ly + oy), line, font=font_tag, fill=(0, 0, 0, 200))
        draw.text((lx, ly), line, font=font_tag, fill=(255, 255, 255))
    
    return img

def main():
    print(f"Generating {len(CONCEPTS)} creative Coming Soon images...\n")
    logo = load_logo()
    if logo:
        print(f"  App logo loaded ({logo.size[0]}x{logo.size[1]})\n")
    else:
        print("  WARNING: logo not found, skipping logo overlays\n")
    
    results = []
    for i, (filename, size, prompt, tagline, include_logo, logo_pos) in enumerate(CONCEPTS, 1):
        print(f"[{i}/10] {filename} ({size})")
        base_path = os.path.join(OUTPUT_DIR, f"base_{filename}")
        success, error = generate_base_image(prompt, size, base_path)
        if not success:
            print(f"  X base failed: {error[:150]}")
            results.append((filename, False))
            continue
        print(f"  + base generated ({os.path.getsize(base_path) // 1024} KB)")
        
        # Open base image
        img = Image.open(base_path).convert("RGBA")
        
        # Add logo if specified
        if include_logo and logo:
            img = add_logo_to_image(img, logo, logo_pos)
            print(f"  + logo added ({logo_pos})")
        
        # Add text overlay
        img = add_text_overlay(img, tagline, include_logo, logo_pos)
        print(f"  + text added: \"{tagline}\"")
        
        # Save final
        final_path = os.path.join(OUTPUT_DIR, filename)
        img.convert("RGB").save(final_path, "PNG", optimize=True)
        print(f"  -> {final_path}")
        
        # Clean up base
        if os.path.exists(base_path):
            os.remove(base_path)
        
        results.append((filename, True))
    
    print(f"\n{'='*60}")
    succeeded = sum(1 for _, s in results if s)
    print(f"Complete: {succeeded}/{len(results)} succeeded")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
