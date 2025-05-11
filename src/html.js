import { fetchHtml, convertToUtf8, convertRelativeUrls } from './lib.js';
import puppeteer from 'puppeteer';

export async function htmlHandler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    // Ensure URL is absolute
    const absoluteUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // First try to fetch HTML directly
    const html = await fetchHtml(absoluteUrl);
    
    // Check if it's valid HTML and contains JavaScript
    const hasJavaScript = /<script[^>]*>[\s\S]*?<\/script>|<script[^>]*\/>|javascript:/i.test(html);
    const isHtml = /<html[^>]*>[\s\S]*?<\/html>/i.test(html);
    
    if (!isHtml || hasJavaScript) {
      // If not HTML or contains JavaScript, use Puppeteer to get rendered HTML
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      try {
        const page = await browser.newPage();
        
        // Set proper encoding headers
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Charset': 'utf-8'
        });

        // Navigate to the page
        await page.goto(absoluteUrl, { 
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        // Get the rendered HTML, convert to UTF-8, and make URLs absolute
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