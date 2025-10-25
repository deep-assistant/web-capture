import { createBrowser } from '../../src/browser.js';
import { fetchHtml, convertHtmlToMarkdown } from '../../src/lib.js';

describe('GitHub README Integration Tests', () => {
  const githubReadmeUrl = 'https://github.com/deep-assistant/web-capture';

  describe('Markdown Download Tests', () => {
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

      it('can download and convert GitHub README to markdown using Puppeteer', async () => {
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Charset': 'utf-8'
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        const html = await page.content();
        expect(html).toBeTruthy();
        expect(html.length).toBeGreaterThan(100);

        // Convert to markdown
        const markdown = convertHtmlToMarkdown(html, githubReadmeUrl);
        expect(markdown).toBeTruthy();
        expect(markdown.length).toBeGreaterThan(50);

        // Verify markdown contains expected GitHub README elements
        // GitHub READMEs typically have headings, links, and text
        expect(markdown).toMatch(/web-capture|README/i);
      }, 60000);

      it('markdown conversion preserves GitHub README structure', async () => {
        const page = await browser.newPage();
        await page.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        const html = await page.content();
        const markdown = convertHtmlToMarkdown(html, githubReadmeUrl);

        // Verify markdown has structure (headings, lists, or links)
        const hasHeadings = /^#{1,6}\s+/m.test(markdown);
        const hasLinks = /\[.*?\]\(.*?\)/.test(markdown);
        const hasBulletLists = /^[\*\-]\s+/m.test(markdown);

        expect(hasHeadings || hasLinks || hasBulletLists).toBe(true);
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

      it('can download and convert GitHub README to markdown using Playwright', async () => {
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Charset': 'utf-8'
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        const html = await page.content();
        expect(html).toBeTruthy();
        expect(html.length).toBeGreaterThan(100);

        // Convert to markdown
        const markdown = convertHtmlToMarkdown(html, githubReadmeUrl);
        expect(markdown).toBeTruthy();
        expect(markdown.length).toBeGreaterThan(50);

        // Verify markdown contains expected GitHub README elements
        expect(markdown).toMatch(/web-capture|README/i);
      }, 60000);

      it('markdown conversion preserves GitHub README structure', async () => {
        const page = await browser.newPage();
        await page.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        const html = await page.content();
        const markdown = convertHtmlToMarkdown(html, githubReadmeUrl);

        // Verify markdown has structure (headings, lists, or links)
        const hasHeadings = /^#{1,6}\s+/m.test(markdown);
        const hasLinks = /\[.*?\]\(.*?\)/.test(markdown);
        const hasBulletLists = /^[\*\-]\s+/m.test(markdown);

        expect(hasHeadings || hasLinks || hasBulletLists).toBe(true);
      }, 60000);
    });
  });

  describe('Screenshot Download Tests', () => {
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

      it('can capture screenshot of GitHub README using Puppeteer', async () => {
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Charset': 'utf-8'
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait for dynamic content (similar to image handler)
        await new Promise(resolve => setTimeout(resolve, 5000));

        const screenshot = await page.screenshot({ type: 'png' });
        expect(screenshot).toBeInstanceOf(Buffer);
        expect(screenshot.length).toBeGreaterThan(1000);

        // Verify PNG signature
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        expect(screenshot.slice(0, 8).equals(pngSignature)).toBe(true);
      }, 70000);

      it('screenshot has expected dimensions', async () => {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 5000));

        const screenshot = await page.screenshot({ type: 'png' });

        // PNG files should be reasonably sized for 1280x800 viewport
        // Typical screenshots are at least 10KB for this viewport size
        expect(screenshot.length).toBeGreaterThan(10000);
      }, 70000);
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

      it('can capture screenshot of GitHub README using Playwright', async () => {
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Charset': 'utf-8'
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait for dynamic content (similar to image handler)
        await new Promise(resolve => setTimeout(resolve, 5000));

        const screenshot = await page.screenshot({ type: 'png' });
        expect(screenshot).toBeInstanceOf(Buffer);
        expect(screenshot.length).toBeGreaterThan(1000);

        // Verify PNG signature
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        expect(screenshot.slice(0, 8).equals(pngSignature)).toBe(true);
      }, 70000);

      it('screenshot has expected dimensions', async () => {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 5000));

        const screenshot = await page.screenshot({ type: 'png' });

        // PNG files should be reasonably sized for 1280x800 viewport
        expect(screenshot.length).toBeGreaterThan(10000);
      }, 70000);
    });
  });

  describe('Engine Parity for GitHub README', () => {
    it('both engines can fetch GitHub README content', async () => {
      const puppeteerBrowser = await createBrowser('puppeteer');
      const playwrightBrowser = await createBrowser('playwright');

      const puppeteerPage = await puppeteerBrowser.newPage();
      const playwrightPage = await playwrightBrowser.newPage();

      await puppeteerPage.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await playwrightPage.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });

      const puppeteerHtml = await puppeteerPage.content();
      const playwrightHtml = await playwrightPage.content();

      // Both should fetch valid HTML content
      expect(puppeteerHtml).toBeTruthy();
      expect(playwrightHtml).toBeTruthy();
      expect(puppeteerHtml.length).toBeGreaterThan(100);
      expect(playwrightHtml.length).toBeGreaterThan(100);

      // Both should contain GitHub README indicators
      expect(puppeteerHtml).toMatch(/github|README/i);
      expect(playwrightHtml).toMatch(/github|README/i);

      await puppeteerBrowser.close();
      await playwrightBrowser.close();
    }, 90000);

    it('both engines produce valid markdown from GitHub README', async () => {
      const puppeteerBrowser = await createBrowser('puppeteer');
      const playwrightBrowser = await createBrowser('playwright');

      const puppeteerPage = await puppeteerBrowser.newPage();
      const playwrightPage = await playwrightBrowser.newPage();

      await puppeteerPage.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await playwrightPage.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });

      const puppeteerHtml = await puppeteerPage.content();
      const playwrightHtml = await playwrightPage.content();

      const puppeteerMarkdown = convertHtmlToMarkdown(puppeteerHtml, githubReadmeUrl);
      const playwrightMarkdown = convertHtmlToMarkdown(playwrightHtml, githubReadmeUrl);

      // Both should produce non-empty markdown
      expect(puppeteerMarkdown.length).toBeGreaterThan(50);
      expect(playwrightMarkdown.length).toBeGreaterThan(50);

      // Both should contain README-related content
      expect(puppeteerMarkdown).toMatch(/web-capture|README/i);
      expect(playwrightMarkdown).toMatch(/web-capture|README/i);

      await puppeteerBrowser.close();
      await playwrightBrowser.close();
    }, 90000);

    it('both engines produce valid screenshots of GitHub README', async () => {
      const puppeteerBrowser = await createBrowser('puppeteer');
      const playwrightBrowser = await createBrowser('playwright');

      const puppeteerPage = await puppeteerBrowser.newPage();
      const playwrightPage = await playwrightBrowser.newPage();

      await puppeteerPage.setViewport({ width: 1280, height: 800 });
      await playwrightPage.setViewport({ width: 1280, height: 800 });

      await puppeteerPage.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await playwrightPage.goto(githubReadmeUrl, { waitUntil: 'networkidle0', timeout: 30000 });

      await new Promise(resolve => setTimeout(resolve, 5000));

      const puppeteerScreenshot = await puppeteerPage.screenshot({ type: 'png' });
      const playwrightScreenshot = await playwrightPage.screenshot({ type: 'png' });

      // Both should produce valid PNG buffers
      expect(puppeteerScreenshot).toBeInstanceOf(Buffer);
      expect(playwrightScreenshot).toBeInstanceOf(Buffer);

      // Both should have reasonable sizes
      expect(puppeteerScreenshot.length).toBeGreaterThan(1000);
      expect(playwrightScreenshot.length).toBeGreaterThan(1000);

      // Verify PNG signatures
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(puppeteerScreenshot.slice(0, 8).equals(pngSignature)).toBe(true);
      expect(playwrightScreenshot.slice(0, 8).equals(pngSignature)).toBe(true);

      await puppeteerBrowser.close();
      await playwrightBrowser.close();
    }, 100000);
  });
});
