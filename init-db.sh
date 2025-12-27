#!/bin/sh
# Bu script container başladığında database'i kurar

echo "Waiting for PostgreSQL..."
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; do
  sleep 2
done

echo "Running database setup..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f /app/backend/database-setup.sql
