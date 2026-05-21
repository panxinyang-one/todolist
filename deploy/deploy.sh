#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/todolist}"
COMPOSE_FILE="deploy/docker-compose.yml"

cd "$DEPLOY_PATH"

echo "==> Pull latest code"
git pull origin main

echo "==> Build frontend"
cd client
npm ci
npm run build
cd ..

echo "==> Build server"
cd server && npm ci && npm run build && cd ..

echo "==> Restart API with PM2"
pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save

echo "==> Deployment finished"
pm2 status
