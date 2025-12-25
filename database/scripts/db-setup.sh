#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

# Load .env if exists (export variables)
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  . "$PROJECT_ROOT/.env"
  set +a
fi

# Defaults (if not provided in .env)
PROJECT_DB="${PGDATABASE:-agentic}"
PROJECT_PORT="${PGPORT:-5433}"
PROJECT_SOCKET="${PGHOST:-$PROJECT_ROOT/pgsocket}"

# make sure Postgres is running
if [ ! -S "$PROJECT_SOCKET/.s.PGSQL.$PROJECT_PORT" ]; then
  echo "Postgres socket not found at $PROJECT_SOCKET; start the DB first with ./scripts/db-start.sh"
  exit 1
fi

# 1) create DB (connect to template1)
psql -h "$PROJECT_SOCKET" -p "$PROJECT_PORT" template1 -c "CREATE DATABASE \"$PROJECT_DB\" OWNER $USER;" || true

# 2) run schema and seed
psql -h "$PROJECT_SOCKET" -p "$PROJECT_PORT" -d "$PROJECT_DB" -f "$PROJECT_ROOT/sql/schema.sql"
psql -h "$PROJECT_SOCKET" -p "$PROJECT_PORT" -d "$PROJECT_DB" -f "$PROJECT_ROOT/sql/seed.sql"

echo "Database $PROJECT_DB created and migrated"
