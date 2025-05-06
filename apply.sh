#!/usr/bin/env bash
set -euo pipefail

# Usage: ./init.sh [directory]
DIR=${1:-web-capture}
echo "Initializing web-capture microservice in '$DIR'..."

# Create project directory and enter
mkdir -p "$DIR"
cd "$DIR"

# Initialize git
git init

echo "# Creating package.json"
cat > package.json << 'EOF'
{
  "name": "web-capture",
  "version": "1.0.0",
  "description": "Microservice to render web pages as HTML, Markdown, or PNG",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "turndown": "^7.1.1",
    "capture-website": "^4.0.0"
  },
  "type": "module",
  "keywords": ["render", "markdown", "screenshot", "microservice"],
  "license": "MIT"
}
EOF

# Install dependencies
if command -v yarn >/dev/null 2>&1; then
  echo "Installing dependencies with yarn..."
  yarn install
else
  echo "Installing dependencies with npm..."
  npm install
fi

echo "# Writing index.js"
cat > index.js << 'EOF'
import express from 'express';
import fetch from 'node:fetch';               // Node 18+ has native fetch
import TurndownService from 'turndown';
import captureWebsite from 'capture-website';

const app = express();
const port = process.env.PORT || 3000;

// Route: Fetch raw HTML
app.get('/html', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    const response = await fetch(url);
    const html = await response.text();
    res.type('text/html').send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching HTML');
  }
});

// Route: Convert HTML to Markdown
app.get('/markdown', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    const response = await fetch(url);
    const html = await response.text();
    const turndown = new TurndownService();
    const markdown = turndown.turndown(html);
    res.type('text/markdown').send(markdown);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error converting to Markdown');
  }
});

// Route: Capture screenshot as PNG
app.get('/image', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing `url` parameter');
  try {
    const buffer = await captureWebsite.buffer(url, { fullPage: true });
    res.type('image/png').send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error capturing screenshot');
  }
});

app.listen(port, () => {
  console.log(`Renderer service listening on http://localhost:${port}`);
});
EOF

echo "# Writing Dockerfile"
cat > Dockerfile << 'EOF'
FROM node:20-slim

WORKDIR /usr/src/app
COPY package.json yarn.lock* ./

# Install production dependencies and Chrome deps
RUN apt-get update && apt-get install -y \
    gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    ca-certificates fonts-liberation lsb-release xdg-utils wget \
    --no-install-recommends && rm -rf /var/lib/apt/lists/* \
 && npm install --production

COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.js"]
EOF

echo "# Creating .gitignore"
cat > .gitignore << 'EOF'
node_modules
.env
EOF

echo "# Creating README.md"
cat > README.md << 'EOF'
# web-capture

A microservice to fetch URLs and render them as:

- **HTML**: GET /html?url=<URL>
- **Markdown**: GET /markdown?url=<URL>
- **PNG screenshot**: GET /image?url=<URL>

## Usage

```bash
npm start
# or
yarn start
curl http://localhost:3000/html?url=https://example.com
```

## Docker

```bash
docker build -t web-capture .
docker run -p 3000:3000 web-capture
```
EOF

echo "
✔ Project 'web-capture' scaffolded successfully in $(pwd)
Next steps:
  cd "$(pwd)"
  npm start
"
