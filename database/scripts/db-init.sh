#!/bin/sh
set -eu

PROJECT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DB_PATH="$PROJECT_ROOT/data/app.db"

mkdir -p "$PROJECT_ROOT/data"

sqlite3 "$DB_PATH" < "$PROJECT_ROOT/sql/schema.sql"
sqlite3 "$DB_PATH" < "$PROJECT_ROOT/sql/seed.sql"

echo "SQLite database ready at: $DB_PATH"
