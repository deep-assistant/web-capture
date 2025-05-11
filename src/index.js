import express from 'express';
import fetch from 'node-fetch';
import TurndownService from 'turndown';
import captureWebsite from 'capture-website';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Route: Fetch raw HTML
app.get('/html', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    const response = await fetch(url);
    const html = await response.text();
    res.type('text/html').send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching HTML');
  }
});

// Route: Convert HTML to Markdown
app.get('/markdown', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    const response = await fetch(url);
    const html = await response.text();
    const turndown = new TurndownService();
    const markdown = turndown.turndown(html);
    res.type('text/markdown').send(markdown);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error converting to Markdown');
  }
});

// Route: Capture screenshot as PNG
app.get('/image', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    const buffer = await captureWebsite.buffer(url, { fullPage: true });
    res.type('image/png').send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error capturing screenshot');
  }
});

// Start the server if this is the main module
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMainModule) {
  app.listen(port, () => {
    console.log(`Renderer service listening on http://localhost:${port}`);
  });
}

export { app };
