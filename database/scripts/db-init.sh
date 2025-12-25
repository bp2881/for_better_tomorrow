#!/bin/sh
set -eu

# Make directories and initdb if needed
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

cd "$PROJECT_ROOT"

mkdir -p pgdata pgsocket

# initialize only if not already initialized
if [ ! -f "pgdata/PG_VERSION" ]; then
  initdb -D "$PROJECT_ROOT/pgdata"
  echo "Initialized Postgres cluster at $PROJECT_ROOT/pgdata"
else
  echo "Postgres cluster already initialized"
fi
