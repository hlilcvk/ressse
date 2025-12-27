# 🗓️ Randevu Yönetim Sistemi

Multi-tenant SaaS randevu yönetim sistemi - Tam özellikli

## ✨ Özellikler

- ✅ Multi-tenant (Her işletme kendi DB'si)
- ✅ JWT Authentication
- ✅ Admin Paneli
- ✅ Dinamik Takvim
- ✅ Drag & Drop Randevu Taşıma
- ✅ Çalışma Odası Yönetimi
- ✅ Responsive Tasarım

## 🚀 Coolify'da Kurulum

### 1. Bu Repository'i Fork/Clone Edin

### 2. Coolify'da Yeni Application Oluşturun
- **"+ Add"** → **"Application"**
- **"Public Repository"** seçin
- Repository URL'nizi girin
- Branch: `main`

### 3. Build Ayarları
- Build Type: **"Docker Compose"**
- Docker Compose Path: `docker-compose.yml`

### 4. Environment Variables (Opsiyonel)
Coolify'da environment variables ekleyin:
```
POSTGRES_PASSWORD=GucluSifre123
JWT_SECRET=gizli-anahtar-2024
```

### 5. Deploy Edin!

## 📱 Kullanım

### İlk Giriş
```
URL: http://your-domain
Kullanıcı: superadmin
Şifre: Admin123!
```

### Örnek İşletmeler (Database kurulduktan sonra)
```
Güzellik Salonu:
  Kullanıcı: guzellik_admin
  Şifre: Guzellik123

Diş Kliniği:
  Kullanıcı: dis_admin
  Şifre: Dis123
```

## 🗄️ Database Kurulumu

PostgreSQL otomatik olarak kurulur ve örnek verilerle doldurulur.

## 📊 Portlar

- **Frontend: 80** (Sadece bu portu açmanız yeterli!)
- Backend: 3000 (internal - Nginx proxy üzerinden erişilir)
- PostgreSQL: 5432 (internal)

## 🔧 Geliştirme

```bash
# Yerel ortamda çalıştırma
docker-compose up -d

# Logları izleme
docker-compose logs -f

# Durdurma
docker-compose down
```

## 📚 Teknik Stack

**Backend:**
- Node.js + Express
- PostgreSQL (multi-database)
- JWT Authentication
- Bcrypt

**Frontend:**
- HTML5 + Bootstrap 5
- Vanilla JavaScript
- SortableJS (drag-drop)

## 🆘 Destek

Sorun yaşarsanız [Issue](../../issues) açın.

## 📄 Lisans

MIT License
