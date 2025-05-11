import captureWebsite from 'capture-website';

export async function imageHandler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    let buffer = await captureWebsite.buffer(url, {
      fullPage: true,
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    });
    // Debug: log type and first bytes
    console.log('Type of buffer:', typeof buffer, 'Is Buffer:', Buffer.isBuffer(buffer));
    console.log('First 16 bytes:', Buffer.from(buffer).slice(0, 16));
    if (!(buffer instanceof Buffer)) {
      buffer = Buffer.from(buffer);
    }
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', 'inline; filename="screenshot.png"');
    res.end(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error capturing screenshot');
  }
} 