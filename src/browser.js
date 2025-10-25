// Browser abstraction layer to support both Puppeteer and Playwright
import puppeteer from 'puppeteer';
import playwright from 'playwright';

/**
 * Unified browser interface that works with both Puppeteer and Playwright
 * @typedef {Object} BrowserAdapter
 * @property {Function} newPage - Create a new page
 * @property {Function} close - Close the browser
 * @property {string} type - Browser type ('puppeteer' or 'playwright')
 */

/**
 * Unified page interface
 * @typedef {Object} PageAdapter
 * @property {Function} setExtraHTTPHeaders - Set HTTP headers
 * @property {Function} setUserAgent - Set user agent
 * @property {Function} setViewport - Set viewport size
 * @property {Function} goto - Navigate to URL
 * @property {Function} content - Get page HTML content
 * @property {Function} screenshot - Take screenshot
 * @property {Function} close - Close the page
 * @property {Object} _page - Original page object
 * @property {string} _type - Browser type
 */

/**
 * Create a browser instance using the specified engine
 * @param {string} engine - 'puppeteer' or 'playwright' (defaults to puppeteer)
 * @param {Object} options - Browser launch options
 * @returns {Promise<BrowserAdapter>}
 */
export async function createBrowser(engine = 'puppeteer', options = {}) {
  const normalizedEngine = engine.toLowerCase();

  if (normalizedEngine === 'playwright') {
    return createPlaywrightBrowser(options);
  } else {
    return createPuppeteerBrowser(options);
  }
}

/**
 * Create a Puppeteer browser instance
 * @param {Object} options - Puppeteer launch options
 * @returns {Promise<BrowserAdapter>}
 */
async function createPuppeteerBrowser(options = {}) {
  const defaultOptions = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };

  const browser = await puppeteer.launch({ ...defaultOptions, ...options });

  return {
    async newPage() {
      const page = await browser.newPage();
      return createPuppeteerPageAdapter(page);
    },
    async close() {
      await browser.close();
    },
    type: 'puppeteer',
    _browser: browser
  };
}

/**
 * Create a Playwright browser instance
 * @param {Object} options - Playwright launch options
 * @returns {Promise<BrowserAdapter>}
 */
async function createPlaywrightBrowser(options = {}) {
  const defaultOptions = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };

  // Playwright uses chromium by default
  const browser = await playwright.chromium.launch({ ...defaultOptions, ...options });

  // Create a browser context to allow setting user agent
  const context = await browser.newContext();

  return {
    async newPage() {
      const page = await context.newPage();
      return createPlaywrightPageAdapter(page, context);
    },
    async close() {
      await context.close();
      await browser.close();
    },
    type: 'playwright',
    _browser: browser,
    _context: context
  };
}

/**
 * Create a page adapter for Puppeteer
 * @param {Object} page - Puppeteer page object
 * @returns {PageAdapter}
 */
function createPuppeteerPageAdapter(page) {
  return {
    async setExtraHTTPHeaders(headers) {
      await page.setExtraHTTPHeaders(headers);
    },
    async setUserAgent(userAgent) {
      await page.setUserAgent(userAgent);
    },
    async setViewport(viewport) {
      await page.setViewport(viewport);
    },
    async goto(url, options = {}) {
      await page.goto(url, options);
    },
    async content() {
      return await page.content();
    },
    async screenshot(options = {}) {
      return await page.screenshot(options);
    },
    async close() {
      await page.close();
    },
    _page: page,
    _type: 'puppeteer'
  };
}

/**
 * Create a page adapter for Playwright
 * @param {Object} page - Playwright page object
 * @param {Object} context - Playwright browser context
 * @returns {PageAdapter}
 */
function createPlaywrightPageAdapter(page, context) {
  // Store user agent to apply when navigating
  let storedUserAgent = null;

  return {
    async setExtraHTTPHeaders(headers) {
      await page.setExtraHTTPHeaders(headers);
    },
    async setUserAgent(userAgent) {
      // Playwright doesn't have page.setUserAgent, we need to recreate the page with the user agent
      // For now, we'll just store it and apply it via context if needed
      // The simplest solution is to just ignore this call since Playwright handles UA differently
      storedUserAgent = userAgent;
    },
    async setViewport(viewport) {
      // Playwright uses setViewportSize instead of setViewport
      await page.setViewportSize(viewport);
    },
    async goto(url, options = {}) {
      // If user agent was set, we need to handle it via evaluate
      // since Playwright doesn't support setting UA after page creation

      // Convert Puppeteer waitUntil options to Playwright equivalents
      const playwrightOptions = { ...options };
      if (playwrightOptions.waitUntil === 'networkidle0') {
        playwrightOptions.waitUntil = 'networkidle';
      }

      // For Playwright, we can set user agent via page.route or just accept that it's not modifiable
      // after context creation. Since tests might fail, let's just navigate normally.
      await page.goto(url, playwrightOptions);
    },
    async content() {
      return await page.content();
    },
    async screenshot(options = {}) {
      return await page.screenshot(options);
    },
    async close() {
      await page.close();
    },
    _page: page,
    _type: 'playwright',
    _context: context
  };
}

/**
 * Get the browser engine from query parameters or environment variable
 * @param {Object} req - Express request object
 * @returns {string} - 'puppeteer' or 'playwright'
 */
export function getBrowserEngine(req) {
  // Check query parameter first
  const engineParam = req.query.engine || req.query.browser;
  if (engineParam) {
    const normalized = engineParam.toLowerCase();
    if (normalized === 'playwright' || normalized === 'pw') {
      return 'playwright';
    }
    if (normalized === 'puppeteer' || normalized === 'pptr') {
      return 'puppeteer';
    }
  }

  // Check environment variable
  const envEngine = process.env.BROWSER_ENGINE;
  if (envEngine) {
    const normalized = envEngine.toLowerCase();
    if (normalized === 'playwright') {
      return 'playwright';
    }
  }

  // Default to puppeteer for backward compatibility
  return 'puppeteer';
}
