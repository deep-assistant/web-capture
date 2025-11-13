// Test script to verify Google Drive URL conversion and downloading
import { convertGoogleDriveUrl } from '../src/lib.js';
import fetch from 'node-fetch';

const testUrls = [
  'https://drive.google.com/file/d/1Cxkx6-428EQAX0-eiaq66H829ohnPp7q/view',
  'https://drive.google.com/file/d/1Cxkx6-428EQAX0-eiaq66H829ohnPp7q',
  'https://drive.google.com/file/d/1fgJaftjv53xCN7vgiJOaQlbfWkUqPgyd/view',
  'https://drive.google.com/file/d/1fgJaftjv53xCN7vgiJOaQlbfWkUqPgyd'
];

console.log('Testing Google Drive URL conversion...\n');

for (const url of testUrls) {
  const converted = convertGoogleDriveUrl(url);
  console.log(`Original: ${url}`);
  console.log(`Converted: ${converted}`);

  try {
    const response = await fetch(converted, { method: 'HEAD' });
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Content-Length: ${response.headers.get('content-length')}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log('---\n');
}
