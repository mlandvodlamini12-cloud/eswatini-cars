#!/usr/bin/env python3
"""Generate 2 powerful 'Coming Soon' intro images for Eswatini Cars.

No app name mentioned. Highlights:
- A premium car marketplace coming to Eswatini
- Key features (browse, sell, verified, safe)
- 'Coming Soon' / 'Under Development' / 'Loading...' mood
- Designed for WhatsApp status (1080x1920 portrait) + Facebook (1200x630 landscape)

Two images:
1. Portrait (1080x1920) — WhatsApp status format
2. Landscape (1200x630) — Facebook page / link preview format
"""
import os
import subprocess

OUTPUT_DIR = "/home/z/my-project/download/coming-soon-intros"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Two images — different aspect ratios for different platforms
IMAGES = [
    (
        "01_coming_soon_whatsapp_status.png",
        "768x1344",  # portrait, closest supported size to 1080x1920
        "A cinematic dramatic 'Coming Soon' teaser image for a premium vehicle "
        "marketplace app launching in Eswatini. A sleek silhouette of a luxury "
        "car emerging from darkness with golden light rays breaking through, "
        "Eswatini landscape silhouette in the background (mountains and acacia "
        "trees), the car's headlights glowing, mysterious and anticipation-"
        "building atmosphere. Dark navy and gold color palette. Bold "
        "typography space reserved at top and bottom. NO TEXT, NO LOGO, "
        "NO WORDS — just the cinematic visual. Photorealistic, 4K, dramatic "
        "cinematic lighting, golden hour breaking through clouds. Leave the "
        "top third relatively empty (dark) for text overlay, and the bottom "
        "third with the car silhouette."
    ),
    (
        "02_coming_soon_facebook_banner.png",
        "1440x720",  # landscape, closest supported size to 1200x630
        "A wide cinematic 'Coming Soon' teaser banner for a premium vehicle "
        "marketplace app. A row of different vehicles (sedan, bakkie/truck, "
        "SUV, motorcycle) lined up in silhouette against a dramatic Eswatini "
        "sunset sky, golden light flooding from behind, dust particles in the "
        "air, the vehicles' headlights and taillights glowing. Wide cinematic "
        "composition, dark navy sky transitioning to gold at the horizon. "
        "Mysterious, premium, anticipation-building. NO TEXT, NO LOGO, "
        "NO WORDS — just the cinematic visual. Photorealistic, 4K, epic "
        "wide shot. Leave the center relatively clear for text overlay."
    ),
]

def generate_image(prompt, size, output_path):
    cmd = ["z-ai", "image", "--prompt", prompt, "--output", output_path, "--size", size]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    return result.returncode == 0 and os.path.exists(output_path), result.stderr

def main():
    print(f"Generating {len(IMAGES)} Coming Soon intro images...\n")
    for filename, size, prompt in IMAGES:
        print(f"Generating: {filename} ({size})")
        output_path = os.path.join(OUTPUT_DIR, filename)
        success, error = generate_image(prompt, size, output_path)
        if success:
            size_kb = os.path.getsize(output_path) // 1024
            print(f"  OK: {output_path} ({size_kb} KB)")
        else:
            print(f"  FAILED: {error[:200]}")
    print("\nDone.")

if __name__ == "__main__":
    main()
