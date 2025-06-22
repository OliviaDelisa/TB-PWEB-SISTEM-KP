const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads_dokumen/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Halaman upload dokumen
router.get('/', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  const formData = req.session.formPengajuan;
  const sudahIsiFormulir = !!formData;

  res.render('pages/upload_dokumen_pengajuan_kp', {
    layout: 'layouts/main',
    title: 'Upload Dokumen KP',
    customCss: '/upload/upload_dokumen_pengajuan_kp.css',
    user,
    sudahIsiFormulir
  });
});

// Upload dokumen dan simpan pengajuan
router.post('/', upload.fields([
  { name: 'proposal_kp', maxCount: 1 },
  { name: 'transkrip_nilai', maxCount: 1 },
  { name: 'surat_pengajuan_kp', maxCount: 1 }
]), (req, res) => {
  const user = req.session.user;
  const formData = req.session.formPengajuan;

  if (!user || !formData) return res.redirect('/pengajuan_kp?alert=form_belum_terisi');

  const files = req.files;
  const proposal = files.proposal_kp?.[0]?.filename;
  const transkrip = files.transkrip_nilai?.[0]?.filename;
  const surat = files.surat_pengajuan_kp?.[0]?.filename;

  if (!proposal || !transkrip || !surat) {
    return res.send("Semua dokumen wajib diunggah.");
  }

  // Update alamat mahasiswa
  db.query('UPDATE mahasiswa SET alamat = ? WHERE user_id = ?', [formData.alamat_mahasiswa, user.id], (errAlamat) => {
    if (errAlamat) return res.send("Gagal update alamat.");

    // Simpan perusahaan manual jika dipilih
    function insertPengajuan(perusahaanId) {
      db.query('SELECT id FROM mahasiswa WHERE user_id = ?', [user.id], (err, rows) => {
        if (err || rows.length === 0) return res.send("Mahasiswa tidak ditemukan.");
        const mahasiswaId = rows[0].id;

        const insertSql = `
          INSERT INTO pengajuan_kp 
          (mahasiswa_id, perusahaan_id, proposal_kp, transkrip_nilai, surat_pengajuan_kp, status, created_at)
          VALUES (?, ?, ?, ?, ?, 'diajukan', NOW())
        `;

        db.query(insertSql, [mahasiswaId, perusahaanId, proposal, transkrip, surat], (err2) => {
          if (err2) {
            console.error("Gagal insert pengajuan KP:", err2);
            return res.send("Gagal simpan pengajuan.");
          }

          delete req.session.formPengajuan;
          res.redirect('/pengajuan_kp?alert=sukses');
        });
      });
    }

    if (!formData.perusahaan_id || formData.perusahaan_id === 'manual') {
      db.query(
        `INSERT INTO perusahaan (nama_perusahaan, alamat_perusahaan) VALUES (?, ?)`,
        [formData.nama_perusahaan_manual, formData.alamat_perusahaan_manual],
        (errPerusahaan, result) => {
          if (errPerusahaan) return res.send("Gagal simpan perusahaan.");
          insertPengajuan(result.insertId);
        }
      );
    } else {
      insertPengajuan(formData.perusahaan_id);
    }
  });
});

module.exports = router;
