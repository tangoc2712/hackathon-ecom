#!/bin/bash

# Load environment variables from .env file
if [ -f ../.env ]; then
  export $(cat ../.env | grep -v '#' | awk '/=/ {print $1}')
fi

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

COMMAND=$1
FILENAME=${2:-dump.sql}

case "$COMMAND" in
  export)
    echo "Exporting database to $FILENAME..."
    pg_dump "$DATABASE_URL" > "$FILENAME"
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
    psql "$DATABASE_URL" < "$FILENAME"
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
