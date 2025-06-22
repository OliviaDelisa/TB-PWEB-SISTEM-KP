const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Halaman form pengajuan
router.get('/pengajuan_dosen_pengganti', (req, res) => {
  const query = 'SELECT id AS id_dosen, nama AS nama_dosen FROM dosen';

  db.query(query, (err, results) => {
    if (err) {
      console.error(' Gagal mengambil data dosen:', err);
      return res.status(500).send('Gagal mengambil data dosen.');
    }

    res.render('pages/pengajuan_dosen_pengganti', {
      layout: 'layouts/main',
      title: 'Pengajuan Pergantian Dosen',
      customCss: '/upload/upload_dokumen_pengajuan_kp.css',
      dosenList: results
    });
  });
});

// Handle POST dari form
router.post('/pengajuan/ganti-dosen', (req, res) => {
  const { dosen_saat_ini, alasan, status } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.redirect('/login_mahasiswa');
  }

  // 1. Ambil mahasiswa_id dari tabel mahasiswa berdasarkan user_id
  const getMahasiswaIdQuery = `SELECT id FROM mahasiswa WHERE user_id = ?`;
  db.query(getMahasiswaIdQuery, [userId], (err, rows) => {
    if (err || rows.length === 0) {
      console.error('Gagal ambil mahasiswa_id:', err);
      return res.status(500).send('Mahasiswa tidak ditemukan.');
    }

    const mahasiswaId = rows[0].id;

    // 2. Cek pembimbing_kp berdasarkan mahasiswa_id
    const cekPembimbing = `SELECT id FROM pembimbing_kp WHERE mahasiswa_id = ? AND dosen_id = ?`;
    db.query(cekPembimbing, [mahasiswaId, dosen_saat_ini], (err, results) => {
      if (err) {
        console.error('Gagal cek pembimbing:', err);
        return res.status(500).send('Terjadi kesalahan saat cek pembimbing.');
      }

      if (results.length === 0) {
        return res.status(400).send('Pembimbing tidak ditemukan untuk mahasiswa ini.');
      }

      const pembimbing_kp_id = results[0].id;

      const insertQuery = `
        INSERT INTO pengajuan_pergantian_dosen (pembimbing_kp_id, alasan, status)
        VALUES (?, ?, ?)
      `;

      db.query(insertQuery, [pembimbing_kp_id, alasan, status], (err) => {
        if (err) {
          console.error('Gagal insert pengajuan:', err);
          return res.status(500).send('Gagal mengajukan pergantian.');
        }

        res.redirect('/pengajuan_dosen_pengganti?berhasil=true');
      });
    });
  });
});

module.exports = router;
