const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file laporan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads_dokumen/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = 'laporan_' + Date.now() + ext;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// =======================
// GET: Form Pendaftaran
// =======================
router.get('/pendaftaran_seminar_kp', (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.redirect('/login/mahasiswa');

  const query = `
    SELECT m.id AS mahasiswa_id, m.nama, m.nim, d.nama AS dosen_pembimbing,
           sk.status, sk.jadwal_seminar
    FROM mahasiswa m
    JOIN pembimbing_kp pk ON pk.mahasiswa_id = m.id
    JOIN dosen d ON pk.dosen_id = d.id
    LEFT JOIN seminar_kp sk ON sk.mahasiswa_id = m.id
    WHERE m.user_id = ?
    ORDER BY sk.id DESC
    LIMIT 1
  `;

  db.query(query, [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error('Gagal ambil data:', err);
      return res.status(500).send('Data tidak ditemukan');
    }

    const data = results[0];

    res.render('pages/pendaftaran_seminar_kp', {
      layout: 'layouts/main',
      title: 'Pendaftaran Seminar KP',
      customCss: '/upload/upload_dokumen_pengajuan_kp.css',
      mahasiswa: data,
      status: data.status,
      jadwal: data.jadwal_seminar,
      success: req.query.success === 'true'
    });
  });
});


// =======================
// POST: Simpan Data
// =======================
router.post('/submit_seminar', upload.single('laporan_kp'), (req, res) => {
  const userId = req.session.user?.id;
  const { judul_laporan } = req.body;

  if (!userId) {
    return res.redirect('/login/mahasiswa');
  }

  const fileName = req.file ? req.file.filename : null;

  const getMahasiswaId = `SELECT id FROM mahasiswa WHERE user_id = ?`;
  db.query(getMahasiswaId, [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error('Gagal ambil mahasiswa_id:', err);
      return res.status(500).send('Mahasiswa tidak ditemukan.');
    }

    const mahasiswaId = results[0].id;

    const insertQuery = `
      INSERT INTO seminar_kp (mahasiswa_id, judul_laporan, file_laporan, status)
      VALUES (?, ?, ?, 'diajukan')
    `;

    db.query(insertQuery, [mahasiswaId, judul_laporan, fileName], (err2) => {
      if (err2) {
        console.error('Gagal insert seminar:', err2);
        return res.status(500).send('Gagal mendaftar seminar.');
      }

      res.redirect('/pendaftaran_seminar_kp?success=true');
    });
  });
});

router.post('/batalkan_seminar_kp', (req, res) => {
  const userId = req.session.user?.id;

  if (!userId) {
    return res.redirect('/login/mahasiswa');
  }

  const getMahasiswaId = `SELECT id FROM mahasiswa WHERE user_id = ?`;
  db.query(getMahasiswaId, [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error('Gagal ambil mahasiswa_id untuk batal:', err);
      return res.status(500).send('Data tidak ditemukan');
    }

    const mahasiswaId = results[0].id;

    // Hanya bisa membatalkan jika belum dijadwalkan
    const deleteQuery = `
      DELETE FROM seminar_kp
      WHERE mahasiswa_id = ? AND status = 'diajukan'
    `;

    db.query(deleteQuery, [mahasiswaId], (err2) => {
      if (err2) {
        console.error('Gagal membatalkan seminar:', err2);
        return res.status(500).send('Gagal membatalkan pengajuan');
      }

      res.redirect('/pendaftaran_seminar_kp');
    });
  });
});


module.exports = router;
