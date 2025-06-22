// routes/pengajuanKP.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const query = `
    SELECT 
      pk.id, 
      pk.mahasiswa_id, 
      m.nim,
      m.nama AS nama_mahasiswa, 
      pk.status 
    FROM 
      pengajuan_kp pk
    JOIN
      mahasiswa m ON pk.mahasiswa_id = m.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Gagal ambil data pengajuan KP:', err);
      return res.status(500).send('Gagal mengambil data');
    }

    res.render('pages/daftarPengajuanKP', {
      layout: 'layout/main',
      title: 'Daftar Pengajuan KP',
      customCss: '/upload/daftarPengajuanKP.css',
      pengajuanKP: results
    });
  });
});

// GET detail pengajuan KP
router.get('/detail/:id', (req, res) => {
  const id = req.params.id;

  const query = `
  SELECT 
    pk.id,
    m.nama AS nama_mahasiswa, 
    m.nim,
    p.nama_perusahaan AS perusahaan,
    p.alamat_perusahaan AS alamatPerusahaan,
    pk.proposal_kp,
    pk.surat_pengajuan_kp,
    pk.transkrip_nilai

  FROM pengajuan_kp pk
  JOIN mahasiswa m ON pk.mahasiswa_id = m.id
  JOIN perusahaan p ON pk.perusahaan_id = p.id
  WHERE pk.id = ?
`;


  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Gagal ambil detail pengajuan KP:', err);
      return res.status(500).send('Gagal mengambil data');
    }

    if (results.length === 0) {
      return res.status(404).send('Pengajuan tidak ditemukan');
    }

   const pengajuan = {
  id: results[0].id,
  nama_mahasiswa: results[0].nama_mahasiswa,
  nim: results[0].nim,
  perusahaan: results[0].perusahaan,
  alamatPerusahaan: results[0].alamatPerusahaan,
  proposal_kp: results[0].proposal_kp,
  surat_pengajuan_kp: results[0].surat_pengajuan_kp,
  transkrip_nilai: results[0].transkrip_nilai
};


    res.render('pages/detailPengajuanKP', {
      layout: 'layout/main',
      title: 'Detail Pengajuan KP',
      customCss: '/upload/detailPengajuanKP.css',
      pengajuan
    });
  });
});

// POST verifikasi pengajuan KP
router.post('/detail/:id', (req, res) => {
  const id = req.params.id;

  const query = `UPDATE pengajuan_kp SET status = 'disetujui' WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Gagal memverifikasi pengajuan:', err);
      return res.status(500).send('Gagal memverifikasi pengajuan');
    }

    res.redirect('/pengajuanKP'); // arahkan ke halaman daftar
  });
});

module.exports = router;
