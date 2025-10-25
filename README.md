# web-capture

<img width="1824" alt="Screenshot 2025-05-12 at 3 49 32 AM" src="https://github.com/user-attachments/assets/cbf63dec-7dcd-40e7-9d5d-eddc49fe6169" />

A microservice to fetch URLs and render them as:

- **HTML**: GET /html?url=<URL>
- **Markdown**: GET /markdown?url=<URL>
- **PNG screenshot**: GET /image?url=<URL>

## Installation

```bash
npm install
# or
yarn install
```

## Available Commands

### Development
- `yarn dev` - Start the development server with hot reloading using nodemon
- `yarn start` - Start the service using Docker Compose

### Testing
- `yarn test` - Run all unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:e2e` - Run end-to-end tests
- `yarn test:e2e:docker` - Run end-to-end tests against Docker container
- `yarn test:all` - Run all tests including build and e2e tests

### Building
- `yarn build` - Build and start the Docker container

### Examples
- `yarn examples:python` - Run Python example scripts
- `yarn examples:javascript` - Run JavaScript example scripts
- `yarn examples` - Run all examples (requires build)

## Usage

### Local Development
```bash
yarn dev
curl http://localhost:3000/html?url=https://example.com
```

### Docker
```bash
# Build and run using Docker Compose
yarn start

# Or manually
docker build -t web-capture .
docker run -p 3000:3000 web-capture
```

## API Endpoints

### HTML Endpoint
```bash
GET /html?url=<URL>&engine=<ENGINE>
```
Returns the raw HTML content of the specified URL.

**Parameters:**
- `url` (required): The URL to fetch
- `engine` (optional): Browser engine to use (`puppeteer` or `playwright`). Default: `puppeteer`

**Examples:**
```bash
# Using default Puppeteer engine
curl http://localhost:3000/html?url=https://example.com

# Using Playwright engine
curl http://localhost:3000/html?url=https://example.com&engine=playwright
```

### Markdown Endpoint
```bash
GET /markdown?url=<URL>
```
Converts the HTML content of the specified URL to Markdown format.

### Image Endpoint
```bash
GET /image?url=<URL>&engine=<ENGINE>
```
Returns a PNG screenshot of the specified URL.

**Parameters:**
- `url` (required): The URL to capture
- `engine` (optional): Browser engine to use (`puppeteer` or `playwright`). Default: `puppeteer`

**Examples:**
```bash
# Using default Puppeteer engine
curl http://localhost:3000/image?url=https://example.com > screenshot.png

# Using Playwright engine
curl http://localhost:3000/image?url=https://example.com&engine=playwright > screenshot.png
```

## Browser Engine Support

The service supports both **Puppeteer** and **Playwright** browser engines:

- **Puppeteer**: Default engine, mature and well-tested
- **Playwright**: Alternative engine with similar capabilities

You can choose the engine using the `engine` query parameter or by setting the `BROWSER_ENGINE` environment variable.

**Supported engine values:**
- `puppeteer` or `pptr` - Use Puppeteer
- `playwright` or `pw` - Use Playwright

**Environment Variable:**
```bash
export BROWSER_ENGINE=playwright
```

## Development

The service is built with:
- Express.js for the web server
- Puppeteer and Playwright for headless browser automation and screenshots
- Turndown for HTML to Markdown conversion
- Jest for testing

## License

UNLICENSED
