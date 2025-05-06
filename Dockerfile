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
