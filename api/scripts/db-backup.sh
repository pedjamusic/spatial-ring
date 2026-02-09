#!/usr/bin/env bash
#
# db-backup.sh — Dump PostgreSQL database from a Docker container
#
# Usage:
#   ./db-backup.sh                          # uses defaults
#   CONTAINER=my-pg DB_NAME=mydb ./db-backup.sh  # override
#
# Environment variables (all optional, with defaults):
#   CONTAINER   — Docker container name        (default: pg-local)
#   DB_USER     — PostgreSQL user              (default: postgres)
#   DB_NAME     — Database name                (default: app)
#   BACKUP_DIR  — Where to store backups       (default: ../backups relative to this script)
#   KEEP_DAYS   — Delete backups older than N  (default: 7)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

CONTAINER="${CONTAINER:-pg-local}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-app}"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/../../backups}"
KEEP_DAYS="${KEEP_DAYS:-7}"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILENAME="${DB_NAME}_${TIMESTAMP}.sql.gz"
FILEPATH="$BACKUP_DIR/$FILENAME"

echo "=== DB Backup ==="
echo "  Container: $CONTAINER"
echo "  Database:  $DB_NAME"
echo "  Output:    $FILEPATH"

# Check container is running
if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "ERROR: Container '$CONTAINER' is not running." >&2
  exit 1
fi

# Dump and compress
docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$FILEPATH"

# Verify file is non-empty
if [ ! -s "$FILEPATH" ]; then
  echo "ERROR: Backup file is empty, something went wrong." >&2
  rm -f "$FILEPATH"
  exit 1
fi

SIZE="$(du -h "$FILEPATH" | cut -f1)"
echo "  Size:      $SIZE"
echo "  Done!"

# Prune old backups
PRUNED=0
while IFS= read -r old_file; do
  rm -f "$old_file"
  PRUNED=$((PRUNED + 1))
done < <(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +"$KEEP_DAYS" -type f 2>/dev/null)

if [ "$PRUNED" -gt 0 ]; then
  echo "  Pruned $PRUNED backup(s) older than $KEEP_DAYS days."
fi
