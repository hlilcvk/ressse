const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { masterPool } = require('../db');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { kullanici_adi, sifre } = req.body;

    if (!kullanici_adi || !sifre) {
      return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli' });
    }

    const result = await masterPool.query(
      'SELECT * FROM admin_users WHERE kullanici_adi = $1',
      [kullanici_adi]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı' });
    }

    const user = result.rows[0];

    // Şifre kontrolü
    const isValid = await bcrypt.compare(sifre, user.sifre);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı' });
    }

    const token = jwt.sign({
      isletme_id: user.isletme_id,
      kullanici_adi: user.kullanici_adi,
      ad_soyad: user.ad_soyad,
      bagli_tablo_adi: user.bagli_tablo_adi,
      is_super_admin: user.is_super_admin
    }, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        isletme_id: user.isletme_id,
        kullanici_adi: user.kullanici_adi,
        ad_soyad: user.ad_soyad,
        is_super_admin: user.is_super_admin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Token verify
router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token yok' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token geçersiz' });
    }
    res.json({ success: true, user: decoded });
  });
});

module.exports = router;
