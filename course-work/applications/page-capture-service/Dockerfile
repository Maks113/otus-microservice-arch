FROM node:22.5.1-alpine3.20 as builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

COPY ./ ./

RUN npm i -g pnpm
RUN pnpm i
RUN pnpm run build

FROM node:22.5.1-alpine3.20

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

RUN apt-get update && apt-get install -y --no-install-recommends \
  chromium \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/dist/ ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN npm i -g pnpm
RUN pnpm i --prod

ENTRYPOINT ["node", "dist/main"]
