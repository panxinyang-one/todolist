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

echo "==> Rebuild and start containers"
docker compose -f "$COMPOSE_FILE" --env-file .env up -d --build

echo "==> Deployment finished"
docker compose -f "$COMPOSE_FILE" ps
