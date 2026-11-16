#!/usr/bin/env python3
"""Generate 10 cat meme images with text overlays.

For each meme:
1. Generate the base cat scene image with z-ai CLI
2. Add classic Impact-font meme text on top with PIL
3. Save to /home/z/my-project/download/cat-memes/
"""
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "/home/z/my-project/download/cat-memes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 10 cat memes — each is (filename, AI prompt, top_text, bottom_text)
MEMES = [
    (
        "01_this_is_fine_cat.png",
        "A calm orange tabby cat sitting on a chair in a room that is on fire, "
        "flames visible in the background, the cat is holding a small coffee mug "
        "with its paw, serene expression, photorealistic, 4K, meme composition, "
        "the cat looks unbothered by the fire around it.",
        "THIS IS FINE",
        ""
    ),
    (
        "02_they_dont_know_cat.png",
        "A sad-looking gray cat standing in the corner of a crowded party scene, "
        "holding a red plastic cup, other cats (in the background blurred) are "
        "dancing and socializing, the gray cat looks isolated and contemplative, "
        "photorealistic, 4K, party atmosphere with string lights, meme composition.",
        "",
        "THEY DON'T KNOW I POOPED IN A BOX 5 MIN AGO"
    ),
    (
        "03_distracted_boyfriend_cat.png",
        "A classic meme composition: a brown tabby cat walking with a white cat "
        "(looking at the brown cat lovingly), but the brown cat has turned its "
        "head to stare at an orange tabby cat walking past in the opposite "
        "direction, all three cats visible, photorealistic, 4K, street scene "
        "background, the brown cat's expression is shocked interest.",
        "ME",
        "A SHINY OBJECT / MY RESPONSIBILITIES"
    ),
    (
        "04_is_this_a_pigeon_cat.png",
        "A confused-looking tuxedo cat pointing its paw at a TV remote control "
        "on a table, the cat has a puzzled expression with head tilted, "
        "photorealistic, 4K, living room background, meme composition, the cat "
        "is staring at the remote with genuine confusion.",
        "",
        "IS THIS A CAN OPENER?"
    ),
    (
        "05_crying_cat_thumbs_up.png",
        "A close-up of a cat's face with large sad teary eyes and tears running "
        "down its cheeks, but the cat is giving a thumbs up gesture with its paw, "
        "the contrast between the crying face and the positive gesture is the joke, "
        "photorealistic, 4K, soft lighting, meme composition.",
        "",
        "WHEN HUMAN SAYS 'ONE MORE EPISODE' BUT IT'S 3AM"
    ),
    (
        "06_two_buttons_sweating_cat.png",
        "A cat standing in front of a control panel with two large red buttons, "
        "the cat is sweating profusely with sweat droplets visible, agonizing "
        "expression trying to decide which button to press, photorealistic, 4K, "
        "the two buttons are clearly visible side by side.",
        "KNOCK GLASS OFF TABLE",
        "SLEEP 18 HOURS"
    ),
    (
        "07_drake_hotline_cat.png",
        "Two-panel vertical meme image: TOP panel shows a brown tabby cat turning "
        "away in disgust with paw raised dismissively; BOTTOM panel shows the same "
        "brown tabby cat with a pleased happy expression pointing approvingly, "
        "photorealistic, 4K, both panels clearly separated, classic Drake meme "
        "composition adapted for a cat.",
        "WET FOOD IN A BOWL",
        "THE EXACT SAME FOOD ON A TINY PLATE"
    ),
    (
        "08_disaster_girl_cat.png",
        "A scene viewed from behind: a house is on fire in the background with "
        "firefighters and flames, but in the foreground a small calico cat has "
        "turned its head to look back at the camera with a sinister knowing smile, "
        "photorealistic, 4K, the cat's expression is mischievous and guilty, "
        "classic Disaster Girl meme composition.",
        "",
        "I TOLD THEM NOT TO LEAVE THE LASER POINTER ON"
    ),
    (
        "09_hide_the_pain_cat.png",
        "A close-up of a cat's face with a forced unnatural smile (mouth slightly "
        "open showing teeth) but the eyes show deep pain and exhaustion, classic "
        "Hide the Pain Harold composition, photorealistic, 4K, the contrast "
        "between the smile and the pained eyes is the joke, soft lighting.",
        "",
        "WHEN HUMAN SAYS 'LET ME HOLD YOU' FOR THE 47TH TIME"
    ),
    (
        "10_first_world_problems_cat.png",
        "A fluffy white Persian cat with a towel draped over its head, looking "
        "mildly inconvenienced and slightly sad, sitting on a kitchen counter, "
        "photorealistic, 4K, classic First World Problems meme composition, "
        "the cat's expression is mild discontent.",
        "",
        "HUMAN BOUGHT THE WRONG FLAVOR OF EXPENSIVE WET FOOD"
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
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    return result.returncode == 0 and os.path.exists(output_path), result.stderr

def add_meme_text(image_path, top_text, bottom_text, output_path):
    """Add classic Impact-font meme text to the image."""
    img = Image.open(image_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    width, height = img.size

    # Use Impact font (or fallback to DejaVu Sans Bold)
    # Impact is the classic meme font
    font_size = int(width * 0.09)  # ~9% of image width
    try:
        # Nimbus Sans Narrow Bold is condensed — closest to Impact available on this system
        font = ImageFont.truetype("/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Bold.otf", font_size)
    except (IOError, OSError):
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except (IOError, OSError):
            font = ImageFont.load_default()

    # Classic meme text style: white text with thick black outline
    def draw_text_with_outline(text, y_pos, anchor="center_top"):
        if not text:
            return
        # Convert to uppercase for classic meme style
        text = text.upper()
        # Wrap text if too long
        max_chars_per_line = 22  # approximate for 1024px width at this font size
        words = text.split()
        lines = []
        current_line = []
        current_len = 0
        for word in words:
            if current_len + len(word) + (1 if current_line else 0) <= max_chars_per_line:
                current_line.append(word)
                current_len += len(word) + (1 if current_len > 0 else 0)
            else:
                if current_line:
                    lines.append(" ".join(current_line))
                current_line = [word]
                current_len = len(word)
        if current_line:
            lines.append(" ".join(current_line))

        # Draw each line with outline
        line_height = font_size + 8
        if anchor == "center_top":
            start_y = y_pos
        else:  # center_bottom
            start_y = y_pos - (len(lines) * line_height) + line_height

        for i, line in enumerate(lines):
            try:
                bbox = draw.textbbox((0, 0), line, font=font)
                text_width = bbox[2] - bbox[0]
            except AttributeError:
                text_width = draw.textlength(line, font=font)
            x = (width - text_width) // 2
            y = start_y + (i * line_height)
            # Draw outline (black) by drawing the text offset in 8 directions
            outline_color = (0, 0, 0, 255)
            for ox, oy in [(-2, 0), (2, 0), (0, -2), (0, 2), (-2, -2), (2, -2), (-2, 2), (2, 2)]:
                draw.text((x + ox, y + oy), line, font=font, fill=outline_color)
            # Draw main text (white)
            draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))

    # Top text (with padding from top)
    if top_text:
        draw_text_with_outline(top_text, 20, anchor="center_top")
    # Bottom text (with padding from bottom)
    if bottom_text:
        draw_text_with_outline(bottom_text, height - 20, anchor="center_bottom")

    # Save
    img.convert("RGB").save(output_path, "PNG", optimize=True)

def main():
    print(f"Generating {len(MEMES)} cat memes...")
    print(f"Output directory: {OUTPUT_DIR}\n")

    results = []
    for i, (filename, prompt, top_text, bottom_text) in enumerate(MEMES, 1):
        print(f"[{i}/10] {filename}")
        # Step 1: generate base image
        base_path = os.path.join(OUTPUT_DIR, f"base_{filename}")
        success, error = generate_base_image(prompt, base_path)
        if not success:
            print(f"  ❌ base generation failed: {error[:200]}")
            results.append((filename, False, error))
            continue
        print(f"  ✓ base image generated ({os.path.getsize(base_path) // 1024} KB)")
        # Step 2: add meme text
        final_path = os.path.join(OUTPUT_DIR, filename)
        try:
            add_meme_text(base_path, top_text, bottom_text, final_path)
            print(f"  ✓ meme text added → {final_path}")
            results.append((filename, True, final_path))
        except Exception as e:
            print(f"  ❌ text overlay failed: {e}")
            # If text fails, just use the base image
            os.rename(base_path, final_path)
            results.append((filename, True, final_path))
        # Clean up base image
        if os.path.exists(base_path) and base_path != final_path:
            os.remove(base_path)

    print(f"\n{'='*60}")
    print(f"Generation complete: {sum(1 for r in results if r[1])}/{len(results)} succeeded")
    print(f"{'='*60}")
    for filename, success, info in results:
        status = "✓" if success else "❌"
        print(f"  {status} {filename}")

if __name__ == "__main__":
    main()
