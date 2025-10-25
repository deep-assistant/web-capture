import { createBrowser } from '../../src/browser.js';
import { convertHtmlToMarkdown } from '../../src/lib.js';

const WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/Wikipedia';

describe('Wikipedia Page Download Tests', () => {
  describe('Puppeteer Engine', () => {
    let browser;

    beforeEach(async () => {
      browser = await createBrowser('puppeteer');
    });

    afterEach(async () => {
      if (browser) {
        await browser.close();
      }
    });

    it('can download Wikipedia page as HTML', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(WIKIPEDIA_URL, { waitUntil: 'networkidle0', timeout: 60000 });

      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 5000));

      const html = await page.content();

      // Verify HTML contains expected Wikipedia content
      expect(html).toContain('Wikipedia');
      expect(html).toMatch(/<html/i);
      expect(html.length).toBeGreaterThan(1000);
    }, 90000);

    it('can download Wikipedia page as Markdown', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(WIKIPEDIA_URL, { waitUntil: 'networkidle0', timeout: 60000 });

      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 5000));

      const html = await page.content();
      const markdown = convertHtmlToMarkdown(html, WIKIPEDIA_URL);

      // Verify Markdown contains expected Wikipedia content
      expect(markdown).toContain('Wikipedia');
      expect(markdown.length).toBeGreaterThan(500);
      // Should not contain main HTML structure tags
      expect(markdown).not.toMatch(/<html/i);
      expect(markdown).not.toMatch(/<head/i);
    }, 90000);

    it('can capture Wikipedia page as screenshot (image)', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(WIKIPEDIA_URL, { waitUntil: 'networkidle0', timeout: 60000 });

      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 5000));

      const screenshot = await page.screenshot({ type: 'png' });

      // Verify screenshot is a valid PNG
      expect(screenshot).toBeInstanceOf(Buffer);
      expect(screenshot.length).toBeGreaterThan(1000);

      // Verify PNG signature
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(screenshot.slice(0, 8)).toEqual(pngSignature);
    }, 90000);
  });

  describe('Playwright Engine', () => {
    let browser;

    beforeEach(async () => {
      browser = await createBrowser('playwright');
    });

    afterEach(async () => {
      if (browser) {
        await browser.close();
      }
    });

    it('can download Wikipedia page as HTML', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(WIKIPEDIA_URL, { waitUntil: 'networkidle0', timeout: 60000 });

      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 5000));

      const html = await page.content();

      // Verify HTML contains expected Wikipedia content
      expect(html).toContain('Wikipedia');
      expect(html).toMatch(/<html/i);
      expect(html.length).toBeGreaterThan(1000);
    }, 90000);

    it('can download Wikipedia page as Markdown', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(WIKIPEDIA_URL, { waitUntil: 'networkidle0', timeout: 60000 });

      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 5000));

      const html = await page.content();
      const markdown = convertHtmlToMarkdown(html, WIKIPEDIA_URL);

      // Verify Markdown contains expected Wikipedia content
      expect(markdown).toContain('Wikipedia');
      expect(markdown.length).toBeGreaterThan(500);
      // Should not contain main HTML structure tags
      expect(markdown).not.toMatch(/<html/i);
      expect(markdown).not.toMatch(/<head/i);
    }, 90000);

    it('can capture Wikipedia page as screenshot (image)', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(WIKIPEDIA_URL, { waitUntil: 'networkidle0', timeout: 60000 });

      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 5000));

      const screenshot = await page.screenshot({ type: 'png' });

      // Verify screenshot is a valid PNG
      expect(screenshot).toBeInstanceOf(Buffer);
      expect(screenshot.length).toBeGreaterThan(1000);

      // Verify PNG signature
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(screenshot.slice(0, 8)).toEqual(pngSignature);
    }, 90000);
  });

  describe('Engine Comparison', () => {
    it('both engines can download Wikipedia content successfully', async () => {
      const puppeteerBrowser = await createBrowser('puppeteer');
      const playwrightBrowser = await createBrowser('playwright');

      const puppeteerPage = await puppeteerBrowser.newPage();
      const playwrightPage = await playwrightBrowser.newPage();

      await puppeteerPage.setViewport({ width: 1280, height: 800 });
      await playwrightPage.setViewport({ width: 1280, height: 800 });

      await puppeteerPage.goto(WIKIPEDIA_URL, { waitUntil: 'networkidle0', timeout: 60000 });
      await playwrightPage.goto(WIKIPEDIA_URL, { waitUntil: 'networkidle0', timeout: 60000 });

      // Wait for pages to fully load
      await new Promise(resolve => setTimeout(resolve, 5000));

      const puppeteerHtml = await puppeteerPage.content();
      const playwrightHtml = await playwrightPage.content();

      // Both should contain Wikipedia content
      expect(puppeteerHtml).toContain('Wikipedia');
      expect(playwrightHtml).toContain('Wikipedia');

      // Both should be substantial HTML
      expect(puppeteerHtml.length).toBeGreaterThan(1000);
      expect(playwrightHtml.length).toBeGreaterThan(1000);

      await puppeteerBrowser.close();
      await playwrightBrowser.close();
    }, 120000);
  });
});
