const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../config/db');
const multer = require('multer');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/upload');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// GET - Tampilkan form
router.get('/', (req, res) => {
  const success = req.query.success;
  res.render('pages/unggah_dokumen', {
    title: 'Unggah Dokumen KP',
    success
  });
});

// POST - Simpan ke DB
router.post('/', upload.fields([
  { name: 'surat_keterangan' },
  { name: 'tanda_terima' },
  { name: 'nilai_pembimbing' },
  { name: 'laporan_harian' }
]), (req, res) => {
  const files = req.files;

  const surat_keterangan = files?.surat_keterangan?.[0]?.filename || null;
  const tanda_terima = files?.tanda_terima?.[0]?.filename || null;
  const nilai_pembimbing = files?.nilai_pembimbing?.[0]?.filename || null;
  const laporan_harian = files?.laporan_harian?.[0]?.filename || null;

  const sql = `
    INSERT INTO dokumen_kp 
    (surat_keterangan, tanda_terima, nilai_pembimbing, laporan_harian) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [surat_keterangan, tanda_terima, nilai_pembimbing, laporan_harian], (err) => {
    if (err) {
      console.error('Gagal simpan dokumen:', err);
      return res.status(500).send('Gagal unggah dokumen.');
    }
    res.redirect('/unggah_dokumen?success=1');
  });
});

module.exports = router;
