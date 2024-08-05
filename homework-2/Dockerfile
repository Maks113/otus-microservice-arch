FROM node:22.5.1-alpine3.20 as builder

WORKDIR /app

COPY ./ ./

RUN npm i
RUN npm run build

FROM node:22.5.1-alpine3.20

WORKDIR /app

COPY --from=builder /app/dist/ ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

RUN npm i --omit=dev

ENTRYPOINT ["npm", "run", "start"]
