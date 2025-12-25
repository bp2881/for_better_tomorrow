#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  . "$PROJECT_ROOT/.env"
  set +a
fi

PGHOST="${PGHOST:-$PROJECT_ROOT/pgsocket}"
PGPORT="${PGPORT:-5433}"
PGDATABASE="${PGDATABASE:-agentic}"

export PGHOST PGPORT PGDATABASE

exec psql
