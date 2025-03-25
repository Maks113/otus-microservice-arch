FROM node:22.5.1-alpine3.20 AS builder

WORKDIR /app

RUN npm i -g pnpm
RUN pnpm i

ENTRYPOINT ["npm", "run", "start:debug"]