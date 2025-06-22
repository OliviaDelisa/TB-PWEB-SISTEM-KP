const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Setup penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/upload');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// GET - Tampilkan halaman + data dari DB
// GET - Tampilkan halaman + data dari DB
router.get('/', (req, res) => {
  db.query('SELECT * FROM absensi ORDER BY tanggal DESC', (err, results) => {
    if (err) throw err;
    
    res.render('pages/absensi_mahasiswa', {
      data: results,
      title: 'Absensi Mahasiswa' // untuk layout <title>
    });
  });
});


// POST - Upload file dan simpan absensi
router.post('/upload', upload.single('bukti'), (req, res) => {
  const { pertemuan } = req.body;
  const bukti = req.file ? req.file.filename : null;

  const sql = 'INSERT INTO absensi (pertemuan, bukti) VALUES (?, ?)';
  db.query(sql, [pertemuan, bukti], (err) => {
    if (err) throw err;
    res.redirect('/absensi_mahasiswa');
  });
});




// Bagian ini WAJIB agar file ini bisa digunakan di server.js
module.exports = router;
