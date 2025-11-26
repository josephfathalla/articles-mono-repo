
FROM node:20-alpine AS base

# Install turbo globally
RUN npm install -g turbo

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN turbo prune --scope=backend --docker

RUN apk --no-cache add curl gnupg bash \
  && curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash \
  && apk --no-cache add infisical \
  && rm -rf /var/cache/apk/* /tmp/*

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
#COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm@10.17.0
RUN pnpm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.base.json tsconfig.base.json

# Generate Prisma Client
ENV DATABASE_URL="postgresql://dummy:5432/dummy"
RUN pnpm --filter @my-better-t-app/db exec prisma generate

#Build db
RUN pnpm --filter @my-better-t-app/db exec pnpm build

# Build contracts
RUN pnpm --filter @my-better-t-app/contracts exec pnpm build

# Build auth
RUN pnpm --filter @my-better-t-app/auth exec pnpm build

#Build backend
RUN pnpm --filter backend exec pnpm build

FROM base AS runner
WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/backend/dist ./apps/backend/dist
COPY --from=installer /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=installer /app/apps/backend/package.json ./apps/backend/package.json

# Copy built workspace packages (entire packages to preserve structure)
COPY --from=installer /app/packages/auth ./packages/auth
COPY --from=installer /app/packages/contracts ./packages/contracts
COPY --from=installer /app/packages/db ./packages/db

# Copy entrypoint script
COPY --chown=nestjs:nodejs apps/backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Copy prisma schema if needed for engine, but usually client is enough in node_modules
CMD ["docker-entrypoint.sh"]

