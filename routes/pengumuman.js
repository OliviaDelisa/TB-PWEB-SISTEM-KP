const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const query = `
    SELECT id, judul, tanggal_tayang, kategori
    FROM pengumuman
    ORDER BY tanggal_tayang DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Gagal mengambil data pengumuman:', err);
      return res.status(500).send('Gagal mengambil data pengumuman');
    }

    res.render('pages/pengumuman', {
      layout: 'layout/main',
      title: 'Daftar Pengumuman',
      customCss: '/upload/pengumuman.css', 
      pengumuman: results
    });
  });
});


router.post('/tambah', (req, res) => {
  const { judul, isi, kategori, tanggal_tayang, tanggal_berakhir } = req.body;

  const query = `
    INSERT INTO pengumuman (judul, isi, kategori, tanggal_tayang, tanggal_berakhir)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [judul, isi, kategori, tanggal_tayang, tanggal_berakhir], (err, result) => {
    if (err) {
      console.error('Gagal menambahkan pengumuman:', err);
      return res.status(500).send('Gagal menyimpan data');
    }
    res.redirect('/pengumuman'); // arahkan ke halaman daftar pengumuman
  });
});

// Tampilkan form edit
router.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM pengumuman WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Gagal mengambil data:', err);
      return res.status(500).send('Gagal mengambil data pengumuman');
    }

    if (results.length === 0) {
      return res.status(404).send('Pengumuman tidak ditemukan');
    }

   res.render('pages/editPengumuman', {
   layout:'layout/main',
   title: 'Edit Pengumuman',
   customCss: '/upload/editPengumuman.css',
   pengumuman: results[0]
   });

  });
});

// Proses update pengumuman
router.post('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { judul, isi, kategori, tanggal_tayang, tanggal_berakhir } = req.body;

  const query = `
    UPDATE pengumuman 
    SET judul = ?, isi = ?, kategori = ?, tanggal_tayang = ?, tanggal_berakhir = ?
    WHERE id = ?
  `;

  db.query(query, [judul, isi, kategori, tanggal_tayang, tanggal_berakhir, id], (err, result) => {
    if (err) {
      console.error('Gagal mengupdate pengumuman:', err);
      return res.status(500).send('Gagal mengupdate data');
    }

    res.redirect('/pengumuman');
  });
});

module.exports = router;