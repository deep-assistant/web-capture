import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const WAIT_FOR_READY = 30000; // ms - increased to 30 seconds
const PORT = 3000; // Use the same port as in docker-compose.yml
const baseUrl = `http://localhost:${PORT}`;

beforeAll(async () => {
  console.log('Starting Docker container...');
  try {
    // Start the Docker container using docker-compose
    const { stdout, stderr } = await execAsync('docker-compose up -d');
    console.log('Docker compose output:', stdout);
    if (stderr) console.error('Docker compose errors:', stderr);

    // Wait for the service to be ready
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Docker service did not start in time'));
      }, WAIT_FOR_READY);

      const checkReady = async () => {
        try {
          console.log(`Checking if service is ready at ${baseUrl}...`);
          const res = await fetch(`${baseUrl}/html?url=https://example.com`);
          if (res.status === 200) {
            console.log('Service is ready!');
            clearTimeout(timeout);
            resolve();
          } else {
            console.log(`Service not ready yet, status: ${res.status}`);
            setTimeout(checkReady, 1000);
          }
        } catch (err) {
          console.log('Service not ready yet, error:', err.message);
          setTimeout(checkReady, 1000);
        }
      };
      checkReady();
    });
  } catch (error) {
    console.error('Failed to start Docker container:', error);
    throw error;
  }
}, 60000); // Increase timeout for beforeAll

afterAll(async () => {
  console.log('Stopping Docker container...');
  try {
    const { stdout, stderr } = await execAsync('docker-compose down');
    if (stdout) console.log('Docker compose down output:', stdout);
    if (stderr) console.error('Docker compose down errors:', stderr);
  } catch (error) {
    console.error('Failed to stop Docker container:', error);
  }
}, 30000); // Increase timeout for afterAll

describe('E2E (Docker): Web Capture Microservice', () => {
  it('should return HTML from /html endpoint', async () => {
    const url = 'https://example.com';
    const res = await fetch(`${baseUrl}/html?url=${encodeURIComponent(url)}`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toMatch(/<html/i);
  }, 30000); // Increase timeout for individual test

  it('should return Markdown from /markdown endpoint', async () => {
    const url = 'https://example.com';
    const res = await fetch(`${baseUrl}/markdown?url=${encodeURIComponent(url)}`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toMatch(/example/i);
  }, 30000); // Increase timeout for individual test

  it('should return PNG from /image endpoint', async () => {
    const url = 'https://example.com';
    const res = await fetch(`${baseUrl}/image?url=${encodeURIComponent(url)}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/^image\/png/);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(100); // Should be a non-trivial PNG
  }, 30000); // Increase timeout for individual test
}); 