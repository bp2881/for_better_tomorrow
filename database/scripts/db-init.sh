#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

SQL_DIR="$PROJECT_ROOT/sql"
DATA_DIR="$PROJECT_ROOT/data"
DB_PATH="$DATA_DIR/app.db"

mkdir -p "$DATA_DIR"

if [ ! -f "$DB_PATH" ]; then
  echo "Creating SQLite DB at $DB_PATH"
  sqlite3 "$DB_PATH" < "$SQL_DIR/sqlschema.sql"
  sqlite3 "$DB_PATH" < "$SQL_DIR/seed.sql"
  echo "Database created and seeded."
else
  echo "Database already exists at $DB_PATH — running migrations/ensuring schema"
  sqlite3 "$DB_PATH" < "$SQL_DIR/sqlschema.sql"
  sqlite3 "$DB_PATH" < "$SQL_DIR/seed.sql"
  echo "Schema ensured and seed applied (INSERT OR IGNORE style)."
fi

echo "Done."
