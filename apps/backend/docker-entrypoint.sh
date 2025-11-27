#!/bin/sh
set -ex

# echo "Running database migrations..."
# cd /app/packages/database
# npx prisma migrate deploy
# cd /app
# 1) Obtain a short-lived token via machine identity

INFISICAL_TOKEN=$(
  infisical login \
    --method=universal-auth \
    --client-id="$INFISICAL_MACHINE_CLIENT_ID" \
    --client-secret="$INFISICAL_MACHINE_CLIENT_SECRET" \
    --domain="$INFISICAL_API_URL" \
    --silent --plain
)

# 2) Inject secrets and run your app
# Website vs backend get distinguished by INFISICAL_ENV or path in Infisical
APP_CMD=${APP_CMD:-"node /app/apps/backend/dist/main.js"}  # override per service via env

echo "Starting backend server..."

exec infisical run \
  --token "$INFISICAL_TOKEN" \
  --projectId "$INFISICAL_PROJECT_ID" \
  --env "$INFISICAL_SECRET_ENV" \
  --domain "$INFISICAL_API_URL" \
  -- sh -c "$APP_CMD"