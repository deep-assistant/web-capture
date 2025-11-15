import { readFileSync, writeFileSync } from 'fs';
import { convertHtmlToMarkdown } from '../src/lib.js';

const html = readFileSync('./examples/xpaste/t4q0Lsp0-page.html', 'utf-8');
const markdown = convertHtmlToMarkdown(html, 'https://xpaste.pro/p/t4q0Lsp0');
writeFileSync('./examples/xpaste/t4q0Lsp0-page.md', markdown);

console.log('✅ Markdown regenerated successfully');
console.log('\nFirst 30 lines:');
console.log(markdown.split('\n').slice(0, 30).join('\n'));

console.log('\n\n=== Checking key elements ===');
const lines = markdown.split('\n');
const headingLine = lines.findIndex(l => l.includes('Упакуем пароль'));
const formatLine = lines.findIndex(l => l.includes('Формат:'));
const languageLine = lines.findIndex(l => l.includes('[Ru]') || l.includes('[En]'));

console.log(`Heading "Упакуем пароль..." at line: ${headingLine + 1}`);
console.log(`Format metadata at line: ${formatLine + 1}`);
console.log(`Language links at line: ${languageLine + 1}`);

if (headingLine < formatLine) {
  console.log('✅ Heading comes before metadata (correct order)');
} else {
  console.log('❌ Heading comes after metadata (incorrect order)');
}
