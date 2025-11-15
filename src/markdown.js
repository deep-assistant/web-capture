import fetch from 'node-fetch';
import { fetchHtml, convertHtmlToMarkdown, isTextPasteUrl, normalizeUrlForTextContent } from './lib.js';
import archiver from 'archiver';

export async function markdownHandler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');

  try {
    // Check if this is a text paste URL (like xpaste.pro)
    if (isTextPasteUrl(url)) {
      return await handleTextPasteMarkdown(req, res, url);
    }

    // Regular HTML to markdown conversion
    const html = await fetchHtml(url);
    // Pass baseUrl to convertHtmlToMarkdown so all URLs are absolute
    const markdown = convertHtmlToMarkdown(html, url);
    res.type('text/markdown').send(markdown);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error converting to Markdown');
  }
}

async function handleTextPasteMarkdown(req, res, url) {
  // Fetch the HTML version of the page to get the full visual content
  // (including UI elements, metadata, etc.) as it appears in screenshots
  const html = await fetchHtml(url);
  const markdown = convertHtmlToMarkdown(html, url);

  // Count lines to determine if we should create a zip archive
  const lines = markdown.split('\n');
  const lineCount = lines.length;

  // Get filename from URL for potential zip file
  const urlObj = new URL(url);
  const pasteId = urlObj.pathname.split('/').pop();
  const filename = `xpaste-pro-${pasteId}.md`;

  // If content is less than 1500 lines, return markdown directly
  if (lineCount < 1500) {
    res.type('text/markdown').send(markdown);
  } else {
    // Create a zip archive with index.md and the full markdown file
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Set response headers for zip download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${pasteId}.zip"`);

    // Pipe archive to response
    archive.pipe(res);

    // Add index.md with link to the full markdown file
    const indexMarkdown = `# ${url}

Content from: ${url}

The full content is available in [${filename}](${filename}) (${lineCount} lines).
`;
    archive.append(indexMarkdown, { name: 'index.md' });

    // Add the full markdown file
    archive.append(markdown, { name: filename });

    // Finalize the archive
    await archive.finalize();
  }
}