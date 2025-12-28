# 🗓️ Randevu Yönetim Sistemi v2.0

Modern, tam özellikli randevu yönetim sistemi

## ✨ Özellikler

✅ **Super Admin Paneli** - İşletme ekleme (sadece tablo + uzmanlar)
✅ **FullCalendar** - Modern takvim görünümü
✅ **Saate Tıkla** - Direkt randevu ekleme
✅ **Drag & Drop** - Randevu sürükle bırak
✅ **Uzman Yönetimi** - Her işletme kendi uzmanları
✅ **Şifre Kontrolü** - Bcrypt hash
✅ **JWT Auth** - Güvenli oturum
✅ **Responsive** - Mobil uyumlu

## 🚀 Coolify'da Deployment

### 1. GitHub'a Yükleyin

Tüm dosyaları GitHub repository'nize yükleyin.

### 2. Coolify'da Yeni Application

- **"+ Add"** → **"Application"**
- **"Public Repository"** seçin
- Repository URL'nizi girin
- Branch: `main`
- Build Type: **Docker Compose**

### 3. Environment Variables

Coolify'da şu değişkenleri ekleyin:

```
DB_HOST=72.62.90.122
DB_PORT=5433
DB_NAME=randevu_master
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=super-gizli-anahtar-2024-degistir
```

### 4. Deploy!

**Deploy** butonuna tıklayın. 2-3 dakika içinde hazır!

## 🎯 İlk Giriş

```
URL: https://your-domain.com
Kullanıcı: superadmin
Şifre: Admin123!
```

## 📊 Kullanım

### Super Admin:
1. Giriş yap
2. **"Yeni İşletme"** tıkla
3. Tablo adı + uzmanları gir
4. Kaydet

### İşletme:
1. Kullanıcı adı + şifre ile giriş
2. Takvimde **saate tıkla** → Randevu ekle
3. Randevuları **sürükle** → Taşı/Düzenle

## 🔧 Teknik Stack

**Backend:**
- Node.js + Express
- PostgreSQL (tek database, multi-table)
- JWT + Bcrypt
- RESTful API

**Frontend:**
- Vanilla JS
- Bootstrap 5
- FullCalendar 6

**DevOps:**
- Docker + Docker Compose
- Nginx (reverse proxy)
- Supervisor (process manager)

## 📝 Database Yapısı

```
randevu_master (database)
├── admin_users (tüm kullanıcılar)
├── calisma_odalari (uzmanlar)
├── guzellik_randevular (örnek)
├── berber_randevular (işletme ekledikçe)
└── ...
```

## 🆘 Sorun Giderme

**Backend bağlanamıyor:**
- Environment variables doğru mu?
- PostgreSQL port açık mı?

**Şifre çalışmıyor:**
- Bcrypt hash doğru mu?
- Database'de uzunluk 60 mu?

**Takvim yüklenmiyor:**
- Browser console'a bakın
- API isteği 401 mi?

## 📄 Lisans

MIT License

---

**Geliştirici:** Claude AI 🤖
**Versiyon:** 2.0
**Tarih:** 2024-12-28
