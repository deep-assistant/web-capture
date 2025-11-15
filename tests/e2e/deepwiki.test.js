import { spawn } from 'child_process';
import fetch from 'node-fetch';
import getPort from 'get-port';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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

    // Validate key content elements from the DeepWiki page are present
    // These checks ensure we captured the actual rendered content, not just the HTML shell

    // 1. Check for page title/header
    expect(markdown).toContain('Search | DeepWiki');

    // 2. Check for the repository link
    expect(markdown).toContain('deep-assistant/hive-mind');

    // 3. Check for the Russian query text (verifies actual page content was captured)
    expect(markdown).toContain('расскажи пожалуйста на английском');

    // 4. Check for "Deep Thought Process" indicator
    expect(markdown).toContain('Deep');
    expect(markdown).toContain('Thought Process');

    // 5. Check for the main document heading
    expect(markdown).toContain('# Hive Mind: A Comprehensive Overview');

    // 6. Check for major sections (validates document structure)
    expect(markdown).toContain('## Executive Summary');
    expect(markdown).toContain('## I. Foundational Philosophy: Human-AI Collaboration Model');
    expect(markdown).toContain('## II. Architectural Layers: The Three-Tier Design');
    expect(markdown).toContain('## III. Original Ideas and Innovations');

    // 7. Check for code references (validates that code links were captured)
    expect(markdown).toContain('README.md:');
    expect(markdown).toContain('flow.md:');
    expect(markdown).toContain('claude.prompts.lib.mjs:');

    // 8. Check for specific innovations mentioned
    expect(markdown).toContain('Innovation 1: The Task Clarification System');
    expect(markdown).toContain('Innovation 2: Multi-Dimensional Feedback Detection');
    expect(markdown).toContain('Innovation 3: Thinking Depth Control');

    // 9. Verify content depth - should be substantial (>2000 lines for this URL)
    expect(lineCount).toBeGreaterThan(2000);

    // 10. Check for markdown formatting elements (lists, bold text)
    expect(markdown).toContain('**');  // Bold text
    expect(markdown).toContain('-   '); // List items
    expect(markdown).toContain('1.  '); // Numbered lists

    // Create output directory for test fixtures (part of test case, not experiments)
    const fixturesDir = path.join(__dirname, '..', 'fixtures', 'deepwiki');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // If document is more than 1500 lines, split it into multiple files
    if (lineCount > 1500) {
      console.log('Document exceeds 1500 lines, splitting into multiple files...');

      // Split markdown into chunks of 1500 lines
      const chunks = [];
      for (let i = 0; i < lines.length; i += 1500) {
        chunks.push(lines.slice(i, i + 1500).join('\n'));
      }

      // Save each chunk to a separate file in fixtures directory
      chunks.forEach((chunk, index) => {
        const filename = index === 0 ? 'index.md' : `part-${index}.md`;
        const filepath = path.join(fixturesDir, filename);
        fs.writeFileSync(filepath, chunk, 'utf-8');
        console.log(`Created ${filename} with ${chunk.split('\n').length} lines`);
        expect(fs.existsSync(filepath)).toBe(true);
      });
    } else {
      // Save as single markdown file
      const filepath = path.join(fixturesDir, 'index.md');
      fs.writeFileSync(filepath, markdown, 'utf-8');
      console.log(`Saved markdown to ${filepath} (${lineCount} lines)`);
      expect(fs.existsSync(filepath)).toBe(true);
    }
  }, 30000);
});
