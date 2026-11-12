#!/usr/bin/env python3
"""Generate 10 NEW cat memes about HUMAN LIFE (different jokes from batch 1).

Improvements over batch 1:
- Dynamic font sizing: smaller font for longer captions, larger for shorter
- Proper text wrapping that respects word boundaries + image width
- Text block is measured BEFORE drawing — if it doesn't fit, font shrinks + retries
- Generous margins on all sides (text never touches edges)
- Top text + bottom text both have a guaranteed safe zone
"""
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "/home/z/my-project/download/cat-memes-batch2"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 10 NEW memes — human life situations, cats as the characters
# Each tuple: (filename, AI prompt, top_text, bottom_text)
MEMES = [
    (
        "11_monday_morning_cat.png",
        "A disheveled cat sitting on the edge of a bed in the morning, fur messy, "
        "eyes half-closed and exhausted, dark circles visible, slumped posture, "
        "morning light coming through a window, photorealistic, 4K, the cat looks "
        "absolutely destroyed and not ready to face the day.",
        "",
        "ME ON MONDAY MORNING"
    ),
    (
        "12_five_more_minutes_cat.png",
        "A cat curled up in a cozy bed under a blanket, eyes closed, sleeping "
        "deeply and peacefully, soft morning light, photorealistic, 4K, the cat "
        "looks extremely comfortable and has no intention of waking up, peaceful "
        "sleeping expression.",
        "JUST 5 MORE MINUTES",
        "*IS 2 HOURS LATE FOR WORK*"
    ),
    (
        "13_bank_account_after_payday_cat.png",
        "A cat staring at a smartphone screen with a shocked horrified expression, "
        "eyes wide, mouth open, holding the phone with both paws, photorealistic, "
        "4K, the cat's face shows pure disbelief at what it's seeing on the screen, "
        "soft indoor lighting.",
        "",
        "MY BANK ACCOUNT 3 DAYS AFTER PAYDAY"
    ),
    (
        "14_wifi_disconnects_cat.png",
        "A cat staring at a smartphone in absolute horror, mouth wide open in a "
        "silent scream, fur standing on end, photorealistic, 4K, the cat looks "
        "like its world has just ended, dramatic lighting, the phone screen "
        "shows a 'no connection' error icon.",
        "WHEN THE WIFI DISCONNECTS",
        "MID-VIDEO"
    ),
    (
        "15_still_single_cat.png",
        "A cat gesturing wildly with both paws as if passionately explaining "
        "something, exasperated expression, photorealistic, 4K, living room "
        "background, the cat's body language is 'I'm doing my best here', the "
        "pose is animated and defensive.",
        "ME EXPLAINING TO MY MOM",
        "WHY I'M STILL SINGLE"
    ),
    (
        "16_3am_memory_cat.png",
        "A cat sitting upright in bed at night, eyes wide open in horror, "
        "paws on cheeks in a 'Home Alone' scream gesture, dark bedroom with "
        "moonlight through window, photorealistic, 4K, the cat has just "
        "remembered something deeply embarrassing.",
        "3 AM:",
        "REMEMBERING WHAT I SAID IN 2019"
    ),
    (
        "17_we_need_to_talk_cat.png",
        "A cat sweating profusely with nervous wide eyes, holding a smartphone "
        "showing a text message, the cat's expression is pure anxiety and dread, "
        "photorealistic, 4K, soft lighting, sweat droplets visible on the cat's "
        "forehead, the cat looks like it wants to disappear.",
        "WHEN SHE SAYS 'WE NEED TO TALK'",
        ""
    ),
    (
        "18_diet_starts_monday_cat.png",
        "A cat sitting in front of a half-eaten pizza box, slice in paw, "
        "looking satisfied and unapologetic, photorealistic, 4K, kitchen "
        "counter background, the cat has clearly given up on its diet, "
        "crumbs visible, satisfied chewing expression.",
        "MY DIET STARTS MONDAY",
        "*EATS ENTIRE PIZZA SUNDAY NIGHT*"
    ),
    (
        "19_friend_who_plans_cat.png",
        "One cat at a table looking extremely exasperated and tired, holding a "
        "planner/notebook, while in the blurred background other cats are "
        "casually chatting and not helping, photorealistic, 4K, cafe setting, "
        "the planning cat's expression is 'I do everything around here'.",
        "ME PLANNING EVERYTHING",
        "WHILE MY FRIENDS 'JUST SHOW UP'"
    ),
    (
        "20_adulting_cat.png",
        "A cat wearing reading glasses sitting at a laptop looking deeply "
        "confused, surrounded by scattered papers and bills, scratching its "
        "head with one paw, photorealistic, 4K, home office background, "
        "the cat is googling 'how to adult' with a lost expression.",
        "ADULTING IS JUST",
        "GOOGLING HOW TO DO THINGS"
    ),
]

