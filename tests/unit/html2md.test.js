import { convertHtmlToMarkdown } from '../../src/lib.js';

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

  it('converts ARIA role table to Markdown table', () => {
    const html = `
      <div
        role="table"
        aria-label="Semantic Elements"
        aria-describedby="semantic_elements_table_desc"
        aria-rowcount="81">
        <div id="semantic_elements_table_desc">
          Semantic Elements to use instead of ARIA's roles
        </div>
        <div role="rowgroup">
          <div role="row">
            <span role="columnheader" aria-sort="none">ARIA Role</span>
            <span role="columnheader" aria-sort="none">Semantic Element</span>
          </div>
        </div>
        <div role="rowgroup">
          <div role="row" aria-rowindex="11">
            <span role="cell">header</span>
            <span role="cell">h1</span>
          </div>
          <div role="row" aria-rowindex="16">
            <span role="cell">header</span>
            <span role="cell">h6</span>
          </div>
          <div role="row" aria-rowindex="18">
            <span role="cell">rowgroup</span>
            <span role="cell">thead</span>
          </div>
          <div role="row" aria-rowindex="24">
            <span role="cell">term</span>
            <span role="cell">dt</span>
          </div>
        </div>
      </div>
    `;
    const md = convertHtmlToMarkdown(html);
    // Should contain a Markdown table header
    expect(md).toMatch(/\|\s*ARIA Role\s*\|\s*Semantic Element\s*\|/);
    // Should contain the separator row
    expect(md).toMatch(/\|\s*-+\s*\|\s*-+\s*\|/);
    // Should contain all data rows
    expect(md).toMatch(/\|\s*header\s*\|\s*h1\s*\|/);
    expect(md).toMatch(/\|\s*header\s*\|\s*h6\s*\|/);
    expect(md).toMatch(/\|\s*rowgroup\s*\|\s*thead\s*\|/);
    expect(md).toMatch(/\|\s*term\s*\|\s*dt\s*\|/);
  });

  it('converts a regular HTML table to Markdown table', () => {
    const html = `
      <table>
        <caption>Sample Table</caption>
        <thead>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
          <tr>
            <td>Cell 3</td>
            <td>Cell 4</td>
          </tr>
        </tbody>
      </table>
    `;
    const md = convertHtmlToMarkdown(html);
    // Should contain a Markdown table header
    expect(md).toMatch(/\|\s*Header 1\s*\|\s*Header 2\s*\|/);
    // Should contain the separator row
    expect(md).toMatch(/\|\s*-+\s*\|\s*-+\s*\|/);
    // Should contain all data rows
    expect(md).toMatch(/\|\s*Cell 1\s*\|\s*Cell 2\s*\|/);
    expect(md).toMatch(/\|\s*Cell 3\s*\|\s*Cell 4\s*\|/);
  });
});
