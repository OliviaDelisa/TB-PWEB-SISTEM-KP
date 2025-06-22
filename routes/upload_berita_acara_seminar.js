const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Setup penyimpanan file ke folder public/uploads_dokumen
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads_dokumen'),
  filename: (req, file, cb) =>
    cb(null, `berita_acara_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// GET /berita_acara_seminar → tampilkan halaman form
router.get('/berita_acara_seminar', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  db.query(
    `SELECT sk.berita_acara, sk.nama_file_berita_acara FROM seminar_kp sk
     JOIN mahasiswa m ON m.id = sk.mahasiswa_id
     WHERE m.user_id = ? ORDER BY sk.id DESC LIMIT 1`,
    [user.id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.send("Terjadi kesalahan saat mengambil data seminar.");
      }

      const fileBeritaAcara = results.length > 0 ? results[0].berita_acara : null;
      const namaFileBeritaAcara = results.length > 0 ? results[0].nama_file_berita_acara : null;
      const message = req.flash('message')[0];

      res.render('pages/berita_acara_seminar', {
        layout: 'layouts/main',
        title: 'Berita Acara Seminar',
        customCss: '/upload/upload_dokumen_pengajuan_kp.css',
        user,
        fileBeritaAcara,
        namaFileBeritaAcara,
        message
      });
    }
  );
});

// POST /upload_berita_acara → proses unggah file
router.post('/upload_berita_acara', upload.single('file_berita_acara'), (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  const file = req.file;
  if (!file) {
    req.flash('message', 'File tidak ditemukan.');
    return res.redirect('/upload_berita_acara');
  }

  db.query('SELECT id FROM mahasiswa WHERE user_id = ?', [user.id], (err, rows) => {
    if (err || rows.length === 0) {
      req.flash('message', 'Data mahasiswa tidak ditemukan.');
      return res.redirect('/upload_berita_acara');
    }

    const mahasiswaId = rows[0].id;

    const sql = `
      UPDATE seminar_kp 
      SET berita_acara = ?, nama_file_berita_acara = ?
      WHERE mahasiswa_id = ? ORDER BY id DESC LIMIT 1
    `;

    db.query(sql, [file.filename, file.originalname, mahasiswaId], (err2) => {
      if (err2) {
        console.error('Gagal menyimpan berita acara:', err2);
        req.flash('message', 'Gagal menyimpan berita acara.');
        return res.redirect('/upload_berita_acara');
      }

      req.flash('message', 'Upload berhasil!');
      res.redirect('/berita_acara_seminar');
    });
  });
});

module.exports = router;
