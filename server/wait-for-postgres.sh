#!/bin/sh
# wait-for-postgres.sh
>&2 echo "Checking postgres..."

until PGPASSWORD=$DB_PASSWORD PGUSER=$DB_USER PGHOST=$DB_HOST PGDATABASE=$DB_NAME psql -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
>&2 echo "Postgres is up..."
exec "$@"
