import { spawn } from 'child_process';
import fetch from 'node-fetch';
import getPort from 'get-port';
import path from 'path';

const WAIT_FOR_READY = 5000; // ms
let serverProcess;
let baseUrl;

beforeAll(async () => {
  const port = await getPort();
  baseUrl = `http://localhost:${port}`;

  serverProcess = spawn('node', [path.resolve('src/index.js')], {
    env: { ...process.env, PORT: port },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Wait for the server to be ready (simple delay or poll)
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Server did not start in time'));
    }, WAIT_FOR_READY);
    serverProcess.stdout.on('data', (data) => {
      if (data.toString().includes('listening') || data.toString().includes('Server running')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    // Fallback: resolve after WAIT_FOR_READY
    setTimeout(resolve, WAIT_FOR_READY);
  });
});

afterAll(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

describe('E2E: Google Drive Image Extraction', () => {
  // Test data from issue #13
  const testCases = [
    {
      name: 'Google Drive URL with /view',
      url: 'https://drive.google.com/file/d/1Cxkx6-428EQAX0-eiaq66H829ohnPp7q/view',
      description: 'First test case from issue #13'
    },
    {
      name: 'Google Drive URL without /view',
      url: 'https://drive.google.com/file/d/1Cxkx6-428EQAX0-eiaq66H829ohnPp7q',
      description: 'First test case without /view suffix'
    },
    {
      name: 'Second Google Drive URL with /view',
      url: 'https://drive.google.com/file/d/1fgJaftjv53xCN7vgiJOaQlbfWkUqPgyd/view',
      description: 'Second test case from issue #13'
    },
    {
      name: 'Second Google Drive URL without /view',
      url: 'https://drive.google.com/file/d/1fgJaftjv53xCN7vgiJOaQlbfWkUqPgyd',
      description: 'Second test case without /view suffix'
    }
  ];

  describe('/image endpoint', () => {
    testCases.forEach((testCase) => {
      it(`should extract image from ${testCase.name}`, async () => {
        const res = await fetch(`${baseUrl}/image?url=${encodeURIComponent(testCase.url)}`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toMatch(/^image\/(png|jpeg|jpg)/);

        const buf = Buffer.from(await res.arrayBuffer());

        // Check for PNG or JPEG signature
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        const jpegSignature = Buffer.from([0xFF, 0xD8, 0xFF]);

        const isPng = buf.slice(0, 8).equals(pngSignature);
        const isJpeg = buf.slice(0, 3).equals(jpegSignature);

        expect(isPng || isJpeg).toBe(true);
        expect(buf.length).toBeGreaterThan(1000); // Should be a non-trivial image
      }, 60000);
    });
  });

  describe('/markdown endpoint', () => {
    testCases.forEach((testCase) => {
      it(`should extract content from ${testCase.name}`, async () => {
        const res = await fetch(`${baseUrl}/markdown?url=${encodeURIComponent(testCase.url)}`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toMatch(/text\/markdown/);

        const text = await res.text();
        // Markdown should contain some content
        expect(text.length).toBeGreaterThan(0);
      }, 60000);
    });
  });

  describe('/html endpoint', () => {
    testCases.forEach((testCase) => {
      it(`should extract HTML from ${testCase.name}`, async () => {
        const res = await fetch(`${baseUrl}/html?url=${encodeURIComponent(testCase.url)}`);
        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toMatch(/text\/html/);

        const text = await res.text();
        // HTML should contain some content
        expect(text.length).toBeGreaterThan(0);
      }, 60000);
    });
  });
});
