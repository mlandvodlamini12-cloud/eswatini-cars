#!/usr/bin/env python3
"""Generate 10 genuinely-funny memes about relatable human moments.

No cats this time. These are memes with an actual comedic sting —
setup → punchline structure, where the text subverts the image.
"""
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "/home/z/my-project/download/funny-memes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 10 memes with actual punchlines — setup + twist
# Each tuple: (filename, AI prompt, top_text, bottom_text)
MEMES = [
    (
        "01_explaining_bug_feature.png",
        "A stressed programmer sitting at a desk with a laptop, gesturing wildly "
        "with both hands as if passionately defending something, the boss seen "
        "from behind in the foreground, photorealistic, 4K, corporate office "
        "setting, the programmer has a desperate 'trust me' expression, screen "
        "visible with red error text.",
        "ME EXPLAINING TO MY BOSS",
        "WHY THE BUG IS ACTUALLY A FEATURE"
    ),
    (
        "02_six_hours_typo.png",
        "Close-up of a programmer's face lit by laptop screen light in a dark "
        "room, hand on forehead, expression of pure disgusted disbelief, coffee "
        "cups stacked around, photorealistic, 4K, late night debugging session, "
        "the face says 'I wasted 6 hours of my life on this'.",
        "ME AFTER 6 HOURS OF DEBUGGING",
        "IT WAS A MISSING COMMA"
    ),
    (
        "03_serves_4_eating_alone.png",
        "A person in pajamas standing at a kitchen sink at night eating directly "
        "from a large cooking pot with a fork, defeated posture, kitchen lit "
        "only by the stove light, photorealistic, 4K, sad late-night eating "
        "atmosphere, the scene is both pathetic and relatable.",
        "RECIPE SAYS 'SERVES 4'",
        "ME EATING IT ALONE OVER THE SINK AT 2 AM"
    ),
    (
        "04_wave_back_wrong_person.png",
        "A person mid-wave with hand raised and an awkward forced smile, looking "
        "behind themselves to see who was actually being waved at, embarrassed "
        "realization expression, photorealistic, 4K, outdoor setting, the moment "
        "of social death.",
        "WHEN YOU WAVE BACK",
        "BUT THEY WERE WAVING AT THE PERSON BEHIND YOU"
    ),
    (
        "05_brain_3am.png",
        "A person lying in bed at 3am, eyes wide open staring at the ceiling, "
        "phone on chest forgotten, complete darkness except for moonlight, "
        "photorealistic, 4K, the face shows vivid unwanted memories playing "
        "behind the eyes, sleep is not happening.",
        "MY BRAIN AT 3 AM:",
        "LET'S REMEMBER EVERY EMBARRASSING MOMENT FROM 2014"
    ),
    (
        "06_toxic_trait_remember.png",
        "A person walking away from a sticky note on a refrigerator with a "
        "confident smirk, the note visible with unread text, photorealistic, "
        "4K, kitchen background, the person is about to forget what they just "
        "decided not to write down, the confidence is the joke.",
        "MY TOXIC TRAIT:",
        "THINKING I'LL DEFINITELY REMEMBER THIS WITHOUT WRITING IT DOWN"
    ),
    (
        "07_dentist_flossing.png",
        "A patient in a dentist chair with a confident lying smile and direct "
        "eye contact with the dentist, the dentist in the background with a "
        "knowing skeptical expression, photorealistic, 4K, dental office, the "
        "patient is lying with full confidence.",
        "DENTIST: 'HAVE YOU BEEN FLOSSING?'",
        "ME: 'OF COURSE' (I HAVE NEVER FLOSSED)"
    ),
    (
        "08_back_hurts_30.png",
        "A person getting out of bed in the morning, hand gripping their lower "
        "back in pain, pained grimace, morning light through window, photorealistic, "
        "4K, the pain of aging, the bed in the background, person bent slightly "
        "forward holding their back.",
        "ME AT 30:",
        "MY BACK HURTS BECAUSE I SLEPT WRONG"
    ),
    (
        "09_circle_back_face.png",
        "A forced fake corporate smile close-up, mouth smiling but eyes completely "
        "dead and done, the classic 'I'm pretending to be professional but I want "
        "to leave' expression, photorealistic, 4K, office background blurred, "
        "the smile is tight and insincere.",
        "THE FACE I MAKE",
        "WHEN SOMEONE SAYS 'LET'S CIRCLE BACK'"
    ),
    (
        "10_just_one_chip.png",
        "A completely empty chip bag lying on its side on a couch cushion, a "
        "single chip crumb visible, dramatic lighting like a crime scene photo, "
        "photorealistic, 4K, the empty bag is the punchline, no person visible, "
        "just the evidence of the crime.",
        "ME: 'I'LL JUST HAVE ONE CHIP'",
        "THE CHIP BAG 20 MINUTES LATER:"
    ),
]

