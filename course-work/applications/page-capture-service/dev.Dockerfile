FROM node:22.5.1 as builder

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

RUN apt update && apt install -y --no-install-recommends \
  chromium \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENTRYPOINT ["npm", "run", "start:dev"]