import { fetchHtml, convertToUtf8, convertRelativeUrls, convertGoogleDriveUrl } from './lib.js';
import { createBrowser, getBrowserEngine } from './browser.js';
import fetch from 'node-fetch';

export async function htmlHandler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    // Ensure URL is absolute
    let absoluteUrl = url.startsWith('http') ? url : `https://${url}`;

    // Check if this is a Google Drive URL
    const originalUrl = absoluteUrl;
    const convertedUrl = convertGoogleDriveUrl(absoluteUrl);
    const isGoogleDriveUrl = originalUrl !== convertedUrl;

    // If it's a Google Drive URL, check if it's an image
    if (isGoogleDriveUrl) {
      const response = await fetch(convertedUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.startsWith('image/')) {
        // For images, create a simple HTML page displaying the image
        const simpleHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Google Drive Image</title>
  <style>
    body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
    img { max-width: 100%; height: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <img src="${convertedUrl}" alt="Google Drive Image">
</body>
</html>`;
        res.type('text/html; charset=utf-8').send(simpleHtml);
        return;
      }
    }

    // For non-image URLs, proceed with normal HTML fetching
    absoluteUrl = convertedUrl;

    // First try to fetch HTML directly
    const html = await fetchHtml(absoluteUrl);

    // Check if it's valid HTML and contains JavaScript
    const hasJavaScript = /<script[^>]*>[\s\S]*?<\/script>|<script[^>]*\/>|javascript:/i.test(html);
    const isHtml = /<html[^>]*>[\s\S]*?<\/html>/i.test(html);

    if (!isHtml || hasJavaScript) {
      // If not HTML or contains JavaScript, use browser to get rendered HTML
      const engine = getBrowserEngine(req);
      const browser = await createBrowser(engine);
      try {
        const page = await browser.newPage();

        // Set proper encoding headers
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Charset': 'utf-8'
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        // Navigate to the page
        await page.goto(absoluteUrl, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });
        // Wait for 5 seconds after page load
        await new Promise(resolve => setTimeout(resolve, 5000));
        // Get the rendered HTML, convert to UTF-8, and make URLs absolute (and inject runtime JS hook)
        const renderedHtml = await page.content();
        const utf8Html = convertToUtf8(renderedHtml);
        const absoluteHtml = convertRelativeUrls(utf8Html, absoluteUrl);

        res.type('text/html; charset=utf-8').send(absoluteHtml);
      } finally {
        await browser.close();
      }
    } else {
      // If it's plain HTML without JavaScript, convert to UTF-8 and make URLs absolute
      const utf8Html = convertToUtf8(html);
      const absoluteHtml = convertRelativeUrls(utf8Html, absoluteUrl);
      res.type('text/html; charset=utf-8').send(absoluteHtml);
    }
  } catch (err) {
    console.error('HTML fetch error:', err);
    res.status(500).send('Error fetching HTML');
  }
} 