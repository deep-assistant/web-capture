import request from 'supertest';
import nock from 'nock';
import { jest } from '@jest/globals';

// ESM-compatible mocking for capture-website
jest.unstable_mockModule('capture-website', () => ({
  __esModule: true,
  default: {
    buffer: jest.fn()
  }
}));

let captureWebsite;
let app;

beforeAll(async () => {
  captureWebsite = (await import('capture-website')).default;
  app = (await import('../src/index.js')).app;
});

describe('Web Capture Microservice', () => {
  beforeEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  describe('GET /html', () => {
    const testUrl = 'https://example.com';
    const testHtml = '<html><body><h1>Test Page</h1></body></html>';

    it('should return HTML content when URL is provided', async () => {
      nock(testUrl)
        .get('/')
        .reply(200, testHtml);

      const response = await request(app)
        .get('/html')
        .query({ url: testUrl });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toBe(testHtml);
    });

    it('should return 400 when URL is missing', async () => {
      const response = await request(app)
        .get('/html');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing `url` parameter');
    });

    it('should return 500 when fetch fails', async () => {
      nock(testUrl)
        .get('/')
        .replyWithError('Network error');

      const response = await request(app)
        .get('/html')
        .query({ url: testUrl });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error fetching HTML');
    });
  });

  describe('GET /markdown', () => {
    const testUrl = 'https://example.com';
    const testHtml = '<html><body><h1>Test Page</h1><p>Some text</p></body></html>';
    const expectedMarkdown = '# Test Page\n\nSome text';

    it('should convert HTML to Markdown when URL is provided', async () => {
      nock(testUrl)
        .get('/')
        .reply(200, testHtml);

      const response = await request(app)
        .get('/markdown')
        .query({ url: testUrl });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/markdown');
      expect(response.text).toBe(expectedMarkdown);
    });

    it('should remove CSS from the markdown output', async () => {
      const htmlWithCss = `
        <html>
          <head>
            <style>
              body { background-color: #f0f0f2; }
              div { width: 600px; }
            </style>
          </head>
          <body>
            <h1>Test Page</h1>
            <p>Some text</p>
          </body>
        </html>
      `;

      nock(testUrl)
        .get('/')
        .reply(200, htmlWithCss);

      const response = await request(app)
        .get('/markdown')
        .query({ url: testUrl });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/markdown');
      expect(response.text).not.toContain('background-color');
      expect(response.text).not.toContain('width: 600px');
      expect(response.text).toContain('Test Page');
      expect(response.text).toContain('Some text');
    });

    it('should return 400 when URL is missing', async () => {
      const response = await request(app)
        .get('/markdown');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing `url` parameter');
    });

    it('should return 500 when fetch fails', async () => {
      nock(testUrl)
        .get('/')
        .replyWithError('Network error');

      const response = await request(app)
        .get('/markdown')
        .query({ url: testUrl });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error converting to Markdown');
    });
  });

  describe('GET /image', () => {
    const testUrl = 'https://example.com';
    const mockBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      // ... (rest can be arbitrary for test)
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
    ]);

    it('should return PNG image when URL is provided', async () => {
      captureWebsite.buffer.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .get('/image')
        .query({ url: testUrl });

      expect(response.status).toBe(200);
      expect(response.type).toBe('image/png');
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(response.body.slice(0, 8)).toEqual(pngSignature);
      expect(response.body.equals(mockBuffer)).toBe(true);
      expect(captureWebsite.buffer).toHaveBeenCalledWith(testUrl, {
        fullPage: true,
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        }
      });
    });

    it('should return 400 when URL is missing', async () => {
      const response = await request(app)
        .get('/image');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing `url` parameter');
    });

    it('should return 500 when screenshot capture fails', async () => {
      captureWebsite.buffer.mockReset();
      captureWebsite.buffer.mockRejectedValue(new Error('Screenshot failed'));

      const response = await request(app)
        .get('/image')
        .query({ url: testUrl });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error capturing screenshot');
    });
  });

  describe('GET /fetch', () => {
    const testUrl = 'https://example.com';
    const testContent = '<html><body><h1>Example Domain</h1></body></html>';

    it('should stream content from the given URL', async () => {
      nock(testUrl)
        .get('/')
        .reply(200, testContent, { 'content-type': 'text/html' });

      const response = await request(app).get('/fetch?url=' + testUrl);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.text).toContain('Example Domain');
    });

    it('should return 400 when URL is missing', async () => {
      const response = await request(app).get('/fetch');
      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing `url` parameter');
    });

    it('should return 500 when fetch fails', async () => {
      nock(testUrl)
        .get('/')
        .replyWithError('Network error');

      const response = await request(app).get('/fetch?url=' + testUrl);
      expect(response.status).toBe(500);
      expect(response.text).toBe('Error proxying content');
    });
  });
}); 