import { spawn } from 'child_process';
import fetch from 'node-fetch';
import getPort from 'get-port';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

  // Wait for the server to be ready
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

describe('DeepWiki URL Markdown Conversion', () => {
  it('should convert deepwiki.com URL to markdown document', async () => {
    const url = 'https://deepwiki.com/search/-57-4-23-57_0e4aa687-7a9d-4591-8c6f-67c4b2d732f6';
    const res = await fetch(`${baseUrl}/markdown?url=${encodeURIComponent(url)}`);
    expect(res.status).toBe(200);
    const markdown = await res.text();

    // Verify we got markdown content
    expect(markdown).toBeTruthy();
    expect(markdown.length).toBeGreaterThan(0);

    // Count lines in the markdown
    const lines = markdown.split('\n');
    const lineCount = lines.length;

    console.log(`Markdown conversion resulted in ${lineCount} lines`);

    // Create output directory for test artifacts
    const outputDir = path.join(__dirname, '..', '..', 'experiments');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // If document is more than 1500 lines, we should split it
    if (lineCount > 1500) {
      console.log('Document exceeds 1500 lines, splitting into multiple files...');

      // Split markdown into chunks of 1500 lines
      const chunks = [];
      for (let i = 0; i < lines.length; i += 1500) {
        chunks.push(lines.slice(i, i + 1500).join('\n'));
      }

      // Save each chunk to a separate file
      const files = [];
      chunks.forEach((chunk, index) => {
        const filename = index === 0 ? 'index.md' : `part-${index}.md`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, chunk, 'utf-8');
        files.push(filename);
        console.log(`Created ${filename} with ${chunk.split('\n').length} lines`);
      });

      // Create a zip archive if we have multiple files
      if (chunks.length > 1) {
        const zip = new AdmZip();

        files.forEach(filename => {
          const filepath = path.join(outputDir, filename);
          zip.addLocalFile(filepath);
        });

        const zipPath = path.join(outputDir, 'deepwiki-markdown.zip');
        zip.writeZip(zipPath);
        console.log(`Created zip archive at ${zipPath}`);

        // Clean up individual files
        files.forEach(filename => {
          fs.unlinkSync(path.join(outputDir, filename));
        });

        expect(fs.existsSync(zipPath)).toBe(true);
      }
    } else {
      // Save as single markdown file
      const filepath = path.join(outputDir, 'deepwiki-markdown.md');
      fs.writeFileSync(filepath, markdown, 'utf-8');
      console.log(`Saved markdown to ${filepath} (${lineCount} lines)`);
      expect(fs.existsSync(filepath)).toBe(true);
    }
  }, 30000);
});
