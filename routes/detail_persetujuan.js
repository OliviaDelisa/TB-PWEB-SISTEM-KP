const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Tampilkan detail pengajuan berdasarkan NIM
router.get('/', (req, res) => {
  const nim = req.query.nim;

  if (!nim) {
    return res.status(400).send('NIM tidak ditemukan di URL.');
  }

  const sql = `
    SELECT pk.id, m.nim, m.nama, m.alamat AS alamat_mahasiswa,
           per.nama_perusahaan, per.alamat_perusahaan AS alamat_perusahaan,
           pk.proposal_kp, pk.surat_pengajuan_kp, pk.transkrip_nilai
    FROM pengajuan_kp pk
    JOIN mahasiswa m ON pk.mahasiswa_id = m.id
    JOIN perusahaan per ON pk.perusahaan_id = per.id
    WHERE m.nim = ?
    LIMIT 1
  `;

  db.query(sql, [nim], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }

    if (results.length === 0) {
      return res.status(404).send('Data tidak ditemukan untuk NIM tersebut.');
    }

    const detail = results[0];

    const dokumenArray = [];
    if (detail.proposal_kp) dokumenArray.push(detail.proposal_kp);
    if (detail.surat_pengajuan_kp) dokumenArray.push(detail.surat_pengajuan_kp);
    if (detail.transkrip_nilai) dokumenArray.push(detail.transkrip_nilai);

    res.render('pages/detail_persetujuan', {
      layout: false,
      detail,
      dokumenArray,
      title: 'Detail Pengajuan KP'
    });
  });
});

// POST - Setujui pengajuan
router.post('/setujui', (req, res) => {
  const id = req.body.id;

  const updateQuery = `UPDATE pengajuan_kp SET status = 'disetujui' WHERE id = ?`;
  db.query(updateQuery, [id], (err) => {
    if (err) {
      console.error('Gagal memperbarui status:', err);
      return res.status(500).send('Gagal menyetujui pengajuan.');
    }
    res.redirect('/persetujuan_kp');
  });
});

// POST - Tolak pengajuan
router.post('/tolak', (req, res) => {
  const id = req.body.id;

  const updateQuery = `UPDATE pengajuan_kp SET status = 'tidak disetujui' WHERE id = ?`;
  db.query(updateQuery, [id], (err) => {
    if (err) {
      console.error('Gagal memperbarui status:', err);
      return res.status(500).send('Gagal menolak pengajuan.');
    }
    res.redirect('/persetujuan_kp');
  });
});

module.exports = router;