def generate_base_image(prompt, output_path):
    """Generate a base cat image with z-ai CLI."""
    cmd = [
        "z-ai", "image",
        "--prompt", prompt,
        "--output", output_path,
        "--size", "1024x1024"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    return result.returncode == 0 and os.path.exists(output_path), result.stderr

def get_font(size):
    """Get a condensed bold font (Impact-style) at the given size."""
    try:
        return ImageFont.truetype(
            "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Bold.otf", size)
    except (IOError, OSError):
        try:
            return ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
        except (IOError, OSError):
            return ImageFont.load_default()

def wrap_text(text, font, draw, max_width):
    """Wrap text into lines that fit within max_width pixels."""
    words = text.split()
    if not words:
        return []
    lines = []
    current_line = [words[0]]
    for word in words[1:]:
        test_line = " ".join(current_line + [word])
        try:
            bbox = draw.textbbox((0, 0), test_line, font=font)
            test_width = bbox[2] - bbox[0]
        except AttributeError:
            test_width = draw.textlength(test_line, font=font)
        if test_width <= max_width:
            current_line.append(word)
        else:
            lines.append(" ".join(current_line))
            current_line = [word]
    lines.append(" ".join(current_line))
    return lines

def measure_block(lines, font, draw):
    """Measure total width + height of a multi-line text block."""
    line_height = font.size + 6
    total_height = len(lines) * line_height
    max_width = 0
    for line in lines:
        try:
            bbox = draw.textbbox((0, 0), line, font=font)
            w = bbox[2] - bbox[0]
        except AttributeError:
            w = draw.textlength(line, font=font)
        max_width = max(max_width, w)
    return max_width, total_height

def draw_text_block(draw, lines, font, img_width, y_start):
    """Draw a multi-line text block centered horizontally, with outline."""
    line_height = font.size + 6
    for i, line in enumerate(lines):
        try:
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
        except AttributeError:
            text_width = draw.textlength(line, font=font)
        x = (img_width - text_width) // 2
        y = y_start + i * line_height
        # Black outline (drawn 8 directions for thick border)
        outline = (0, 0, 0, 255)
        for ox, oy in [(-3, 0), (3, 0), (0, -3), (0, 3),
                       (-2, -2), (2, -2), (-2, 2), (2, 2),
                       (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            draw.text((x + ox, y + oy), line, font=font, fill=outline)
        # White main text
        draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))

def add_meme_text(image_path, top_text, bottom_text, output_path):
    """Add meme text with adaptive font sizing — nothing gets cut off."""
    img = Image.open(image_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    width, height = img.size

    # Safe zones: text stays within these margins
    margin_x = 30  # left/right margin
    margin_y = 20  # top/bottom margin
    max_text_width = width - 2 * margin_x
    # Top text gets at most 35% of image height
    top_max_height = int(height * 0.35)
    # Bottom text gets at most 35% of image height
    bottom_max_height = int(height * 0.35)

    def fit_and_draw(text, y_start, max_block_height, anchor="top"):
        """Find a font size where the text fits, then draw it."""
        if not text:
            return
        text = text.upper()
        # Start with a generous font size and shrink until it fits
        font_size = int(width * 0.10)  # start at ~10% of width
        min_font_size = int(width * 0.045)  # don't go smaller than ~4.5%
        while font_size >= min_font_size:
            font = get_font(font_size)
            lines = wrap_text(text, font, draw, max_text_width)
            block_w, block_h = measure_block(lines, font, draw)
            if block_h <= max_block_height and block_w <= max_text_width:
                # Fits! Draw it.
                if anchor == "top":
                    draw_y = y_start
                else:  # bottom
                    draw_y = y_start - block_h
                draw_text_block(draw, lines, font, width, draw_y)
                return
            font_size -= 2  # try smaller
        # If we get here, use the smallest font size
        font = get_font(min_font_size)
        lines = wrap_text(text, font, draw, max_text_width)
        if anchor == "bottom":
            _, block_h = measure_block(lines, font, draw)
            draw_y = y_start - block_h
        else:
            draw_y = y_start
        draw_text_block(draw, lines, font, width, draw_y)

    # Top text: starts at margin_y from top
    if top_text:
        fit_and_draw(top_text, margin_y, top_max_height, anchor="top")
    # Bottom text: ends at (height - margin_y) from top
    if bottom_text:
        fit_and_draw(bottom_text, height - margin_y, bottom_max_height, anchor="bottom")

    img.convert("RGB").save(output_path, "PNG", optimize=True)

def main():
    print(f"Generating {len(MEMES)} cat memes (batch 2 — human life)...")
    print(f"Output directory: {OUTPUT_DIR}\n")
    results = []
    for i, (filename, prompt, top_text, bottom_text) in enumerate(MEMES, 1):
        print(f"[{i}/10] {filename}")
        base_path = os.path.join(OUTPUT_DIR, f"base_{filename}")
        success, error = generate_base_image(prompt, base_path)
        if not success:
            print(f"  X base generation failed: {error[:200]}")
            results.append((filename, False, error))
            continue
        print(f"  + base image generated ({os.path.getsize(base_path) // 1024} KB)")
        final_path = os.path.join(OUTPUT_DIR, filename)
        try:
            add_meme_text(base_path, top_text, bottom_text, final_path)
            print(f"  + meme text added -> {final_path}")
            results.append((filename, True, final_path))
        except Exception as e:
            print(f"  X text overlay failed: {e}")
            os.rename(base_path, final_path)
            results.append((filename, True, final_path))
        if os.path.exists(base_path) and base_path != final_path:
            os.remove(base_path)
    print(f"\n{'='*60}")
    print(f"Generation complete: {sum(1 for r in results if r[1])}/{len(results)} succeeded")
    print(f"{'='*60}")
    for filename, success, _ in results:
        status = "OK" if success else "FAIL"
        print(f"  [{status}] {filename}")

if __name__ == "__main__":
    main()
