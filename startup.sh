#!/bin/bash
set -e

echo "🚀 Starting Randevu Yönetim Sistemi..."

# PostgreSQL'in hazır olmasını bekle
echo "⏳ Waiting for PostgreSQL..."
MAX_RETRIES=30
RETRY_COUNT=0

until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ PostgreSQL bağlantı hatası - timeout!"
    echo "   Host: $DB_HOST:$DB_PORT"
    echo "   User: $DB_USER"
    exit 1
  fi
  echo "   PostgreSQL is unavailable - sleeping ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# randevu_master database'ini oluştur (varsa hata vermez)
echo "📊 Creating randevu_master database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE randevu_master;" 2>/dev/null || echo "   Database already exists"

# Database'i kur
echo "📊 Setting up database tables..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d randevu_master -f /app/backend/database-setup.sql 2>/dev/null || echo "   Tables already initialized"

echo "✅ Database ready!"

# Supervisor'ı başlat
echo "🎬 Starting services..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
