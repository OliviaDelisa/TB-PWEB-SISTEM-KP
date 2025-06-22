const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config/db'); // Pastikan path benar

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/upload_dokumen'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });


// Route untuk handle upload
router.post('/upload', upload.single('file'), async (req, res) => {
  const judul = req.body.judul;
  const file = req.file;

  const userId = req.session.user?.id;
  
  if (!file) {
    return res.status(400).send('Tidak ada file yang diupload.');
  }

  try {
    await db.execute('INSERT INTO dokumen_pendukung (judul, nama_file, user_id) VALUES (?, ?, ?)', [judul, file.filename, userId]);
    res.redirect('/uploadDokumen?success=true');
  } catch (err) {
    console.error('Gagal simpan ke database:', err);
    res.status(500).send('Gagal simpan ke database.');
  }
});

module.exports = router;
