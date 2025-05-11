# web-capture

<img width="1824" alt="Screenshot 2025-05-12 at 3 49 32 AM" src="https://github.com/user-attachments/assets/cbf63dec-7dcd-40e7-9d5d-eddc49fe6169" />

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
