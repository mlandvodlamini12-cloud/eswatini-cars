"""Create Facebook profile picture variants from the generated icon.

Creates:
1. eswatini-cars-fb-profile-512.png — Facebook's recommended upload size (512x512)
2. eswatini-cars-fb-profile-preview-circle.png — A circular preview showing
   exactly how the icon will look when displayed as a Facebook profile picture

Source: /home/z/my-project/download/eswatini-cars-fb-profile-v2.png (1024x1024)
"""
from PIL import Image, ImageDraw
import os

SRC = '/home/z/my-project/download/eswatini-cars-fb-profile-v2.png'
OUT_DIR = '/home/z/my-project/download'

# 1. Create the 512x512 version (Facebook's recommended upload size).
# Facebook will downscale this to 170x170 for display, but uploading 512x512
# keeps it crisp on retina/high-DPI screens.
img_1024 = Image.open(SRC).convert('RGB')
img_512 = img_1024.resize((512, 512), Image.LANCZOS)
out_512 = os.path.join(OUT_DIR, 'eswatini-cars-fb-profile-512.png')
img_512.save(out_512, 'PNG', optimize=True)
print(f'Created: {out_512} ({img_512.size[0]}x{img_512.size[1]})')

# 2. Create a circular preview — this is what the profile pic will actually
# look like on Facebook (which displays profile pictures as circles).
# We use an alpha mask to cut out the corners.
size = 1024
mask = Image.new('L', (size, size), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((0, 0, size - 1, size - 1), fill=255)

# Create an RGBA version with the circular mask applied
img_rgba = img_1024.convert('RGBA')
# Apply the mask to the alpha channel
img_rgba.putalpha(mask)

out_circle = os.path.join(OUT_DIR, 'eswatini-cars-fb-profile-preview-circle.png')
img_rgba.save(out_circle, 'PNG', optimize=True)
print(f'Created: {out_circle} ({img_rgba.size[0]}x{img_rgba.size[1]}, with circular alpha mask)')

# 3. Also save a 512x512 circular version (smaller file size, same effect)
img_circle_512 = img_rgba.resize((512, 512), Image.LANCZOS)
out_circle_512 = os.path.join(OUT_DIR, 'eswatini-cars-fb-profile-circle-512.png')
img_circle_512.save(out_circle_512, 'PNG', optimize=True)
print(f'Created: {out_circle_512} ({img_circle_512.size[0]}x{img_circle_512.size[1]})')

print('\nAll variants created. Sizes:')
for f in [out_512, out_circle, out_circle_512]:
    print(f'  {f}: {os.path.getsize(f):,} bytes')
