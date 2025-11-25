FROM node:20-alpine AS base

# Install turbo globally
RUN npm install -g turbo

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN turbo prune --scope=web --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm@10.17.0
RUN pnpm install

# Build
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

ENV DATABASE_URL="postgresql://dummy:5432/dummy"

RUN turbo run db:generate
RUN turbo run build --filter=web...

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 reactrouter
USER reactrouter

COPY --from=installer /app/apps/web/build ./build
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/web/package.json ./package.json

CMD ["npx", "react-router-serve", "./build/server/index.js"]


