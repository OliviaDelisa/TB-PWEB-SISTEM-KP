const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Setup penyimpanan file ke folder uploads_dokumen
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads_dokumen'),
  filename: (req, file, cb) =>
    cb(null, `laporan_akhir_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// GET /laporan_akhir
router.get('/laporan_akhir', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  db.query(`
    SELECT dk.laporan_akhir, dk.nama_file_laporan_akhir 
    FROM dokumen_kp dk
    JOIN mahasiswa m ON m.id = dk.id
    WHERE m.user_id = ?
    ORDER BY dk.id DESC LIMIT 1
  `, [user.id], (err, results) => {
    if (err) return res.send("Gagal ambil data.");

    const laporanAkhir = results[0]?.laporan_akhir || null;
    const namaFileLaporan = results[0]?.nama_file_laporan_akhir || null;
    const message = req.flash('message')[0];

    res.render('pages/upload_laporan_akhir', {

      layout: 'layouts/main',
      title: 'Upload Laporan Akhir',
      customCss: '/upload/upload_dokumen_pengajuan_kp.css',
      user,
      laporanAkhir,
      namaFileLaporan,
      message
    });
  });
});

// POST /upload_laporan_akhir
router.post('/upload_laporan_akhir', upload.single('file_laporan'), (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  const file = req.file;
  if (!file) {
    req.flash('message', 'File tidak ditemukan.');
    return res.redirect('/laporan_akhir');
  }

  db.query('SELECT id FROM mahasiswa WHERE user_id = ?', [user.id], (err, rows) => {
    if (err || rows.length === 0) {
      req.flash('message', 'Mahasiswa tidak ditemukan.');
      return res.redirect('/laporan_akhir');
    }

    const mahasiswaId = rows[0].id;

    db.query('SELECT id FROM dokumen_kp WHERE id = ?', [mahasiswaId], (err2, rows2) => {
      if (err2) {
        req.flash('message', 'Gagal cek data.');
        return res.redirect('/laporan_akhir');
      }

      if (rows2.length > 0) {
        // Update jika sudah ada
        db.query(`
          UPDATE dokumen_kp
          SET laporan_akhir = ?, nama_file_laporan_akhir = ?
          WHERE id = ?
        `, [file.filename, file.originalname, mahasiswaId], (err3) => {
          if (err3) {
            req.flash('message', 'Gagal update file.');
          } else {
            req.flash('message', 'Upload berhasil!');
          }
          res.redirect('/laporan_akhir');
        });
      } else {
        // Insert jika belum ada
        db.query(`
          INSERT INTO dokumen_kp (id, laporan_akhir, nama_file_laporan_akhir)
          VALUES (?, ?, ?)
        `, [mahasiswaId, file.filename, file.originalname], (err4) => {
          if (err4) {
            req.flash('message', 'Gagal insert file.');
          } else {
            req.flash('message', 'Upload berhasil!');
          }
          res.redirect('/laporan_akhir');
        });
      }
    });
  });
});

module.exports = router;
