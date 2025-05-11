// Common logic for the web-capture microservice
import fetch from 'node-fetch';
import TurndownService from 'turndown';

export async function fetchHtml(url) {
  if (!url) throw new Error('Missing URL parameter');
  const response = await fetch(url);
  return response.text();
}

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