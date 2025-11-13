import { fetchHtml, convertHtmlToMarkdown, convertGoogleDriveUrl } from './lib.js';

export async function markdownHandler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    // Convert Google Drive URLs to direct download links
    const convertedUrl = convertGoogleDriveUrl(url);

    const html = await fetchHtml(convertedUrl);
    // Pass baseUrl to convertHtmlToMarkdown so all URLs are absolute
    const markdown = convertHtmlToMarkdown(html, convertedUrl);
    res.type('text/markdown').send(markdown);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error converting to Markdown');
  }
}