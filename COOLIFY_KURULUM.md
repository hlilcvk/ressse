# 🚀 COOLIFY KURULUM TALİMATLARI

## ⚠️ ÖNEMLİ: Bu Dosyaları GitHub'a Yükleyin

### Adım 1: GitHub Repository Oluşturun

1. **GitHub.com** → Giriş yapın
2. Sağ üstte **"+"** → **"New repository"**
3. Repository name: `randevu-sistem`
4. **Public** seçin
5. **"Create repository"** tıklayın

### Adım 2: Dosyaları Yükleyin

Repository oluştuktan sonra:

1. **"uploading an existing file"** linkine tıklayın
2. Bu ZIP'teki **TÜM DOSYALARI** sürükleyip bırakın:
   - backend/ (klasör)
   - frontend/ (klasör)
   - docker-compose.yml
   - .coolify
   - .env.example
   - .gitignore
   - README.md

3. En altta **"Commit changes"** tıklayın

### Adım 3: Coolify'da Deploy

1. Coolify Dashboard → **"+ Add"**
2. **"Application"** seçin
3. **"Public Repository"** seçin
4. **Repository URL** alanına GitHub repository URL'nizi yapıştırın
   - Örnek: `https://github.com/KULLANICI_ADINIZ/randevu-sistem`
5. **Branch**: `main`
6. **Build Pack**: Otomatik seçilecek (Docker Compose)
7. **"Save"** ve **"Deploy"**

### Adım 4: Port Ayarları (Coolify'da)

Deploy edildikten sonra:

1. Application → **"Configuration"** sekmesi
2. **Ports** bölümü:
   - Port 80 → Frontend için domain ekleyin
   - Port 3000 → Backend API için domain ekleyin

### Adım 5: Test Edin

**Frontend:** `http://your-domain` veya `http://sunucu-ip`

**Giriş:**
- Kullanıcı: `superadmin`
- Şifre: `Admin123!`

---

## 🆘 Sorun Giderme

### "Dockerfile not found" Hatası
- `.coolify` dosyası yüklü mü kontrol edin
- Coolify'da "Build Pack" ayarını kontrol edin

### "No such file or directory"
- Tüm klasörleri (backend/, frontend/) yüklediğinizden emin olun
- Dosya yapısı şöyle olmalı:
  ```
  repository-root/
  ├── backend/
  │   ├── Dockerfile
  │   ├── server.js
  │   └── ...
  ├── frontend/
  │   ├── Dockerfile
  │   └── ...
  ├── docker-compose.yml
  └── .coolify
  ```

### GitHub'a Yükleme Yapamıyorum
1. GitHub Desktop kullanın: https://desktop.github.com/
2. VEYA web arayüzünden tek tek yükleyin

---

## 📞 Yardım

GitHub repository URL'nizi bana gönderin, kontrol edeyim!
