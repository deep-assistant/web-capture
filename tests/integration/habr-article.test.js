import { createBrowser } from '../../src/browser.js';
import { convertHtmlToMarkdown } from '../../src/lib.js';

const HABR_ARTICLE_URL = 'https://habr.com/ru/articles/895896';

describe('Habr Article Download Tests', () => {
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

    it('can download Habr article as markdown', async () => {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Charset': 'utf-8'
      });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      await page.goto(HABR_ARTICLE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const html = await page.content();

      // Verify HTML was fetched
      expect(html).toBeTruthy();
      expect(html.length).toBeGreaterThan(1000);

      // Convert to markdown
      const markdown = convertHtmlToMarkdown(html, HABR_ARTICLE_URL);

      // Verify markdown content
      expect(markdown).toBeTruthy();
      expect(markdown.length).toBeGreaterThan(100);

      // Habr articles typically have headers, links, and code blocks
      // Just verify we got some markdown-like content
      expect(markdown).toMatch(/[#\-*[\]]/); // Should contain markdown syntax

      await page.close();
    }, 90000);

    it('can download Habr article as image screenshot', async () => {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Charset': 'utf-8'
      });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1280, height: 800 });

      await page.goto(HABR_ARTICLE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Wait for content to fully render
      await new Promise(resolve => setTimeout(resolve, 2000));

      const screenshot = await page.screenshot({ type: 'png' });

      // Verify screenshot
      expect(screenshot).toBeInstanceOf(Buffer);
      expect(screenshot.length).toBeGreaterThan(1000);

      // Verify PNG signature
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(screenshot.slice(0, 8)).toEqual(pngSignature);

      await page.close();
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

    it('can download Habr article as markdown', async () => {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Charset': 'utf-8'
      });

      await page.goto(HABR_ARTICLE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const html = await page.content();

      // Verify HTML was fetched
      expect(html).toBeTruthy();
      expect(html.length).toBeGreaterThan(1000);

      // Convert to markdown
      const markdown = convertHtmlToMarkdown(html, HABR_ARTICLE_URL);

      // Verify markdown content
      expect(markdown).toBeTruthy();
      expect(markdown.length).toBeGreaterThan(100);

      // Habr articles typically have headers, links, and code blocks
      // Just verify we got some markdown-like content
      expect(markdown).toMatch(/[#\-*[\]]/); // Should contain markdown syntax

      await page.close();
    }, 90000);

    it('can download Habr article as image screenshot', async () => {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Charset': 'utf-8'
      });
      await page.setViewport({ width: 1280, height: 800 });

      await page.goto(HABR_ARTICLE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Wait for content to fully render
      await new Promise(resolve => setTimeout(resolve, 2000));

      const screenshot = await page.screenshot({ type: 'png' });

      // Verify screenshot
      expect(screenshot).toBeInstanceOf(Buffer);
      expect(screenshot.length).toBeGreaterThan(1000);

      // Verify PNG signature
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(screenshot.slice(0, 8)).toEqual(pngSignature);

      await page.close();
    }, 90000);
  });

  describe('Engine Comparison for Habr Article', () => {
    it('both engines can successfully download the same Habr article', async () => {
      const puppeteerBrowser = await createBrowser('puppeteer');
      const playwrightBrowser = await createBrowser('playwright');

      const puppeteerPage = await puppeteerBrowser.newPage();
      const playwrightPage = await playwrightBrowser.newPage();

      // Set headers for both
      const headers = {
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Charset': 'utf-8'
      };

      await puppeteerPage.setExtraHTTPHeaders(headers);
      await playwrightPage.setExtraHTTPHeaders(headers);
      await puppeteerPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      await puppeteerPage.goto(HABR_ARTICLE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await playwrightPage.goto(HABR_ARTICLE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

      const puppeteerHtml = await puppeteerPage.content();
      const playwrightHtml = await playwrightPage.content();

      // Both should successfully fetch content
      expect(puppeteerHtml.length).toBeGreaterThan(1000);
      expect(playwrightHtml.length).toBeGreaterThan(1000);

      // Convert both to markdown
      const puppeteerMarkdown = convertHtmlToMarkdown(puppeteerHtml, HABR_ARTICLE_URL);
      const playwrightMarkdown = convertHtmlToMarkdown(playwrightHtml, HABR_ARTICLE_URL);

      // Both should produce valid markdown
      expect(puppeteerMarkdown.length).toBeGreaterThan(100);
      expect(playwrightMarkdown.length).toBeGreaterThan(100);

      await puppeteerBrowser.close();
      await playwrightBrowser.close();
    }, 120000);
  });
});
