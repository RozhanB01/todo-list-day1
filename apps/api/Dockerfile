FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=development
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 4000
CMD ["npx", "tsx", "src/index.ts"]
