const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Tampilkan halaman dan jadwal dari DB
router.get('/', (req, res) => {
  const pesan = req.query.pesan;

  db.query('SELECT * FROM pengajuan_bimbingan ORDER BY tanggal DESC', (err, results) => {
    if (err) {
      console.error('Gagal mengambil data:', err);
      return res.status(500).send('Gagal mengambil data dari database');
    }

    res.render('pages/jadwal_pengajuanBimbingan', {
      title: 'Pengajuan Bimbingan',
      jadwal: results,
      pesan
    });
  });
});

// POST - Ajukan jadwal bimbingan
router.post('/ajukan', (req, res) => {
  const { tanggal, waktu } = req.body;
  const dosen = 'Husnil Kamil, M.T';
  const status = 'Menunggu';

  const sql = 'INSERT INTO pengajuan_bimbingan (tanggal, waktu, dosen, status) VALUES (?, ?, ?, ?)';
  db.query(sql, [tanggal, waktu, dosen, status], (err) => {
    if (err) {
      console.error('Gagal menyimpan data:', err);
      return res.status(500).send('Gagal mengajukan jadwal');
    }

    res.redirect('/jadwal_pengajuanBimbingan?pesan=ajukan');
  });
});

// POST - Batalkan pengajuan (jika status masih "Menunggu")
router.post('/batal_pengajuan/:id', (req, res) => {
  const id = req.params.id;

  const checkSql = 'SELECT status FROM pengajuan_bimbingan WHERE id = ?';
  db.query(checkSql, [id], (err, results) => {
    if (err) {
      console.error('Gagal memeriksa status:', err);
      return res.status(500).send('Gagal membatalkan');
    }

    if (results.length === 0) {
      return res.status(404).send('Data tidak ditemukan');
    }

    if (results[0].status === 'Menunggu') {
      const deleteSql = 'DELETE FROM pengajuan_bimbingan WHERE id = ?';
      db.query(deleteSql, [id], (err) => {
        if (err) {
          console.error('Gagal menghapus:', err);
          return res.status(500).send('Gagal membatalkan');
        }

        res.redirect('/jadwal_pengajuanBimbingan?pesan=batal');
      });
    } else {
      res.redirect('/jadwal_pengajuanBimbingan');
    }
  });
});

module.exports = router;
