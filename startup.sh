#!/bin/bash
set -e

echo "🚀 Starting Randevu Yönetim Sistemi v2.0..."

# PostgreSQL bağlantısını bekle
echo "⏳ Waiting for PostgreSQL..."
MAX_RETRIES=30
RETRY_COUNT=0

until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ PostgreSQL bağlantı hatası!"
    echo "   Host: $DB_HOST:$DB_PORT"
    echo "   User: $DB_USER"
    exit 1
  fi
  echo "   Bekleniyor... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "✅ PostgreSQL hazır!"

# Database oluştur
echo "📊 Creating database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "   Database zaten var"

# Tabloları oluştur
echo "📊 Setting up tables..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f /app/backend/database-setup.sql 2>/dev/null || echo "   Tablolar zaten var"

echo "✅ Database hazır!"

# Servisleri başlat
echo "🎬 Starting services..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
