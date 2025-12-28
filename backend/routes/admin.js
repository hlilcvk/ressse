const express = require('express');
const bcrypt = require('bcrypt');
const { masterPool } = require('../db');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken, requireSuperAdmin);

// İşletmeleri listele
router.get('/isletmeler', async (req, res) => {
  try {
    const result = await masterPool.query(`
      SELECT 
        u.id, u.isletme_id, u.kullanici_adi, u.ad_soyad, 
        u.bagli_tablo_adi, u.created_at,
        COUNT(o.id) as uzman_sayisi
      FROM admin_users u
      LEFT JOIN calisma_odalari o ON u.isletme_id = o.isletme_id
      WHERE u.is_super_admin = false
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Yeni işletme ekle
router.post('/isletme', async (req, res) => {
  const client = await masterPool.connect();
  try {
    await client.query('BEGIN');

    const { isletme_id, kullanici_adi, ad_soyad, sifre, bagli_tablo_adi, uzmanlar } = req.body;

    // Şifre hash
    const hashedPassword = await bcrypt.hash(sifre, 10);

    // 1. İşletme ekle
    await client.query(`
      INSERT INTO admin_users (isletme_id, kullanici_adi, ad_soyad, sifre, bagli_tablo_adi, is_super_admin)
      VALUES ($1, $2, $3, $4, $5, false)
    `, [isletme_id, kullanici_adi, ad_soyad, hashedPassword, bagli_tablo_adi]);

    // 2. Randevu tablosu oluştur
    await client.query(`
      CREATE TABLE ${bagli_tablo_adi} (
        id SERIAL PRIMARY KEY,
        musteri_adi VARCHAR(200) NOT NULL,
        telefon_no VARCHAR(20),
        islem_turu VARCHAR(100),
        uzman VARCHAR(100) NOT NULL,
        baslangic_saati TIMESTAMP NOT NULL,
        bitis_saati TIMESTAMP NOT NULL,
        notlar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX idx_${bagli_tablo_adi}_tarih ON ${bagli_tablo_adi}(baslangic_saati)
    `);

    // 3. Uzmanları ekle
    if (uzmanlar && uzmanlar.length > 0) {
      for (const uzman of uzmanlar) {
        await client.query(
          'INSERT INTO calisma_odalari (isletme_id, oda_adi) VALUES ($1, $2)',
          [isletme_id, uzman.trim()]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'İşletme oluşturuldu' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// İşletme sil
router.delete('/isletme/:id', async (req, res) => {
  const client = await masterPool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'SELECT bagli_tablo_adi FROM admin_users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length > 0) {
      const tablo = result.rows[0].bagli_tablo_adi;
      if (tablo) {
        await client.query(`DROP TABLE IF EXISTS ${tablo}`);
      }
    }

    await client.query('DELETE FROM admin_users WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');

    res.json({ success: true, message: 'İşletme silindi' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// Uzmanları getir
router.get('/uzmanlar/:isletme_id', async (req, res) => {
  try {
    const result = await masterPool.query(
      'SELECT id, oda_adi FROM calisma_odalari WHERE isletme_id = $1 AND aktif = true ORDER BY oda_adi',
      [req.params.isletme_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
