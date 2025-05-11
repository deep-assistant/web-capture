// Common logic for the web-capture microservice
import fetch from 'node-fetch';
import TurndownService from 'turndown';
import iconv from 'iconv-lite';
import { URL } from 'url';

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

// Convert relative URLs to absolute URLs in HTML content
export function convertRelativeUrls(html, baseUrl) {
  const base = new URL(baseUrl);
  
  // Function to convert a single URL
  const toAbsolute = (url) => {
    if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) {
      return url;
    }
    try {
      return new URL(url, base).href;
    } catch (e) {
      return url;
    }
  };

  // Convert URLs in various attributes
  const attributes = [
    { tag: 'a', attr: 'href' },
    { tag: 'img', attr: 'src' },
    { tag: 'script', attr: 'src' },
    { tag: 'link', attr: 'href' },
    { tag: 'form', attr: 'action' },
    { tag: 'video', attr: 'src' },
    { tag: 'audio', attr: 'src' },
    { tag: 'source', attr: 'src' },
    { tag: 'track', attr: 'src' },
    { tag: 'embed', attr: 'src' },
    { tag: 'object', attr: 'data' },
    { tag: 'iframe', attr: 'src' }
  ];

  let result = html;
  
  // Process each attribute type
  for (const { tag, attr } of attributes) {
    const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, 'gi');
    result = result.replace(regex, (match, url) => {
      const absoluteUrl = toAbsolute(url);
      return match.replace(url, absoluteUrl);
    });
  }

  // Also handle inline styles with url()
  result = result.replace(/url\(['"]?([^'"()]+)['"]?\)/gi, (match, url) => {
    const absoluteUrl = toAbsolute(url);
    return `url("${absoluteUrl}")`;
  });

  return result;
}

// Convert HTML content to UTF-8 if it's not already
export function convertToUtf8(html) {
  // First, try to detect the current encoding from meta tag
  const charsetMatch = html.match(/<meta[^>]+charset=["']?([^"'>\s]+)/i);
  const currentCharset = charsetMatch ? charsetMatch[1].toLowerCase() : 'utf-8';

  // If it's already UTF-8, just ensure the meta tag is present
  if (currentCharset === 'utf-8' || currentCharset === 'utf8') {
    if (!charsetMatch) {
      return html.replace(
        /<head[^>]*>/i,
        '$&<meta charset="utf-8">'
      );
    }
    return html;
  }

  // Convert from detected charset to UTF-8
  try {
    // Convert the HTML string to a buffer using the detected charset
    const buffer = iconv.encode(html, currentCharset);
    // Decode the buffer to UTF-8
    const utf8Html = iconv.decode(buffer, 'utf-8');
    
    // Replace the charset meta tag with UTF-8
    return utf8Html.replace(
      /<meta[^>]+charset=["']?[^"'>\s]+["']?/i,
      '<meta charset="utf-8">'
    );
  } catch (error) {
    console.error('Error converting charset:', error);
    // If conversion fails, return original HTML with UTF-8 meta tag
    return html.replace(
      /<head[^>]*>/i,
      '$&<meta charset="utf-8">'
    );
  }
}

// Detect encoding and convert to UTF-8 for Puppeteer-rendered HTML
export function ensureUtf8(html) {
  // If no charset meta tag is present, inject one
  if (!/<meta[^>]+charset/i.test(html)) {
    html = html.replace(
      /<head[^>]*>/i,
      '$&<meta charset="utf-8">'
    );
  }
  return html;
} 