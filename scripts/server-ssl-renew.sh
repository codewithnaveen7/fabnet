#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.pull.yml}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

echo "Renewing Let's Encrypt certificates..."
docker compose -f "${COMPOSE_FILE}" run --rm certbot renew
docker compose -f "${COMPOSE_FILE}" up -d --force-recreate proxy
echo "Done."
