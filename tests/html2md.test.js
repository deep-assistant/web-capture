import { convertHtmlToMarkdown } from '../src/lib.js';

describe('convertHtmlToMarkdown', () => {
  it('removes empty links and anchor headings', () => {
    const html = `
      <a href="/http-api/authorization"></a>
      <a href="/webhooks/authorization"></a>
      <a href="/api-reference/http-api"></a>
      <h3></h3>
      <a href="#quick-start"></a>
      <h3>Quick start</h3>
    `;
    const md = convertHtmlToMarkdown(html);
    // Should not contain empty []() links or [](#anchor) or empty headings
    expect(md).not.toMatch(/\[\s*\]\([^)]*\)/);
    expect(md).not.toMatch(/#+\s*$/m);
    expect(md).not.toMatch(/\[\s*\]\(#.*\)/);
    // Should contain the real heading
    expect(md).toMatch(/### Quick start/);
  });

  it('removes empty links in complex content', () => {
    const html = `
      <div>
        <a href="/foo"></a>
        <a href="/bar">Bar</a>
        <a href="#anchor"></a>
        <h2></h2>
        <h2>Title</h2>
      </div>
    `;
    const md = convertHtmlToMarkdown(html);
    expect(md).not.toMatch(/\[\s*\]\([^)]*\)/);
    expect(md).toMatch(/\[Bar\]\(\/bar\)/);
    expect(md).toMatch(/## Title/);
  });
});
