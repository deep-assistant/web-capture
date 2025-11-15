import { fetchHtml, convertHtmlToMarkdown, convertToUtf8, convertRelativeUrls } from './lib.js';
import { createBrowser, getBrowserEngine } from './browser.js';

export async function markdownHandler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    // Ensure URL is absolute
    const absoluteUrl = url.startsWith('http') ? url : `https://${url}`;

    // First try to fetch HTML directly
    let html = await fetchHtml(absoluteUrl);

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
        // Get the rendered HTML
        const renderedHtml = await page.content();
        html = renderedHtml;
      } finally {
        await browser.close();
      }
    }

    // Pass baseUrl to convertHtmlToMarkdown so all URLs are absolute
    const markdown = convertHtmlToMarkdown(html, absoluteUrl);
    res.type('text/markdown').send(markdown);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error converting to Markdown');
  }
}