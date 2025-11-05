import { createBrowser } from '../../src/browser.js';
import { convertHtmlToMarkdown } from '../../src/lib.js';

describe('Browser Engine Integration Tests', () => {
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

    it('can navigate to a page and get content', async () => {
      const page = await browser.newPage();
      await page.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 30000 });
      const content = await page.content();
      expect(content).toContain('Example Domain');
    }, 60000);

    it('can take a screenshot', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 30000 });
      const screenshot = await page.screenshot({ type: 'png' });
      expect(screenshot).toBeInstanceOf(Buffer);
      expect(screenshot.length).toBeGreaterThan(100);
    }, 60000);

    it('can set custom headers and user agent', async () => {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' });
      await page.setUserAgent('Test User Agent');
      await page.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 30000 });
      const content = await page.content();
      expect(content).toBeTruthy();
    }, 60000);
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

    it('can navigate to a page and get content', async () => {
      const page = await browser.newPage();
      await page.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 30000 });
      const content = await page.content();
      expect(content).toContain('Example Domain');
    }, 60000);

    it('can take a screenshot', async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 30000 });
      const screenshot = await page.screenshot({ type: 'png' });
      expect(screenshot).toBeInstanceOf(Buffer);
      expect(screenshot.length).toBeGreaterThan(100);
    }, 60000);

    it('can set custom headers and user agent', async () => {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' });
      await page.setUserAgent('Test User Agent');
      await page.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 30000 });
      const content = await page.content();
      expect(content).toBeTruthy();
    }, 60000);
  });

  describe('Engine Parity', () => {
    it('both engines produce similar content for the same page', async () => {
      const puppeteerBrowser = await createBrowser('puppeteer');
      const playwrightBrowser = await createBrowser('playwright');

      const puppeteerPage = await puppeteerBrowser.newPage();
      const playwrightPage = await playwrightBrowser.newPage();

      await puppeteerPage.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 30000 });
      await playwrightPage.goto('https://example.com', { waitUntil: 'networkidle0', timeout: 30000 });

      const puppeteerContent = await puppeteerPage.content();
      const playwrightContent = await playwrightPage.content();

      // Both should contain the main content
      expect(puppeteerContent).toContain('Example Domain');
      expect(playwrightContent).toContain('Example Domain');

      await puppeteerBrowser.close();
      await playwrightBrowser.close();
    }, 60000);
  });

  describe('StackOverflow Page Download', () => {
    const stackOverflowUrl = 'https://stackoverflow.com/questions/927358/how-do-i-undo-the-most-recent-local-commits-in-git';

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

      it('can download StackOverflow page and convert to markdown', async () => {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(stackOverflowUrl, { waitUntil: 'networkidle0', timeout: 60000 });

        const html = await page.content();
        expect(html).toBeTruthy();
        expect(html.length).toBeGreaterThan(1000);

        // Convert HTML to markdown
        const markdown = convertHtmlToMarkdown(html, stackOverflowUrl);
        expect(markdown).toBeTruthy();
        expect(markdown.length).toBeGreaterThan(100);

        // Verify markdown contains expected content
        expect(markdown).toContain('How do I undo the most recent local commits in Git');
        expect(markdown).toContain('git');
      }, 90000);

      it('can take a screenshot of StackOverflow page', async () => {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(stackOverflowUrl, { waitUntil: 'networkidle0', timeout: 60000 });

        const screenshot = await page.screenshot({ type: 'png' });
        expect(screenshot).toBeInstanceOf(Buffer);
        expect(screenshot.length).toBeGreaterThan(1000);

        // Verify it's a valid PNG
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        expect(screenshot.slice(0, 8).equals(pngSignature)).toBe(true);
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

      it('can download StackOverflow page and convert to markdown', async () => {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(stackOverflowUrl, { waitUntil: 'networkidle0', timeout: 60000 });

        const html = await page.content();
        expect(html).toBeTruthy();
        expect(html.length).toBeGreaterThan(1000);

        // Convert HTML to markdown
        const markdown = convertHtmlToMarkdown(html, stackOverflowUrl);
        expect(markdown).toBeTruthy();
        expect(markdown.length).toBeGreaterThan(100);

        // Verify markdown contains expected content
        expect(markdown).toContain('How do I undo the most recent local commits in Git');
        expect(markdown).toContain('git');
      }, 90000);

      it('can take a screenshot of StackOverflow page', async () => {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(stackOverflowUrl, { waitUntil: 'networkidle0', timeout: 60000 });

        const screenshot = await page.screenshot({ type: 'png' });
        expect(screenshot).toBeInstanceOf(Buffer);
        expect(screenshot.length).toBeGreaterThan(1000);

        // Verify it's a valid PNG
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        expect(screenshot.slice(0, 8).equals(pngSignature)).toBe(true);
      }, 90000);
    });
  });
});
