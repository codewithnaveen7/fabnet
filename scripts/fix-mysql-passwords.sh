#!/usr/bin/env bash
# Reset MySQL root + fabnet passwords to match .env (when login fails due to $ interpolation or env change).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.pull.yml}"

if [[ ! -f .env ]]; then
  echo "Error: .env not found"
  exit 1
fi

read_env() {
  local key="$1"
  local line value
  line="$(grep -E "^${key}=" .env | tail -1 || true)"
  value="${line#*=}"
  value="${value%$'\r'}"
  value="${value#\'}"; value="${value%\'}"
  value="${value#\"}"; value="${value%\"}"
  printf '%s' "$value"
}

sql_escape() {
  printf '%s' "$1" | sed "s/'/''/g"
}

MYSQL_ROOT_PASSWORD="$(read_env MYSQL_ROOT_PASSWORD)"
MYSQL_USER="$(read_env MYSQL_USER)"; MYSQL_USER="${MYSQL_USER:-fabnet}"
MYSQL_PASSWORD="$(read_env MYSQL_PASSWORD)"
MYSQL_DATABASE="$(read_env MYSQL_DATABASE)"; MYSQL_DATABASE="${MYSQL_DATABASE:-fabnet}"

if [[ -z "${MYSQL_ROOT_PASSWORD}" || -z "${MYSQL_PASSWORD}" ]]; then
  echo "Error: MYSQL_ROOT_PASSWORD and MYSQL_PASSWORD must be set in .env"
  exit 1
fi

PROJECT="$(basename "$ROOT_DIR" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]_-')"
VOLUME="${PROJECT}_mysql_prod_data"

ROOT_ESC="$(sql_escape "$MYSQL_ROOT_PASSWORD")"
USER_ESC="$(sql_escape "$MYSQL_USER")"
PASS_ESC="$(sql_escape "$MYSQL_PASSWORD")"
DB_ESC="$(sql_escape "$MYSQL_DATABASE")"

TMP_SQL="$(mktemp)"
cat > "${TMP_SQL}" <<SQL
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '${ROOT_ESC}';
ALTER USER 'root'@'%' IDENTIFIED BY '${ROOT_ESC}';
CREATE USER IF NOT EXISTS '${USER_ESC}'@'%' IDENTIFIED BY '${PASS_ESC}';
ALTER USER '${USER_ESC}'@'%' IDENTIFIED BY '${PASS_ESC}';
GRANT ALL PRIVILEGES ON \`${DB_ESC}\`.* TO '${USER_ESC}'@'%';
FLUSH PRIVILEGES;
SQL

echo "Stopping MySQL-dependent services..."
docker compose -f "${COMPOSE_FILE}" stop backend phpmyadmin proxy mysql 2>/dev/null || true

echo "Resetting MySQL passwords via skip-grant-tables (volume: ${VOLUME})..."

docker run --rm \
  -v "${VOLUME}:/var/lib/mysql" \
  -v "${TMP_SQL}:/reset.sql:ro" \
  mysql:8 \
  bash -c '
    mysqld --skip-grant-tables --skip-networking &
    pid=$!
    for i in $(seq 1 30); do
      mysql -uroot -e "SELECT 1" >/dev/null 2>&1 && break
      sleep 1
    done
    mysql -uroot < /reset.sql
    kill $pid
    wait $pid 2>/dev/null || true
  '

rm -f "${TMP_SQL}"

echo "Starting services..."
docker compose -f "${COMPOSE_FILE}" up -d

echo ""
echo "MySQL passwords synced to .env values."
echo "phpMyAdmin login:"
echo "  root / (MYSQL_ROOT_PASSWORD from .env)"
echo "  ${MYSQL_USER} / (MYSQL_PASSWORD from .env)"
