#!/bin/sh
set -e

# Strip accidental quotes from DATABASE_URL (common .env mistake)
if [ -n "${DATABASE_URL:-}" ]; then
  DATABASE_URL=$(printf '%s' "$DATABASE_URL" | sed -e "s/^['\"]//" -e "s/['\"]$//")
  export DATABASE_URL
fi

# Prefer building URL from MYSQL_* so special chars are encoded correctly
if [ -n "${MYSQL_PASSWORD:-}" ]; then
  DATABASE_URL="$(
    MYSQL_USER="${MYSQL_USER:-fabnet}" \
    MYSQL_PASSWORD="$MYSQL_PASSWORD" \
    MYSQL_DATABASE="${MYSQL_DATABASE:-fabnet}" \
    node -e "
      const u = process.env.MYSQL_USER;
      const p = encodeURIComponent(process.env.MYSQL_PASSWORD);
      const d = process.env.MYSQL_DATABASE;
      process.stdout.write('mysql://' + u + ':' + p + '@mysql:3306/' + d);
    "
  )"
  export DATABASE_URL
  echo "DATABASE_URL built from MYSQL_* credentials"
fi

case "${DATABASE_URL:-}" in
  mysql://*)
    echo "DATABASE_URL protocol OK"
    ;;
  *)
    echo "ERROR: DATABASE_URL must start with mysql:// (got: $(printf '%s' "${DATABASE_URL:-<empty>}" | cut -c1-30))"
    echo "Fix backend/.env.production or set MYSQL_PASSWORD in root .env"
    exit 1
    ;;
esac

echo "Running database migrations..."
npx prisma migrate deploy

echo "Running database seed (creates default users if database is empty)..."
node prisma/seed.js

echo "Starting application..."
exec node src/index.js
