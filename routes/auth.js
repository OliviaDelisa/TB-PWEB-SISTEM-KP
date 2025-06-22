
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Register Mahasiswa
router.post('/signup_mahasiswa', (req, res) => {
  const { nama, nim, email, password } = req.body;

  // Simpan ke tabel users
  const insertUserSql = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
  db.query(insertUserSql, [email, password, 'mahasiswa'], (err, result) => {
    if (err) {
      console.error('Gagal insert ke tabel users:', err);
      return res.send('Gagal mendaftar: ' + err.message);
    }

    const userId = result.insertId;

    // Simpan ke tabel mahasiswa
    const insertMahasiswaSql = 'INSERT INTO mahasiswa (user_id, nama, nim) VALUES (?, ?, ?)';
    db.query(insertMahasiswaSql, [userId, nama, nim], (err2) => {
      if (err2) {
        console.error('Gagal insert ke tabel mahasiswa:', err2);
        return res.send('Gagal simpan data mahasiswa: ' + err2.message);
      }

      // Jika berhasil
      res.redirect('/login/mahasiswa');
    });
  });
});

module.exports = router;



// -------------------------
// HALAMAN LOGIN sesuai role
// -------------------------
router.get('/login/:role', (req, res) => {
  const role = req.params.role.toLowerCase();
  if (!['mahasiswa', 'dosen', 'admin'].includes(role)) {
    return res.send('Role tidak valid');
  }
  res.render(`pages/login_${role}`, { layout: false });
});

// -------------------------
// PROSES LOGIN sesuai role
// -------------------------
router.post('/login/:role', (req, res) => {
  const { email, password } = req.body;
  const role = req.params.role.toLowerCase();

  if (!['mahasiswa', 'dosen', 'admin'].includes(role)) {
    return res.render(`pages/login_${role}`, {
      layout: false,
      error: 'Role tidak valid',
      email
    });
  }

  const sql = 'SELECT * FROM users WHERE email = ? AND role = ?';
  db.query(sql, [email, role], (err, results) => {
    if (err || results.length === 0) {
      return res.render(`pages/login_${role}`, {
        layout: false,
        error: 'Email tidak ditemukan / Role salah',
        email
      });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.render(`pages/login_${role}`, {
        layout: false,
        error: 'Password salah',
        email
      });
    }

    // Simpan session user
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    


    res.redirect(`/dashboard_${role}`);
  });
});

module.exports = router;
