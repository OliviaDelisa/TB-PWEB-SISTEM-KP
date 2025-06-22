const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET halaman penilaian, ambil mahasiswa terakhir di DB
router.get('/', (req, res) => {
  const queryMahasiswa = `SELECT id, nama, nim FROM mahasiswa ORDER BY id DESC LIMIT 1`;

  db.query(queryMahasiswa, (err, result) => {
    if (err) {
      console.error('Error ambil mahasiswa:', err);
      return res.status(500).send('Gagal mengambil data mahasiswa');
    }
    if (result.length === 0) {
      return res.status(404).send('Data mahasiswa tidak ditemukan');
    }

    const mahasiswa = result[0];

    const queryPenilaian = `SELECT * FROM penilaian_kp WHERE id_mahasiswa = ?`;
    db.query(queryPenilaian, [mahasiswa.id], (err2, penilaian) => {
      if (err2) {
        console.error('Error ambil penilaian:', err2);
        return res.status(500).send('Gagal mengambil data penilaian');
      }

      res.render('pages/penilaian_kp', {
        title: 'Penilaian KP',
        layout: 'layouts/main',
        mahasiswa,
        penilaian,
      });
    });
  });
});

// POST tambah penilaian
router.post('/tambah', (req, res) => {
  const { kategori, persentase, nilai, id_mahasiswa } = req.body;

  if (!id_mahasiswa) {
    return res.status(400).json({ error: 'ID mahasiswa diperlukan' });
  }

  const sql = `
    INSERT INTO penilaian_kp (id_mahasiswa, kategori, persentase, nilai)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [id_mahasiswa, kategori, persentase, nilai], (err, result) => {
    if (err) {
      console.error('Error tambah penilaian:', err);
      return res.status(500).json({ error: err });
    }
    res.json({ success: true, insertedId: result.insertId });
  });
});

// POST edit nilai
router.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const { nilai } = req.body;

  const sql = 'UPDATE penilaian_kp SET nilai = ? WHERE id = ?';

  db.query(sql, [nilai, id], (err) => {
    if (err) {
      console.error('Error update nilai:', err);
      return res.status(500).json({ error: err });
    }
    res.json({ success: true });
  });
});

// DELETE hapus penilaian
router.delete('/hapus/:id', (req, res) => {
  const id = req.params.id;

  const sql = 'DELETE FROM penilaian_kp WHERE id = ?';

  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Error hapus penilaian:', err);
      return res.status(500).json({ error: err });
    }
    res.json({ success: true });
  });
});

module.exports = router;
