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
