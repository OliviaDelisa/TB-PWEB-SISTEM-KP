const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Tampilkan semua daftar pengajuan penggantian dosen
router.get('/', (req, res) => {
  const query = `
    SELECT 
      ppd.id,
      m.nim,
      m.nama AS nama_mahasiswa,
      d.nama AS dosen_sebelumnya,
      ppd.status
    FROM pengajuan_pergantian_dosen ppd
    JOIN pembimbing_kp pkp ON ppd.pembimbing_kp_id = pkp.id
    JOIN mahasiswa m ON pkp.mahasiswa_id = m.id
    JOIN dosen d ON pkp.dosen_id = d.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Gagal mengambil daftar pengajuan:', err);
      return res.status(500).send('Gagal mengambil data');
    }

   res.render('pages/penggantianDosen', {
  layout: 'layout/main',
  title: 'Daftar Pengajuan Dosen Pengganti',
  customCss: '/upload/penggantianDosen.css',
  daftarPengajuan: results 
  
});
    });
  })

// GET detail pengajuan penggantian dosen
router.get('/detail/:id', (req, res) => {
  const pengajuanId = req.params.id;

  const query = `
    SELECT 
      ppd.id,
      m.nim,
      m.nama AS nama_mahasiswa,
      d_lama.nama AS dosen_sebelumnya,
      
      ppd.status
    FROM pengajuan_pergantian_dosen ppd
    JOIN pembimbing_kp pkp ON ppd.pembimbing_kp_id = pkp.id
    JOIN mahasiswa m ON pkp.mahasiswa_id = m.id
    JOIN dosen d_lama ON pkp.dosen_id = d_lama.id
    
    WHERE ppd.id = ?
  `;

  db.query(query, [pengajuanId], (err, results) => {
    if (err) {
      console.error('Gagal ambil detail:', err);
      return res.status(500).send('Gagal mengambil data detail');
    }

    if (results.length === 0) {
      return res.status(404).send('Pengajuan tidak ditemukan');
    }

    const detailPengajuan = results[0];

    res.render('pages/detailPenggantian', {
      layout: 'layout/main',
      title: 'Detail Penggantian Dosen',
      customCss: '/upload/detailPenggantian.css',
      detailPengajuan: detailPengajuan
    });
  });
});

// Setujui pengajuan penggantian dosen
router.post('/setujui/:id', (req, res) => {
  const pengajuanId = req.params.id;

  const getQuery = `
    SELECT pkp.mahasiswa_id, ppd.id_dosen_baru
    FROM pengajuan_pergantian_dosen ppd
    JOIN pembimbing_kp pkp ON ppd.pembimbing_kp_id = pkp.id
    WHERE ppd.id = ?
  `;

  db.query(getQuery, [pengajuanId], (err, result) => {
    if (err || result.length === 0) {
      console.error('Pengajuan tidak ditemukan:', err);
      return res.status(404).send('Pengajuan tidak ditemukan');
    }

    const { mahasiswa_id, id_dosen_baru } = result[0];

    const updateDosen = `
      UPDATE pembimbing_kp SET dosen_id = ? WHERE mahasiswa_id = ?
    `;
    db.query(updateDosen, [id_dosen_baru, mahasiswa_id], (err) => {
      if (err) {
        console.error('Gagal update dosen pembimbing:', err);
        return res.status(500).send('Gagal update dosen');
      }

      const updateStatus = `
        UPDATE pengajuan_penggantian_dosen SET status = 'Disetujui' WHERE id = ?
      `;
      db.query(updateStatus, [pengajuanId], (err) => {
        if (err) {
          console.error('Gagal update status:', err);
          return res.status(500).send('Gagal update status');
        }

        res.redirect('/penggantianDosen');
      });
    });
  });
});


// (Opsional) Tolak pengajuan
router.post('/tolak/:id', (req, res) => {
  const pengajuanId = req.params.id;

  const query = `UPDATE pengajuan_penggantian_dosen SET status = 'Ditolak' WHERE id = ?`;
  db.query(query, [pengajuanId], (err) => {
    if (err) {
      console.error('Gagal tolak pengajuan:', err);
      return res.status(500).send('Gagal menolak');
    }
    res.redirect('/penggantianDosen');
  });
});

module.exports = router;
