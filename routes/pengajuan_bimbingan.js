const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Halaman Pengajuan Bimbingan
router.get('/', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).send('Unauthorized');

  try {
    // Ambil semua jadwal bimbingan
    const [jadwal] = await db.promise().query('SELECT * FROM jadwal_bimbingan');

    // Ambil pengajuan yang pernah diajukan oleh mahasiswa ini (berdasarkan NIM)
    const [pengajuan] = await db.promise().query(`
      SELECT *
      FROM pengajuan_bimbingan
      WHERE nim = ?
    `, [user.nim]);

    res.render('pages/pengajuan_bimbingan', {
      layout: 'layouts/main',
      title: 'Pengajuan Bimbingan',
      jadwal,
      pengajuan
    });
  } catch (err) {
    console.error('❌ ERROR:', err);
    res.status(500).send('Terjadi kesalahan saat memuat data.');
  }
});

// POST - Ajukan bimbingan
router.post('/ajukan', async (req, res) => {
  const user = req.session.user;
  const { id_jadwal } = req.body;
  if (!user) return res.status(401).send('Unauthorized');

  try {
    // Cek apakah sudah pernah mengajukan jadwal ini
    const [cek] = await db.promise().query(
      'SELECT * FROM pengajuan_bimbingan WHERE nim = ? AND id_jadwal = ?',
      [user.nim, id_jadwal]
    );

    if (cek.length > 0) {
      return res.redirect('/pengajuan_bimbingan'); // Sudah pernah ajukan, abaikan
    }

    // Ambil data jadwal dari tabel jadwal_bimbingan
    const [jadwalData] = await db.promise().query(
      'SELECT * FROM jadwal_bimbingan WHERE id = ?',
      [id_jadwal]
    );

    if (jadwalData.length === 0) {
      return res.status(404).send('Jadwal tidak ditemukan.');
    }

    const { tanggal, waktu, dosen } = jadwalData[0];

    // Simpan pengajuan baru
    await db.promise().query(
      'INSERT INTO pengajuan_bimbingan (id_jadwal, nim, status, tanggal, waktu, dosen, id_mahasiswa) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_jadwal, user.nim, 'Menunggu', tanggal, waktu, dosen, user.id]
    );

    res.redirect('/pengajuan_bimbingan');
  } catch (err) {
    console.error('❌ Gagal ajukan bimbingan:', err);
    res.status(500).send('Gagal mengajukan bimbingan.');
  }
});

module.exports = router;
