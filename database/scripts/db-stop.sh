#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

pg_ctl -D "$PROJECT_ROOT/pgdata" stop || true
echo "Postgres stopped (if it was running)"
