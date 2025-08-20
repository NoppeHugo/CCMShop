#!/bin/sh
set -e

# Wait for DATABASE_URL host to be reachable (simple loop)
if [ -n "$DATABASE_URL" ]; then
  echo "🔌 Waiting for database..."
  # extract host and port from DATABASE_URL (basic)
  DB_HOST=$(echo $DATABASE_URL | sed -E 's#.*@([^:/]+).*#\1#')
  DB_PORT=$(echo $DATABASE_URL | sed -E 's#.*:([0-9]+)/.*#\1#' || echo 5432)

  # simple wait loop (max 60s)
  i=0
  while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    i=$((i+1))
    if [ $i -gt 60 ]; then
      echo "❌ Database not reachable after 60s"
      break
    fi
    sleep 1
  done
fi

# Generate Prisma client (again to be safe)
npx prisma generate || true

# Run migrations in production if requested
if [ "$PRISMA_MIGRATE" = "true" ]; then
  echo "🚚 Running prisma migrate deploy..."
  npx prisma migrate deploy || true
fi

# Start server (use server-prisma.js to use DB-backed server)
node server-prisma.js