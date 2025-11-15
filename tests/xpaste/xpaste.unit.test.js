import { jest } from '@jest/globals';
import { normalizeUrlForTextContent, isTextPasteUrl } from '../../src/lib.js';

describe('xpaste.pro URL handling utilities', () => {
  describe('normalizeUrlForTextContent', () => {
    it('should convert xpaste.pro URL to raw endpoint', () => {
      const url = 'https://xpaste.pro/p/t4q0Lsp0';
      const normalized = normalizeUrlForTextContent(url);
      expect(normalized).toBe('https://xpaste.pro/p/t4q0Lsp0/raw');
    });

    it('should not modify xpaste.pro URL that already has /raw', () => {
      const url = 'https://xpaste.pro/p/t4q0Lsp0/raw';
      const normalized = normalizeUrlForTextContent(url);
      expect(normalized).toBe('https://xpaste.pro/p/t4q0Lsp0/raw');
    });

    it('should not modify non-xpaste.pro URLs', () => {
      const url = 'https://example.com/page';
      const normalized = normalizeUrlForTextContent(url);
      expect(normalized).toBe(url);
    });

    it('should handle invalid URLs gracefully', () => {
      const url = 'not-a-valid-url';
      const normalized = normalizeUrlForTextContent(url);
      expect(normalized).toBe(url);
    });
  });

  describe('isTextPasteUrl', () => {
    it('should return true for xpaste.pro paste URLs', () => {
      expect(isTextPasteUrl('https://xpaste.pro/p/t4q0Lsp0')).toBe(true);
      expect(isTextPasteUrl('https://xpaste.pro/p/abc123')).toBe(true);
    });

    it('should return false for non-xpaste.pro URLs', () => {
      expect(isTextPasteUrl('https://example.com')).toBe(false);
      expect(isTextPasteUrl('https://pastebin.com/xyz')).toBe(false);
    });

    it('should return false for xpaste.pro URLs without /p/ path', () => {
      expect(isTextPasteUrl('https://xpaste.pro')).toBe(false);
      expect(isTextPasteUrl('https://xpaste.pro/about')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(isTextPasteUrl('not-a-url')).toBe(false);
    });
  });
});
