#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.prod.pull.yml"

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "Error: ${COMPOSE_FILE} not found in ${ROOT_DIR}"
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Error: .env not found. Copy .env.example and set production secrets."
  exit 1
fi

if [[ ! -f backend/.env.production ]]; then
  echo "Error: backend/.env.production not found."
  exit 1
fi

echo "Pulling images..."
docker compose -f "${COMPOSE_FILE}" pull

echo "Starting services..."
docker compose -f "${COMPOSE_FILE}" up -d

echo ""
docker compose -f "${COMPOSE_FILE}" ps
