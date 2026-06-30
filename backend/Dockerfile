FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=development
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
