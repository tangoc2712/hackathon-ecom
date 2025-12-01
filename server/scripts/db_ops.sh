#!/bin/bash

# Load environment variables from .env file
if [ -f ../.env ]; then
  set -a
  source ../.env
  set +a
fi

echo "Debug: DATABASE_URL is '$DATABASE_URL'"

# Clean DATABASE_URL for pg_dump/psql (remove schema parameter)
CLEAN_DB_URL=$(echo "$DATABASE_URL" | sed 's/[?&]schema=[^&]*//g')
# Remove trailing ? or & if any (though the above regex might leave one if it was ?schema=...&other=...)
# A simpler approach if schema is the only param or at the end:
CLEAN_DB_URL=${CLEAN_DB_URL%\?*}


# Function to show usage
usage() {
  echo "Usage: $0 {export|import} [filename]"
  echo "  export [filename]  - Export the database to a SQL file (default: dump.sql)"
  echo "  import [filename]  - Import the database from a SQL file (default: dump.sql)"
  exit 1
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set in ../.env"
  exit 1
fi

# Check if running in Docker
CONTAINER_NAME="fsoft_rag_postgres"
if docker ps | grep -q "$CONTAINER_NAME"; then
  echo "Debug: Using Docker container '$CONTAINER_NAME'"
  PG_DUMP="docker exec -i $CONTAINER_NAME pg_dump"
  PSQL="docker exec -i $CONTAINER_NAME psql"
  # Inside docker, we should use the internal user/db if possible, or pass the full URL.
  # However, the URL contains 'localhost', which might not work inside the container if it refers to the host.
  # But here we are running the command FROM the host, executing INSIDE the container.
  # So 'localhost' inside the container refers to the container itself, which is correct for Postgres listening on 5432.
  # BUT, the DATABASE_URL might have 'localhost' which is fine.
  # Let's verify if we need to adjust the URL.
  # Usually, inside the container, 'localhost' works.
else
  # Find pg_dump and psql locally
  PG_DUMP="pg_dump"
  PSQL="psql"

  if ! command -v pg_dump &> /dev/null; then
    if [ -f "/Applications/pgAdmin 4.app/Contents/SharedSupport/pg_dump" ]; then
      PG_DUMP="/Applications/pgAdmin 4.app/Contents/SharedSupport/pg_dump"
    else
      echo "Error: pg_dump not found in PATH or common locations."
      exit 1
    fi
  fi

  if ! command -v psql &> /dev/null; then
    if [ -f "/Applications/pgAdmin 4.app/Contents/SharedSupport/psql" ]; then
      PSQL="/Applications/pgAdmin 4.app/Contents/SharedSupport/psql"
    else
      echo "Error: psql not found in PATH or common locations."
      exit 1
    fi
  fi
fi

COMMAND=$1
FILENAME=${2:-dump.sql}

case "$COMMAND" in
  export)
    echo "Exporting database to $FILENAME..."
    # We need to run the command without quotes around $PG_DUMP if it contains spaces (like 'docker exec ...')
    $PG_DUMP "$CLEAN_DB_URL" > "$FILENAME"
    if [ $? -eq 0 ]; then
      echo "Export successful!"
    else
      echo "Export failed!"
    fi
    ;;
  import)
    if [ ! -f "$FILENAME" ]; then
      echo "Error: File $FILENAME not found!"
      exit 1
    fi
    echo "Importing database from $FILENAME..."
    # For import, we pipe the file into the command
    $PSQL "$CLEAN_DB_URL" < "$FILENAME"
    if [ $? -eq 0 ]; then
      echo "Import successful!"
    else
      echo "Import failed!"
    fi
    ;;
  *)
    usage
    ;;
esac
