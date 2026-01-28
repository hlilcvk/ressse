const express = require('express');
const { masterPool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Randevuları listele
router.get('/', async (req, res) => {
  try {
    const { bagli_tablo_adi } = req.user;
    
    if (!bagli_tablo_adi) {
      return res.status(400).json({ success: false, message: 'Bağlı tablo bulunamadı' });
    }

    const { start, end } = req.query;
    
    let query = `SELECT * FROM ${bagli_tablo_adi}`;
    const params = [];
    
    if (start && end) {
      query += ' WHERE baslangic_saati >= $1 AND baslangic_saati <= $2';
      params.push(start, end);
    }
    
    query += ' ORDER BY baslangic_saati';

    const result = await masterPool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Randevu ekle
router.post('/', async (req, res) => {
  try {
    const { bagli_tablo_adi } = req.user;
    
    if (!bagli_tablo_adi) {
      return res.status(400).json({ success: false, message: 'Bağlı tablo bulunamadı' });
    }

    const { musteri_adi, telefon_no, islem_turu, uzman, baslangic_saati, bitis_saati, notlar } = req.body;

    const result = await masterPool.query(`
      INSERT INTO ${bagli_tablo_adi} 
      (musteri_adi, telefon_no, islem_turu, uzman, baslangic_saati, bitis_saati, notlar)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [musteri_adi, telefon_no, islem_turu, uzman, baslangic_saati, bitis_saati, notlar]);

    res.json({ success: true, data: result.rows[0], message: 'Randevu oluşturuldu' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Randevu güncelle
router.put('/:id', async (req, res) => {
  try {
    const { bagli_tablo_adi } = req.user;
    
    if (!bagli_tablo_adi) {
      return res.status(400).json({ success: false, message: 'Bağlı tablo bulunamadı' });
    }

    const { musteri_adi, telefon_no, islem_turu, uzman, baslangic_saati, bitis_saati, notlar } = req.body;

    const result = await masterPool.query(`
      UPDATE ${bagli_tablo_adi}
      SET musteri_adi = $1, telefon_no = $2, islem_turu = $3, uzman = $4,
          baslangic_saati = $5, bitis_saati = $6, notlar = $7
      WHERE id = $8
      RETURNING *
    `, [musteri_adi, telefon_no, islem_turu, uzman, baslangic_saati, bitis_saati, notlar, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Randevu bulunamadı' });
    }

    res.json({ success: true, data: result.rows[0], message: 'Randevu güncellendi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Randevu sil
router.delete('/:id', async (req, res) => {
  try {
    const { bagli_tablo_adi } = req.user;
    
    if (!bagli_tablo_adi) {
      return res.status(400).json({ success: false, message: 'Bağlı tablo bulunamadı' });
    }

    await masterPool.query(
      `DELETE FROM ${bagli_tablo_adi} WHERE id = $1`,
      [req.params.id]
    );

    res.json({ success: true, message: 'Randevu silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Uzmanları getir
router.get('/uzmanlar', async (req, res) => {
  try {
    const { isletme_id } = req.user;
    
    const result = await masterPool.query(
      'SELECT id, oda_adi, is_active FROM calisma_odalari WHERE isletme_id = $1 ORDER BY oda_adi',
      [isletme_id]
    );
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Uzman ekle
router.post('/uzman', async (req, res) => {
  try {
    const { isletme_id } = req.user;
    const { oda_adi } = req.body;

    if (!oda_adi || !oda_adi.trim()) {
      return res.status(400).json({ success: false, message: 'Uzman adı gereklidir' });
    }

    await masterPool.query(
      'INSERT INTO calisma_odalari (isletme_id, oda_adi, is_active) VALUES ($1, $2, true)',
      [isletme_id, oda_adi.trim()]
    );

    res.json({ success: true, message: 'Uzman eklendi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Uzman güncelle (aktif/pasif)
router.put('/uzman/:id', async (req, res) => {
  try {
    const { isletme_id } = req.user;
    const { id } = req.params;
    const { is_active } = req.body;

    await masterPool.query(
      'UPDATE calisma_odalari SET is_active = $1 WHERE id = $2 AND isletme_id = $3',
      [is_active, id, isletme_id]
    );

    res.json({ success: true, message: 'Uzman güncellendi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Uzman sil
router.delete('/uzman/:id', async (req, res) => {
  const client = await masterPool.connect();
  try {
    await client.query('BEGIN');

    const { isletme_id, bagli_tablo_adi } = req.user;
    const { id } = req.params;

    // Uzman adını al
    const uzmanResult = await client.query(
      'SELECT oda_adi FROM calisma_odalari WHERE id = $1 AND isletme_id = $2',
      [id, isletme_id]
    );

    if (uzmanResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Uzman bulunamadı' });
    }

    const uzmanAdi = uzmanResult.rows[0].oda_adi;

    // Bu uzmana ait randevuları sil
    if (bagli_tablo_adi) {
      await client.query(
        `DELETE FROM ${bagli_tablo_adi} WHERE uzman = $1`,
        [uzmanAdi]
      );
    }

    // Uzmanı sil
    await client.query(
      'DELETE FROM calisma_odalari WHERE id = $1 AND isletme_id = $2',
      [id, isletme_id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Uzman silindi' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
