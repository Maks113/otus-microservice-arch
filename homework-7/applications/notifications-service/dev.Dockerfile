FROM node:22.5.1-alpine3.20 AS builder

WORKDIR /app

ENTRYPOINT ["npm", "run", "start:dev"]