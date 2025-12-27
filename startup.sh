#!/bin/bash
set -e

echo "🚀 Starting Randevu Yönetim Sistemi..."

# PostgreSQL'in hazır olmasını bekle
echo "⏳ Waiting for PostgreSQL..."
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d postgres -c '\q' 2>/dev/null; do
  echo "   PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# randevu_master database'ini oluştur (varsa hata vermez)
echo "📊 Creating randevu_master database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d postgres -c "CREATE DATABASE randevu_master;" 2>/dev/null || echo "   Database already exists"

# Database'i kur
echo "📊 Setting up database tables..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d randevu_master -f /app/backend/database-setup.sql 2>/dev/null || echo "   Tables already initialized"

echo "✅ Database ready!"

# Supervisor'ı başlat
echo "🎬 Starting services..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
