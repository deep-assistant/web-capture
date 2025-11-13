import { convertGoogleDriveUrl } from '../../src/lib.js';

describe('convertGoogleDriveUrl', () => {
  it('should convert Google Drive URL with /view to direct download URL', () => {
    const input = 'https://drive.google.com/file/d/1Cxkx6-428EQAX0-eiaq66H829ohnPp7q/view';
    const expected = 'https://drive.google.com/uc?export=download&id=1Cxkx6-428EQAX0-eiaq66H829ohnPp7q';
    expect(convertGoogleDriveUrl(input)).toBe(expected);
  });

  it('should convert Google Drive URL without /view to direct download URL', () => {
    const input = 'https://drive.google.com/file/d/1Cxkx6-428EQAX0-eiaq66H829ohnPp7q';
    const expected = 'https://drive.google.com/uc?export=download&id=1Cxkx6-428EQAX0-eiaq66H829ohnPp7q';
    expect(convertGoogleDriveUrl(input)).toBe(expected);
  });

  it('should convert second Google Drive URL with /view to direct download URL', () => {
    const input = 'https://drive.google.com/file/d/1fgJaftjv53xCN7vgiJOaQlbfWkUqPgyd/view';
    const expected = 'https://drive.google.com/uc?export=download&id=1fgJaftjv53xCN7vgiJOaQlbfWkUqPgyd';
    expect(convertGoogleDriveUrl(input)).toBe(expected);
  });

  it('should convert second Google Drive URL without /view to direct download URL', () => {
    const input = 'https://drive.google.com/file/d/1fgJaftjv53xCN7vgiJOaQlbfWkUqPgyd';
    const expected = 'https://drive.google.com/uc?export=download&id=1fgJaftjv53xCN7vgiJOaQlbfWkUqPgyd';
    expect(convertGoogleDriveUrl(input)).toBe(expected);
  });

  it('should convert Google Drive open?id= URL format', () => {
    const input = 'https://drive.google.com/open?id=1Cxkx6-428EQAX0-eiaq66H829ohnPp7q';
    const expected = 'https://drive.google.com/uc?export=download&id=1Cxkx6-428EQAX0-eiaq66H829ohnPp7q';
    expect(convertGoogleDriveUrl(input)).toBe(expected);
  });

  it('should not modify non-Google Drive URLs', () => {
    const input = 'https://example.com/image.jpg';
    expect(convertGoogleDriveUrl(input)).toBe(input);
  });

  it('should not modify regular http URLs', () => {
    const input = 'http://example.com/test';
    expect(convertGoogleDriveUrl(input)).toBe(input);
  });

  it('should handle null or undefined input', () => {
    expect(convertGoogleDriveUrl(null)).toBeNull();
    expect(convertGoogleDriveUrl(undefined)).toBeUndefined();
  });

  it('should handle empty string input', () => {
    expect(convertGoogleDriveUrl('')).toBe('');
  });

  it('should handle Google Drive URLs with additional query parameters', () => {
    const input = 'https://drive.google.com/file/d/1Cxkx6-428EQAX0-eiaq66H829ohnPp7q/view?usp=sharing';
    const expected = 'https://drive.google.com/uc?export=download&id=1Cxkx6-428EQAX0-eiaq66H829ohnPp7q';
    expect(convertGoogleDriveUrl(input)).toBe(expected);
  });

  it('should handle file IDs with various valid characters', () => {
    const input = 'https://drive.google.com/file/d/ABC123-xyz_789/view';
    const expected = 'https://drive.google.com/uc?export=download&id=ABC123-xyz_789';
    expect(convertGoogleDriveUrl(input)).toBe(expected);
  });
});
