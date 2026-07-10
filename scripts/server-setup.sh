#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.pull.yml}"
SKIP_SSL="${SKIP_SSL:-0}"

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

set -a
# shellcheck disable=SC1091
source .env
set +a

PANEL_DOMAIN="${PANEL_DOMAIN:-panel.fabnetsystems.com}"
API_DOMAIN="${API_DOMAIN:-api.fabnetsystems.com}"
CDN_DOMAIN="${CDN_DOMAIN:-cdn.fabnetsystems.com}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"

mkdir -p certbot/conf certbot/www

echo "==> Pulling images..."
docker compose -f "${COMPOSE_FILE}" pull

echo "==> Starting services..."
docker compose -f "${COMPOSE_FILE}" up -d

echo "==> Waiting for API via proxy..."
for _ in $(seq 1 30); do
  if curl -sf -H "Host: ${API_DOMAIN}" "http://127.0.0.1/health" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

if [[ "${SKIP_SSL}" != "1" && -n "${LETSENCRYPT_EMAIL}" ]]; then
  echo "==> Enabling HTTPS (Let's Encrypt)..."
  COMPOSE_FILE="${COMPOSE_FILE}" ./scripts/server-ssl-init.sh
elif [[ "${SKIP_SSL}" != "1" ]]; then
  echo ""
  echo "SKIP_SSL not set but LETSENCRYPT_EMAIL is empty — running HTTP only."
  echo "Add LETSENCRYPT_EMAIL to .env and run: ./scripts/server-ssl-init.sh"
else
  echo "SKIP_SSL=1 — HTTP only."
fi

echo ""
docker compose -f "${COMPOSE_FILE}" ps
echo ""
echo "URLs:"
echo "  Panel:  http://${PANEL_DOMAIN}"
echo "  API:    http://${API_DOMAIN}/health"
echo "  CDN:    http://${CDN_DOMAIN}/kdesigns/remoteEntry.js"
echo ""
echo "phpMyAdmin (SSH tunnel): ssh -L 8081:127.0.0.1:8081 user@server → http://localhost:8081"
