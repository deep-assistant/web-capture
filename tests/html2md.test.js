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

  it('removes empty links with only whitespace', () => {
    const html = `
      <a href="/foo">   </a>
      <a href="/bar">\n\t</a>
      <a href="#anchor"> </a>
    `;
    const md = convertHtmlToMarkdown(html);
    expect(md).not.toMatch(/\[\s*\]\([^)]*\)/);
    expect(md).not.toMatch(/\[\s*\]\(#.*\)/);
  });

  it('removes empty links with only child elements', () => {
    const html = `
      <a href="/foo"><span></span></a>
      <a href="/bar"><div></div></a>
      <a href="#anchor"><span> </span></a>
      <a href="/baz"><img src='x.png'></a>
      <a href="/qux"><span>\n</span></a>
      <a href="/keep">Text<span>child</span></a>
    `;
    const md = convertHtmlToMarkdown(html);
    expect(md).not.toMatch(/\[\s*\]\([^)]*\)/);
    expect(md).not.toMatch(/\[\s*\]\(#.*\)/);
    expect(md).toMatch(/\[Textchild\]\(\/keep\)/);
  });

  it('removes headings with only whitespace', () => {
    const html = `
      <h2>   </h2>
      <h3>\n\t</h3>
      <h4>\u00A0</h4>
      <h2>Valid Heading</h2>
    `;
    const md = convertHtmlToMarkdown(html);
    expect(md).not.toMatch(/#+\s*$/m);
    expect(md).toMatch(/## Valid Heading/);
  });

  it('converts relative links to absolute if baseUrl is provided', () => {
    const html = `
      <a href="/foo">Foo</a>
      <img src="/bar.png" alt="Bar">
      <a href="https://external.com">External</a>
    `;
    const md = convertHtmlToMarkdown(html, 'https://example.com/base/');
    expect(md).toMatch(/\[Foo\]\(https:\/\/example.com\/foo\)/);
    expect(md).toMatch(/!\[Bar\]\(https:\/\/example.com\/bar.png\)/);
    expect(md).toMatch(/\[External\]\(https:\/\/external.com\/?\)/);
  });

  it('does not change links if no baseUrl is provided', () => {
    const html = `
      <a href="/foo">Foo</a>
      <img src="/bar.png" alt="Bar">
    `;
    const md = convertHtmlToMarkdown(html);
    expect(md).toMatch(/\[Foo\]\(\/foo\)/);
    expect(md).toMatch(/!\[Bar\]\(\/bar.png\)/);
  });
});
