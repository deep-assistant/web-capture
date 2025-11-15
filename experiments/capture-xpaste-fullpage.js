import fetch from 'node-fetch';
import fs from 'fs';

const baseUrl = 'http://localhost:3000';
const targetUrl = 'https://xpaste.pro/p/t4q0Lsp0';

console.log('Capturing full-page screenshot of xpaste.pro/p/t4q0Lsp0...');
const imageResponse = await fetch(`${baseUrl}/image?url=${encodeURIComponent(targetUrl)}&fullPage=true&engine=playwright`);

if (!imageResponse.ok) {
  console.error('Failed to capture screenshot:', await imageResponse.text());
  process.exit(1);
}

const imageBuffer = await imageResponse.buffer();
const outputPath = 'examples/xpaste/t4q0Lsp0-screenshot.png';
fs.writeFileSync(outputPath, imageBuffer);
console.log(`Full-page screenshot saved to ${outputPath}`);
console.log(`Screenshot size: ${imageBuffer.length} bytes`);
