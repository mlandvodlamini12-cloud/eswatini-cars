// Recolor the steering wheel icon using z-ai-web-dev-sdk
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function recolorIcon() {
  const zai = await ZAI.create();

  // Read the uploaded image and convert to base64 data URL
  const imageBuffer = fs.readFileSync('/home/z/my-project/upload/b94ea959-189b-4c09-946c-9b7807f4c528.png');
  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64}`;

  console.log('Sending image edit request...');

  const response = await zai.images.generations.edit({
    prompt: 'Change the golden steering wheel to bright sky blue metallic color (#0ea5e9), but keep the crown on top gold colored. Keep the dark navy blue gradient background. Maintain the same 3D glossy design and composition.',
    images: [{ url: dataUrl }],
    size: '1024x1024',
  });

  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');
  fs.writeFileSync('/home/z/my-project/public/icons/icon-1024.png', buffer);
  console.log('✓ Recolored icon saved to public/icons/icon-1024.png');
  console.log(`  Size: ${buffer.length} bytes`);
}

recolorIcon().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
