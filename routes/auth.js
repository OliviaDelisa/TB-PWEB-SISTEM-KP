const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');



//Proses registrasi mahasiswa (cocok dengan action form)
router.post('/signup_mahasiswa', async (req, res) => {
  const { nama, nim, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (nama, nim, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [nama, nim, email, hashedPassword, 'mahasiswa'],
    (err, result) => {
      if (err) return res.send('Gagal mendaftar: ' + err.message);
      res.redirect('/login/mahasiswa');

// redirect ke halaman login
    }
  );
});

router.get('/login/:role', (req, res) => {
  const role = req.params.role.toLowerCase(); // untuk jaga-jaga kapital
  if (!['mahasiswa', 'dosen', 'admin'].includes(role)) {
    return res.send('Role tidak valid');
  }
  res.render(`pages/login_${role}`, { layout: false });
});


//Proses login berdasarkan role
router.post('/login/:role', async (req, res) => {
  const { email, password } = req.body;
  const role = req.params.role.toLowerCase();

  if (!['mahasiswa', 'dosen', 'admin'].includes(role)) {
    return res.send('Role tidak valid');
  }

  db.query(
    'SELECT * FROM users WHERE email = ? AND role = ?',
    [email, role],
    async (err, results) => {
      if (err || results.length === 0) return res.send('Akun tidak ditemukan');

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.send('Password salah');

      // Redirect ke dashboard sesuai role
      res.redirect(`/dashboard_${role}`);
    }
  );
});


module.exports = router;
