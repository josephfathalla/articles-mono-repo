
FROM node:20-alpine AS base

# Install turbo globally
RUN npm install -g turbo

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN turbo prune --scope=backend --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm@10.17.0
RUN pnpm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN DATABASE_URL="postgresql://dummy:5432/dummy" turbo run db:generate
RUN turbo run build --filter=backend...

FROM base AS runner
WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer /app/apps/backend/dist ./dist
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/backend/package.json ./package.json

# Copy prisma schema if needed for engine, but usually client is enough in node_modules

CMD ["node", "dist/main.js"]

