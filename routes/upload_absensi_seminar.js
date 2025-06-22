const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Setup penyimpanan file absensi ke folder uploads_dokumen
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads_dokumen'),
  filename: (req, file, cb) =>
    cb(null, `absensi_seminar_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// GET /absensi_seminar → tampilkan halaman form upload
router.get('/absensi_seminar', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  db.query(`
    SELECT sk.absensi_seminar, sk.nama_file_absensi 
    FROM seminar_kp sk
    JOIN mahasiswa m ON m.id = sk.mahasiswa_id
    WHERE m.user_id = ?
    ORDER BY sk.id DESC LIMIT 1
  `, [user.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Terjadi kesalahan saat mengambil data absensi.");
    }

    const fileAbsensi = results[0]?.absensi_seminar || null;
    const namaFileAbsensi = results[0]?.nama_file_absensi || null;
    const message = req.flash('message')[0];

    res.render('pages/absensi_seminar', {
  layout: 'layouts/main',
  title: 'Absensi Seminar',
  customCss: '/upload/upload_dokumen_pengajuan_kp.css',
  user,
  fileAbsensi,
  namaFileAbsensi,
  message
});

    });
  });


// POST /upload_absensi_seminar → proses unggah file
router.post('/upload_absensi_seminar', upload.single('file_absensi'), (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  const file = req.file;
  if (!file) {
    req.flash('message', 'File tidak ditemukan.');
    return res.redirect('/absensi_seminar');
  }

  db.query('SELECT id FROM mahasiswa WHERE user_id = ?', [user.id], (err, rows) => {
    if (err || rows.length === 0) {
      req.flash('message', 'Data mahasiswa tidak ditemukan.');
      return res.redirect('/absensi_seminar');
    }

    const mahasiswaId = rows[0].id;
    const sql = `
      UPDATE seminar_kp
      SET absensi_seminar = ?, nama_file_absensi = ?
      WHERE mahasiswa_id = ?
      ORDER BY id DESC
      LIMIT 1
    `;

    db.query(sql, [file.filename, file.originalname, mahasiswaId], (err2) => {
      if (err2) {
        console.error('Gagal menyimpan absensi:', err2);
        req.flash('message', 'Gagal menyimpan file absensi.');
        return res.redirect('/absensi_seminar');
      }

      req.flash('message', 'Upload absensi berhasil!');
      res.redirect('/absensi_seminar');
    });
  });
});

module.exports = router;
