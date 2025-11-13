import request from 'supertest';
import nock from 'nock';
import { jest } from '@jest/globals';

let app;

beforeAll(async () => {
  app = (await import('../../src/index.js')).app;
});

describe('xpaste.pro integration tests', () => {
  beforeEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  describe('GET /txt with xpaste.pro URL', () => {
    const testUrl = 'https://xpaste.pro/p/t4q0Lsp0';
    const testText = `# 1
#
# Time: 210707 15:39:36
# User@Host: test
# Query_time: 2.182754
SELECT * FROM test;`;

    it('should fetch and return text content from xpaste.pro', async () => {
      nock('https://xpaste.pro')
        .get('/p/t4q0Lsp0/raw')
        .reply(200, testText, { 'content-type': 'text/plain; charset=utf-8' });

      const response = await request(app)
        .get('/txt')
        .query({ url: testUrl });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/plain');
      expect(response.text).toBe(testText);
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.txt');
    });

    it('should return 400 when URL is missing', async () => {
      const response = await request(app)
        .get('/txt');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing `url` parameter');
    });

    it('should return 500 when fetch fails', async () => {
      nock('https://xpaste.pro')
        .get('/p/t4q0Lsp0/raw')
        .replyWithError('Network error');

      const response = await request(app)
        .get('/txt')
        .query({ url: testUrl });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error fetching text content');
    });
  });

  describe('GET /markdown with xpaste.pro URL (small content)', () => {
    const testUrl = 'https://xpaste.pro/p/t4q0Lsp0';
    const testText = `# Test content
Line 1
Line 2
Line 3`;

    it('should embed text content in markdown when content is less than 1500 lines', async () => {
      nock('https://xpaste.pro')
        .get('/p/t4q0Lsp0/raw')
        .reply(200, testText, { 'content-type': 'text/plain; charset=utf-8' });

      const response = await request(app)
        .get('/markdown')
        .query({ url: testUrl });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/markdown');
      expect(response.text).toContain('# https://xpaste.pro/p/t4q0Lsp0');
      expect(response.text).toContain('Content from: https://xpaste.pro/p/t4q0Lsp0');
      expect(response.text).toContain('```');
      expect(response.text).toContain(testText);
    });
  });

  describe('GET /markdown with xpaste.pro URL (large content)', () => {
    const testUrl = 'https://xpaste.pro/p/largefile';

    it('should create a zip archive when content is 1500 lines or more', async () => {
      // Create content with exactly 1500 lines
      const largeText = Array(1500).fill('Line of text').join('\n');

      nock('https://xpaste.pro')
        .get('/p/largefile/raw')
        .reply(200, largeText, { 'content-type': 'text/plain; charset=utf-8' });

      const response = await request(app)
        .get('/markdown')
        .query({ url: testUrl });

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/zip');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('largefile.zip');

      // Verify response body exists (zip content is streamed)
      expect(response.body).toBeDefined();
    });

    it('should create a zip archive for content with more than 1500 lines', async () => {
      // Create content with 2000 lines
      const largeText = Array(2000).fill('Line of text').join('\n');

      nock('https://xpaste.pro')
        .get('/p/largefile/raw')
        .reply(200, largeText, { 'content-type': 'text/plain; charset=utf-8' });

      const response = await request(app)
        .get('/markdown')
        .query({ url: testUrl });

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/zip');
    });
  });

  describe('GET /markdown with non-xpaste.pro URL', () => {
    const testUrl = 'https://example.com';
    const testHtml = '<html><body><h1>Test Page</h1><p>Regular HTML content</p></body></html>';

    it('should process regular HTML URLs normally', async () => {
      nock(testUrl)
        .get('/')
        .reply(200, testHtml);

      const response = await request(app)
        .get('/markdown')
        .query({ url: testUrl });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/markdown');
      expect(response.text).toContain('Test Page');
      expect(response.text).toContain('Regular HTML content');
      // Should not be a zip file
      expect(response.headers['content-type']).not.toBe('application/zip');
    });
  });
});
