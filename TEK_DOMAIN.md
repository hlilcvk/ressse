# ✅ TEK DOMAIN - HER ŞEY BİR ARADA

## 🎯 Nasıl Çalışır?

Sistem artık **TEK DOMAIN** üzerinden çalışır:

```
https://randevu.yourdomain.com/          → Frontend (login, dashboard, admin)
https://randevu.yourdomain.com/api/...   → Backend API (Nginx proxy)
```

## 🔧 Nginx Proxy

Frontend'in Nginx'i, `/api` ile başlayan tüm istekleri backend container'a yönlendirir.

**Avantajları:**
- ✅ Tek domain yeterli
- ✅ CORS sorunu yok
- ✅ Daha basit SSL/TLS yönetimi
- ✅ Coolify'da sadece port 80'i expose etmeniz yeterli

## 📱 Coolify'da Kurulum

### Sadece Frontend Port'unu Açın

1. Coolify'da application'ınıza gidin
2. **Domains** sekmesi
3. Sadece **Port 80** için domain ekleyin:
   ```
   randevu.yourdomain.com → Port 80
   ```

Backend için ayrı domain/port eklemeyin!

## 🧪 Test

### Frontend:
```
https://randevu.yourdomain.com
```

### Backend API (proxy üzerinden):
```
https://randevu.yourdomain.com/health
https://randevu.yourdomain.com/api/auth/login
```

## 🔒 Production'da SSL

Coolify otomatik SSL sertifikası ekler. Tek domain olduğu için çok daha basit!

## 📝 Not

Port 3000'i artık **dışarıya açmanıza gerek yok**. Backend sadece Docker network içinde çalışır.
