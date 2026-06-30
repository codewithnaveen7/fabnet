#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$NODE_ENV" = "development" ]; then
  echo "Seeding development database..."
  node prisma/seed.js
fi

echo "Starting application..."
exec node src/index.js