def generate_base_image(prompt, output_path):
    cmd = ["z-ai", "image", "--prompt", prompt, "--output", output_path, "--size", "1024x1024"]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    return result.returncode == 0 and os.path.exists(output_path), result.stderr

def get_font(size):
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

def measure_block(lines, font):
    line_height = font.size + 6
    total_height = len(lines) * line_height
    return total_height

def draw_text_block(draw, lines, font, img_width, y_start):
    line_height = font.size + 6
    for i, line in enumerate(lines):
        try:
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
        except AttributeError:
            text_width = draw.textlength(line, font=font)
        x = (img_width - text_width) // 2
        y = y_start + i * line_height
        outline = (0, 0, 0, 255)
        for ox, oy in [(-3, 0), (3, 0), (0, -3), (0, 3),
                       (-2, -2), (2, -2), (-2, 2), (2, 2),
                       (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            draw.text((x + ox, y + oy), line, font=font, fill=outline)
        draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))

def add_meme_text(image_path, top_text, bottom_text, output_path):
    img = Image.open(image_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    width, height = img.size
    margin_x = 30
    margin_y = 20
    max_text_width = width - 2 * margin_x
    top_max_height = int(height * 0.35)
    bottom_max_height = int(height * 0.35)

    def fit_and_draw(text, y_start, max_block_height, anchor="top"):
        if not text:
            return
        text = text.upper()
        font_size = int(width * 0.10)
        min_font_size = int(width * 0.045)
        while font_size >= min_font_size:
            font = get_font(font_size)
            lines = wrap_text(text, font, draw, max_text_width)
            block_h = measure_block(lines, font)
            if block_h <= max_block_height:
                if anchor == "top":
                    draw_y = y_start
                else:
                    draw_y = y_start - block_h
                draw_text_block(draw, lines, font, width, draw_y)
                return
            font_size -= 2
        font = get_font(min_font_size)
        lines = wrap_text(text, font, draw, max_text_width)
        if anchor == "bottom":
            block_h = measure_block(lines, font)
            draw_y = y_start - block_h
        else:
            draw_y = y_start
        draw_text_block(draw, lines, font, width, draw_y)

    if top_text:
        fit_and_draw(top_text, margin_y, top_max_height, anchor="top")
    if bottom_text:
        fit_and_draw(bottom_text, height - margin_y, bottom_max_height, anchor="bottom")
    img.convert("RGB").save(output_path, "PNG", optimize=True)

def main():
    print(f"Generating {len(MEMES)} funny memes (no cats)...")
    print(f"Output: {OUTPUT_DIR}\n")
    for i, (filename, prompt, top_text, bottom_text) in enumerate(MEMES, 1):
        print(f"[{i}/10] {filename}")
        base_path = os.path.join(OUTPUT_DIR, f"base_{filename}")
        success, error = generate_base_image(prompt, base_path)
        if not success:
            print(f"  X failed: {error[:200]}")
            continue
        print(f"  + base ({os.path.getsize(base_path) // 1024} KB)")
        final_path = os.path.join(OUTPUT_DIR, filename)
        try:
            add_meme_text(base_path, top_text, bottom_text, final_path)
            print(f"  + text added")
        except Exception as e:
            print(f"  X text failed: {e}")
            os.rename(base_path, final_path)
        if os.path.exists(base_path) and base_path != final_path:
            os.remove(base_path)
    print("\nDone.")

if __name__ == "__main__":
    main()
