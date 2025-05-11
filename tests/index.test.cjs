const request = require('supertest');
const nock = require('nock');

// Mock the capture-website module
jest.mock('capture-website', () => {
  return {
    __esModule: true,
    default: {
      buffer: jest.fn()
    }
  };
});

const captureWebsite = require('capture-website').default;
const { app } = require('../src/index.js');

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
    const expectedMarkdown = 'Test Page\n=========\n\nSome text';

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
    const mockBuffer = Buffer.from('fake-image-data');

    it('should return PNG image when URL is provided', async () => {
      captureWebsite.buffer.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .get('/image')
        .query({ url: testUrl });

      expect(response.status).toBe(200);
      expect(response.type).toBe('image/png');
      expect(response.body).toEqual(mockBuffer);
      expect(captureWebsite.buffer).toHaveBeenCalledWith(testUrl, { fullPage: true });
    });

    it('should return 400 when URL is missing', async () => {
      const response = await request(app)
        .get('/image');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing `url` parameter');
    });

    it('should return 500 when screenshot capture fails', async () => {
      captureWebsite.buffer.mockRejectedValue(new Error('Screenshot failed'));

      const response = await request(app)
        .get('/image')
        .query({ url: testUrl });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error capturing screenshot');
    });
  });
}); 