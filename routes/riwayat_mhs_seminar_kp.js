const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const query = `
    SELECT m.nim, m.nama, 
           DATE_FORMAT(s.jadwal_seminar, "%d/%m/%Y") AS tanggal, 
           s.judul_laporan
    FROM seminar_kp s
    JOIN mahasiswa m ON s.mahasiswa_id = m.id
    WHERE s.status = 'dijadwalkan'
    ORDER BY s.jadwal_seminar DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Gagal mengambil data seminar KP:', err.message);
      return res.status(500).send('Terjadi kesalahan saat mengambil data seminar KP: ' + err.message);
    }

    res.render('pages/riwayat_mhs_seminar_kp', {
    title: 'Riwayat Seminar KP',
    layout: 'layouts/main',
    seminarList: results
    });

  });
});

module.exports = router;
