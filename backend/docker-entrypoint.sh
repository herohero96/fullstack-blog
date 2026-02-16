#!/bin/sh
set -e

echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT:-3306}..."

MAX_RETRIES=30
RETRY=0
until nc -z "${DB_HOST}" "${DB_PORT:-3306}" 2>/dev/null; do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "ERROR: MySQL not reachable after ${MAX_RETRIES} attempts."
    exit 1
  fi
  echo "  Waiting... (${RETRY}/${MAX_RETRIES})"
  sleep 2
done

echo "MySQL is up. Syncing database schema..."
npx prisma db push

echo "Starting application..."
exec "$@"
