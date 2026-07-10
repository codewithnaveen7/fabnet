#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.pull.yml}"

docker compose -f "${COMPOSE_FILE}" exec backend node prisma/reset-admin-password.js

echo ""
echo "Admin login: admin@fabnetsystems.com / Admin@123"
