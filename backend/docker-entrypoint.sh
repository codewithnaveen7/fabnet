#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Running database seed (creates default users if database is empty)..."
node prisma/seed.js

echo "Starting application..."
exec node src/index.js
