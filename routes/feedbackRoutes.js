const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET: Tampilkan halaman feedback dan riwayat feedback user
router.get('/', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  const sql = `
    SELECT id, feedback, created_at 
    FROM feedback 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `;
  db.query(sql, [user.id], (err, results) => {
    if (err) {
      console.error('Gagal ambil feedback:', err);
      return res.status(500).send('Terjadi kesalahan saat mengambil data.');
    }

    res.render('pages/feedback', {
      layout: 'layouts/main',
      title: 'Feedback',
      customCss: '/upload/feedback.css',
      user,
      riwayat: results
    });
  });
});

// POST: Kirim feedback baru
router.post('/submit', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  const { feedback } = req.body;
  if (!feedback.trim()) {
    return res.send("Feedback tidak boleh kosong.");
  }

  const sql = 'INSERT INTO feedback (user_id, feedback, created_at) VALUES (?, ?, NOW())';
  db.query(sql, [user.id, feedback], (err) => {
    if (err) {
      console.error('Gagal simpan feedback:', err);
      return res.status(500).send('Gagal menyimpan feedback.');
    }

    res.redirect('/feedback');
  });
});

// POST: Hapus feedback berdasarkan ID dan user ID
router.post('/hapus/:id', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login_mahasiswa');

  const { id } = req.params;
  const sql = 'DELETE FROM feedback WHERE id = ? AND user_id = ?';

  db.query(sql, [id, user.id], (err) => {
    if (err) {
      console.error('Gagal hapus feedback:', err);
      return res.status(500).send('Gagal menghapus feedback.');
    }

    res.redirect('/feedback');
  });
});

module.exports = router;
