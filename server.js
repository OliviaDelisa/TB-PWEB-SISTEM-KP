const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Set EJS sebagai view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/pages'));  // Pastikan views berada di folder 'views/pages'

// Middleware untuk melayani file statis seperti CSS, gambar, dll.
app.use(express.static(path.join(__dirname, 'public')));

// Rute untuk halaman utama (home)
app.get('/home', (req, res) => {
  res.render('home');  // Menampilkan home.ejs
});

// Rute untuk halaman login mahasiswa
app.get('/login_mahasiswa', (req, res) => {
  res.render('login_mahasiswa');  // Menampilkan login_mahasiswa.ejs
});

// Rute untuk halaman login admin
app.get('/login_admin', (req, res) => {
  res.render('login_admin');  // Menampilkan login_admin.ejs
});

// Rute untuk halaman login dosen
app.get('/login_dosen', (req, res) => {
  res.render('login_dosen');  // Menampilkan login_dosen.ejs
});

// Rute untuk halaman signup mahasiswa
app.get('/signup_mahasiswa', (req, res) => {
  res.render('signup_mahasiswa');  // Menampilkan signup_mahasiswa.ejs
});

// Rute untuk halaman contact
app.get('/contact', (req, res) => {
  res.render('contact');  // Menampilkan contact.ejs
});

// Rute untuk halaman dashboard
app.get('/dashboard_mahasiswa', (req, res) => {
  const seminarTerdekat = {
    judul: "Seminar KP - Sistem Pemesanan Kantin",
    tanggal: "21 Juni 2025"
  };

  res.render('dashboard_mahasiswa', { seminarTerdekat }); // <-- kirim data ke EJS
});


// Rute default atau halaman utama (root)
app.get('/', (req, res) => {
  res.redirect('/home');  // Mengarahkan root ke /home
});

// Menjalankan server pada port yang telah ditentukan
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
