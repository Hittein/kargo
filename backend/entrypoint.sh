#!/bin/sh
set -eu

# Render gives us postgres:// — Spring needs jdbc:postgresql://. Convert here.
if [ -n "${DATABASE_URL:-}" ]; then
  DB_URI="${DATABASE_URL#postgres://}"
  DB_URI="${DB_URI#postgresql://}"

  DB_CREDENTIALS="${DB_URI%@*}"
  DB_HOST_AND_PATH="${DB_URI#*@}"

  DB_USER="${DB_CREDENTIALS%%:*}"
  DB_PASS="${DB_CREDENTIALS#*:}"

  DB_HOST_PORT="${DB_HOST_AND_PATH%%/*}"
  DB_PATH="${DB_HOST_AND_PATH#*/}"
  DB_NAME="${DB_PATH%%\?*}"
  DB_QUERY=""

  case "$DB_PATH" in
    *\?*)
      DB_QUERY="?${DB_PATH#*\?}"
      ;;
  esac

  DB_HOST="$DB_HOST_PORT"
  DB_PORT=""
  case "$DB_HOST_PORT" in
    *:*)
      DB_HOST="${DB_HOST_PORT%%:*}"
      DB_PORT="${DB_HOST_PORT##*:}"
      ;;
  esac

  if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
    printf 'Invalid DATABASE_URL, unable to derive JDBC settings: %s\n' "$DATABASE_URL" >&2
    exit 1
  fi

  JDBC_URL="jdbc:postgresql://${DB_HOST}"
  if [ -n "$DB_PORT" ]; then
    JDBC_URL="${JDBC_URL}:${DB_PORT}"
  fi
  JDBC_URL="${JDBC_URL}/${DB_NAME}${DB_QUERY}"

  export SPRING_DATASOURCE_URL="$JDBC_URL"
  export SPRING_DATASOURCE_USERNAME="$DB_USER"
  export SPRING_DATASOURCE_PASSWORD="$DB_PASS"

  printf 'Database: %s user=%s\n' "$SPRING_DATASOURCE_URL" "$SPRING_DATASOURCE_USERNAME"
fi

exec java -jar app.jar
