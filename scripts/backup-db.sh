#!/bin/bash
# ELIMU — nightly PostgreSQL backup with retention.
# Reads DATABASE_URL from elimu-platform/.env.local (never logs the value).
set -euo pipefail

APP_DIR="/home/abjales/projects/elimu"
ENV_FILE="$APP_DIR/elimu-platform/.env.local"
BACKUP_DIR="$APP_DIR/backups"
RETENTION_DAYS="${ELIMU_BACKUP_RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

DB_URL="$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)"
if [ -z "$DB_URL" ]; then
  echo "ERROR: DATABASE_URL not found in $ENV_FILE" >&2
  exit 1
fi

TS="$(date +%Y%m%d_%H%M%S)"
OUT="$BACKUP_DIR/elimu_${TS}.dump"

pg_dump "$DB_URL" --no-owner --format=custom --file="$OUT"

# Prune backups older than the retention window (only files matching the pattern).
find "$BACKUP_DIR" -name 'elimu_*.dump' -type f -mtime "+${RETENTION_DAYS}" -delete

echo "Backup complete: $OUT"
