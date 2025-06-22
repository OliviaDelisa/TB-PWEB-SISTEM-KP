const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Halaman utama pengajuan KP
router.get('/', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  const getMahasiswaSql = 'SELECT id FROM mahasiswa WHERE user_id = ?';
  db.query(getMahasiswaSql, [user.id], (err, rows) => {
    if (err || rows.length === 0) return res.send('Mahasiswa tidak ditemukan.');

    const mahasiswaId = rows[0].id;
    const pengajuanSql = `
      SELECT pk.*, p.nama_perusahaan 
      FROM pengajuan_kp pk
      LEFT JOIN perusahaan p ON pk.perusahaan_id = p.id
      WHERE pk.mahasiswa_id = ?
      ORDER BY pk.id DESC LIMIT 1
    `;

    db.query(pengajuanSql, [mahasiswaId], (err, results) => {
      if (err) {
        console.error("Gagal ambil data pengajuan KP:", err);
        return res.send("Terjadi kesalahan.");
      }

      res.render('pages/pengajuan_kp', {
  layout: 'layouts/main',
  title: 'Pengajuan KP',
  customCss: '/upload/pengajuan_kp.css',
  user,
  pengajuan: results[0] || null,
  alert: req.query.alert || null // tambahkan ini
});

      });
    });
  });


// Halaman Formulir Pengajuan KP
router.get('/formulir', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  const mahasiswaQuery = 'SELECT id, nama, nim FROM mahasiswa WHERE user_id = ?';
  db.query(mahasiswaQuery, [user.id], (errMahasiswa, mahasiswaRows) => {
    if (errMahasiswa || mahasiswaRows.length === 0) return res.send("Data mahasiswa tidak ditemukan.");

    const mahasiswa = mahasiswaRows[0];

    const pengajuanQuery = `
      SELECT pk.*, p.nama_perusahaan 
      FROM pengajuan_kp pk
      LEFT JOIN perusahaan p ON pk.perusahaan_id = p.id
      WHERE pk.mahasiswa_id = ? AND pk.status IN ('diajukan', 'proses', 'diterima')
      ORDER BY pk.id DESC LIMIT 1
    `;

    db.query(pengajuanQuery, [mahasiswa.id], (errPengajuan, pengajuanRows) => {
      if (errPengajuan) {
        console.error("Gagal ambil status pengajuan:", errPengajuan);
        return res.send("Terjadi kesalahan.");
      }

      const pengajuan = pengajuanRows.length > 0 ? pengajuanRows[0] : null;

      db.query('SELECT * FROM perusahaan', (errPerusahaan, perusahaanList) => {
        if (errPerusahaan) {
          console.error("Gagal ambil perusahaan:", errPerusahaan);
          return res.send("Terjadi kesalahan saat ambil perusahaan.");
        }

        res.render('pages/formulir_pengajuan_kp', {
          layout: 'layouts/main',
          title: 'Formulir Pengajuan KP',
          customCss: '/upload/upload_dokumen_pengajuan_kp.css',
          user,
          perusahaanList,
          mahasiswa,
          pengajuan,
          alert: req.query.alert || null // ✅ tambahkan ini
});
        });
      });
    });
  });


// Simpan data form ke session, redirect ke upload
router.post('/submit', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  const {
    alamat_mahasiswa,
    perusahaan_id,
    nama_perusahaan_manual,
    alamat_perusahaan_manual
  } = req.body;

  req.session.formPengajuan = {
    alamat_mahasiswa,
    perusahaan_id,
    nama_perusahaan_manual,
    alamat_perusahaan_manual
  };

  res.redirect('/upload_dokumen_pengajuan_kp');
});

// POST Batalkan Pengajuan KP
router.post('/batal', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  db.query('SELECT id FROM mahasiswa WHERE user_id = ?', [user.id], (err, rows) => {
    if (err || rows.length === 0) return res.send("Mahasiswa tidak ditemukan.");

    const mahasiswaId = rows[0].id;

    db.query(`DELETE FROM pengajuan_kp WHERE mahasiswa_id = ? AND status = 'diajukan'`, [mahasiswaId], (err2) => {
      if (err2) {
        console.error("Gagal batalkan:", err2);
        return res.send("Gagal membatalkan pengajuan.");
      }

      res.redirect('/pengajuan_kp/formulir?alert=batalkan_sukses');

    });
  });
});


module.exports = router;
