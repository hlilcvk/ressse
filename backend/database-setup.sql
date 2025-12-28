-- Admin kullanıcıları tablosu
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    isletme_id VARCHAR(50) NOT NULL UNIQUE,
    kullanici_adi VARCHAR(100) NOT NULL UNIQUE,
    ad_soyad VARCHAR(200) NOT NULL,
    sifre VARCHAR(255) NOT NULL,
    bagli_tablo_adi VARCHAR(100),
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_users_kullanici ON admin_users(kullanici_adi);

-- Uzmanlar/Odalar tablosu
CREATE TABLE IF NOT EXISTS calisma_odalari (
    id SERIAL PRIMARY KEY,
    isletme_id VARCHAR(50) NOT NULL,
    oda_adi VARCHAR(100) NOT NULL,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (isletme_id) REFERENCES admin_users(isletme_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calisma_odalari_isletme ON calisma_odalari(isletme_id);

-- Süper admin (şifre: Admin123!)
INSERT INTO admin_users (isletme_id, kullanici_adi, ad_soyad, sifre, is_super_admin)
VALUES ('SUPER_ADMIN', 'superadmin', 'Sistem Yöneticisi', 
'$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', true)
ON CONFLICT (kullanici_adi) DO NOTHING;

-- Test işletme: Güzellik Salonu
INSERT INTO admin_users (isletme_id, kullanici_adi, ad_soyad, sifre, bagli_tablo_adi, is_super_admin)
VALUES ('GUZELLIK_001', 'guzellik', 'Güzellik Salonu', 
'$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
'guzellik_randevular', false)
ON CONFLICT (kullanici_adi) DO NOTHING;

-- Güzellik salonu randevu tablosu
CREATE TABLE IF NOT EXISTS guzellik_randevular (
    id SERIAL PRIMARY KEY,
    musteri_adi VARCHAR(200) NOT NULL,
    telefon_no VARCHAR(20),
    islem_turu VARCHAR(100),
    uzman VARCHAR(100) NOT NULL,
    baslangic_saati TIMESTAMP NOT NULL,
    bitis_saati TIMESTAMP NOT NULL,
    notlar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guzellik_randevular_tarih ON guzellik_randevular(baslangic_saati);

-- Güzellik salonu uzmanları
INSERT INTO calisma_odalari (isletme_id, oda_adi)
VALUES 
('GUZELLIK_001', 'Ayşe Hanım'),
('GUZELLIK_001', 'Fatma Hanım'),
('GUZELLIK_001', 'Zeynep Hanım')
ON CONFLICT DO NOTHING;

-- Örnek randevular
INSERT INTO guzellik_randevular (musteri_adi, telefon_no, islem_turu, uzman, baslangic_saati, bitis_saati, notlar)
VALUES 
('Elif Yılmaz', '0532 111 2222', 'Manikür', 'Ayşe Hanım', '2024-12-29 10:00:00', '2024-12-29 11:00:00', 'İlk randevu'),
('Selin Demir', '0533 333 4444', 'Pedikür', 'Fatma Hanım', '2024-12-29 14:00:00', '2024-12-29 15:00:00', 'Düğün öncesi')
ON CONFLICT DO NOTHING;
