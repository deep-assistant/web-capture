import express from 'express';
import fetch from 'node-fetch';
import TurndownService from 'turndown';
import captureWebsite from 'capture-website';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Exportable function to fetch HTML from a URL
export async function fetchHtml(url) {
  if (!url) throw new Error('Missing URL parameter');
  const response = await fetch(url);
  return response.text();
}

// Exportable function to convert HTML to Markdown
export function convertHtmlToMarkdown(html) {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    bulletListMarker: '-',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
    hr: '---',
    style: false // Ignore style tags
  });
  // Remove any inline CSS
  const cleanHtml = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  return turndown.turndown(cleanHtml);
}

// Route: Fetch raw HTML
app.get('/html', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    const html = await fetchHtml(url);
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
    const html = await fetchHtml(url);
    const markdown = convertHtmlToMarkdown(html);
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
    let buffer = await captureWebsite.buffer(url, {
      fullPage: true,
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    });
    // Debug: log type and first bytes
    console.log('Type of buffer:', typeof buffer, 'Is Buffer:', Buffer.isBuffer(buffer));
    console.log('First 16 bytes:', Buffer.from(buffer).slice(0, 16));
    if (!(buffer instanceof Buffer)) {
      buffer = Buffer.from(buffer);
    }
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', 'inline; filename="screenshot.png"');
    res.end(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error capturing screenshot');
  }
});

// Start the server if this is the main module
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
let server;
if (isMainModule) {
  console.log('Process PID:', process.pid);
  server = app.listen(port, () => {
    console.log(`Renderer service listening on http://localhost:${port}`);
  });

  // Graceful shutdown for Docker
  function shutdown(signal) {
    console.log(`Received shutdown signal (${signal}), closing server...`);
    server.close(() => {
      console.log('Server closed. Exiting process.');
      process.exit(0);
    });
    // Force exit if not closed in 2 seconds
    setTimeout(() => {
      console.error('Force exiting after 2s');
      process.exit(1);
    }, 2000);
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('exit', (code) => {
    console.log('Process exit event with code:', code);
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

export { app };
