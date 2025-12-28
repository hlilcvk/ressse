// DEBUG MODE ENABLED - v2.1
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { masterPool } = require('../db');

const router = express.Router();

/**
 * POST /api/auth/login
 * Kullanıcı girişi (İşletme veya Super Admin)
 */
router.post('/login', async (req, res) => {
  try {
    const { kullanici_adi, sifre } = req.body;

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Kullanıcı adı:', kullanici_adi);
    console.log('Şifre uzunluğu:', sifre ? sifre.length : 0);

    if (!kullanici_adi || !sifre) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kullanıcı adı ve şifre gerekli' 
      });
    }

    // Master DB'den kullanıcı bilgilerini çek
    const result = await masterPool.query(
      `SELECT id, isletme_id, kullanici_adi, ad_soyad, sifre, bagli_tablo_adi, 
              is_super_admin, db_host, db_port, db_name, db_user, db_password
       FROM admin_users 
       WHERE kullanici_adi = $1`,
      [kullanici_adi]
    );

    console.log('Database sorgu sonucu:', result.rows.length, 'satır');

    if (result.rows.length === 0) {
      console.log('❌ Kullanıcı bulunamadı');
      return res.status(401).json({ 
        success: false, 
        message: 'Kullanıcı adı veya şifre hatalı' 
      });
    }

    const user = result.rows[0];
    console.log('✅ Kullanıcı bulundu:', user.kullanici_adi);
    console.log('Hash (ilk 30 karakter):', user.sifre ? user.sifre.substring(0, 30) : 'null');

    // Şifre kontrolü
    console.log('Bcrypt karşılaştırma başlıyor...');
    const isPasswordValid = await bcrypt.compare(sifre, user.sifre);
    console.log('Bcrypt sonucu:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Şifre yanlış');
      return res.status(401).json({ 
        success: false, 
        message: 'Kullanıcı adı veya şifre hatalı' 
      });
    }

    console.log('✅ Giriş başarılı!');

    // JWT Token oluştur
    const tokenPayload = {
      isletme_id: user.isletme_id,
      kullanici_adi: user.kullanici_adi,
      ad_soyad: user.ad_soyad,
      bagli_tablo_adi: user.bagli_tablo_adi,
      is_super_admin: user.is_super_admin || false,
      db_config: {
        host: user.db_host,
        port: user.db_port,
        database: user.db_name,
        user: user.db_user,
        password: user.db_password
      }
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    res.json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        isletme_id: user.isletme_id,
        kullanici_adi: user.kullanici_adi,
        ad_soyad: user.ad_soyad,
        is_super_admin: user.is_super_admin || false
      }
    });

  } catch (error) {
    console.error('❌ Login hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
});

/**
 * POST /api/auth/verify
 * Token doğrulama (Frontend'den kontrol için)
 */
router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token bulunamadı' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token geçersiz' });
    }

    res.json({ 
      success: true, 
      user: {
        isletme_id: decoded.isletme_id,
        kullanici_adi: decoded.kullanici_adi,
        ad_soyad: decoded.ad_soyad,
        is_super_admin: decoded.is_super_admin || false
      }
    });
  });
});

module.exports = router;
