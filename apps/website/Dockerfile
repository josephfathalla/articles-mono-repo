FROM node:20-alpine AS base


# Install turbo and infisical globally
RUN npm install -g turbo @infisical/cli

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN turbo prune --scope=website --docker


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
COPY tsconfig.base.json tsconfig.base.json

# Generate Prisma Client requires DATABASE_URL
ENV DATABASE_URL="postgresql://dummy:5432/dummy"
RUN pnpm --filter @my-better-t-app/db exec prisma generate


ARG INFISICAL_MACHINE_CLIENT_ID
ARG INFISICAL_MACHINE_CLIENT_SECRET
ARG INFISICAL_PROJECT_ID
ARG INFISICAL_SECRET_ENV
ARG INFISICAL_API_URL

# 1. Login
# 2. Export secrets to apps/website/.env
# 3. Build
# 4. (Optional) Remove .env if you are paranoid, though it stays in this layer.

RUN export INFISICAL_TOKEN=$(infisical login --method=universal-auth --client-id="$INFISICAL_MACHINE_CLIENT_ID" --client-secret="$INFISICAL_MACHINE_CLIENT_SECRET" --domain="$INFISICAL_API_URL" --silent --plain) && \
    infisical export --token="$INFISICAL_TOKEN" --projectId="$INFISICAL_PROJECT_ID" --env="$INFISICAL_SECRET_ENV" --domain="$INFISICAL_API_URL" --format=dotenv > apps/website/.env && \
    turbo run build --filter=website...

FROM base AS runner
WORKDIR /app

RUN npm install -g @infisical/cli
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/website/.output ./.output
# Nitro output is standalone, but sometimes needs node_modules if externalized?
# Usually .output/server/node_modules exists if needed.
# But for safety in a monorepo with potential external deps not bundled:
# COPY --from=installer /app/node_modules ./node_modules 
# Nitro/Vite build usually bundles everything for server unless configured otherwise.
# Let's assume standalone for now, but if it fails we might need node_modules.
# Actually, let's copy node_modules just in case, or rely on the bundled output.
# The standard for Nitro is that .output is standalone.
# Copy entrypoint script
COPY --chown=nextjs:nodejs apps/website/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Copy prisma schema if needed for engine, but usually client is enough in node_modules
CMD ["./docker-entrypoint.sh"]

