const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Halaman Persetujuan KP
router.get('/', (req, res) => {
  const query = `
    SELECT pk.id, m.nim, m.nama
    FROM pengajuan_kp pk
    JOIN mahasiswa m ON pk.mahasiswa_id = m.id
    WHERE pk.status = 'diproses'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Gagal mengambil data pengajuan KP:', err.sqlMessage || err.message);
      return res.status(500).send('Terjadi kesalahan saat mengambil data.');
    }

    res.render('pages/persetujuan_kp', {
    title: 'Persetujuan KP',
    layout: false,
    data: results
  });
  });
});

module.exports = router;
