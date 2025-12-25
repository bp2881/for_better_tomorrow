#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

mkdir -p "$PROJECT_ROOT/pgsocket"

# start project-local Postgres on port 5433 (non-default to avoid clashing)
pg_ctl -D "$PROJECT_ROOT/pgdata" \
  -o "-k $PROJECT_ROOT/pgsocket -p 5433" \
  start

echo "Postgres started (socket dir: $PROJECT_ROOT/pgsocket, port: 5433)"
