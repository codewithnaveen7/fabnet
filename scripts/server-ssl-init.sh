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

PANEL_DOMAIN="${PANEL_DOMAIN:-panel.fabnetsystems.com}"
API_DOMAIN="${API_DOMAIN:-api.fabnetsystems.com}"
CDN_DOMAIN="${CDN_DOMAIN:-cdn.fabnetsystems.com}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"

if [[ -z "${LETSENCRYPT_EMAIL}" ]]; then
  echo "Error: set LETSENCRYPT_EMAIL in .env before running SSL setup."
  exit 1
fi

mkdir -p certbot/conf certbot/www

request_cert() {
  local domain="$1"
  if [[ -f "certbot/conf/live/${domain}/fullchain.pem" ]]; then
    echo "Certificate already exists for ${domain}, skipping."
    return 0
  fi

  echo "Requesting certificate for ${domain}..."
  docker compose -f "${COMPOSE_FILE}" run --rm certbot certonly \
    --webroot \
    -w /var/www/certbot \
    --email "${LETSENCRYPT_EMAIL}" \
    --agree-tos \
    --no-eff-email \
    -d "${domain}"
}

request_cert "${PANEL_DOMAIN}"
request_cert "${API_DOMAIN}"
request_cert "${CDN_DOMAIN}"

echo "Reloading proxy with HTTPS configs..."
docker compose -f "${COMPOSE_FILE}" up -d --force-recreate proxy

echo ""
echo "SSL enabled for:"
echo "  https://${PANEL_DOMAIN}"
echo "  https://${API_DOMAIN}"
echo "  https://${CDN_DOMAIN}"
