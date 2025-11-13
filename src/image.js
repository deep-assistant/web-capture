import { createBrowser, getBrowserEngine } from './browser.js';
import { convertGoogleDriveUrl } from './lib.js';
import fetch from 'node-fetch';

export async function imageHandler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    // Ensure URL is absolute
    let absoluteUrl = url.startsWith('http') ? url : `https://${url}`;

    // Check if this is a Google Drive URL
    const originalUrl = absoluteUrl;
    const convertedUrl = convertGoogleDriveUrl(absoluteUrl);
    const isGoogleDriveUrl = originalUrl !== convertedUrl;

    // If it's a Google Drive URL converted to direct download, fetch the image directly
    if (isGoogleDriveUrl) {
      const response = await fetch(convertedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      const buffer = Buffer.from(await response.arrayBuffer());

      // Set appropriate content type
      res.set('Content-Type', contentType || 'image/jpeg');
      res.set('Content-Disposition', 'inline; filename="image.jpg"');
      res.end(buffer);
      return;
    }

    // For non-Google Drive URLs, use browser to take screenshot
    absoluteUrl = convertedUrl;
    const engine = getBrowserEngine(req);
    const browser = await createBrowser(engine);
    try {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Charset': 'utf-8'
      });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(absoluteUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      // Wait for 5 seconds after page load
      await new Promise(resolve => setTimeout(resolve, 5000));
      // Take a screenshot of just the viewport (not the full page)
      const buffer = await page.screenshot({ type: 'png' });
      res.set('Content-Type', 'image/png');
      res.set('Content-Disposition', 'inline; filename="screenshot.png"');
      res.end(buffer);
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error capturing screenshot');
  }
} 