const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const authRoutes = require('./routes/auth'); // 
const db = require('./config/db');  

const app = express();
const port = 3000;

// ------------------ MIDDLEWARE ------------------
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// ------------------ ROUTES ------------------

//Routh auth
app.use('/', authRoutes);

// Halaman Utama
app.get('/home', (req, res) => {
  res.render('pages/home', {
    layout: false,  
  });
});


// Login Mahasiswa (tanpa layout)
app.get('/login_mahasiswa', (req, res) => {
  res.render('pages/login_mahasiswa', { layout: false });
});

// Login Admin
app.get('/login_admin', (req, res) => {
  res.render('pages/login_admin', { layout: false });
});

// Login Dosen
app.get('/login_dosen', (req, res) => {
  res.render('pages/login_dosen', { layout: false });
});

// Signup Mahasiswa
app.get('/signup_mahasiswa', (req, res) => {
  res.render('pages/signup_mahasiswa', { layout: false });
});

// Contact Page
app.get('/contact', (req, res) => {
  res.render('pages/contact');
});

// Dashboard Mahasiswa 
app.get('/dashboard_mahasiswa', (req, res) => {
  const seminarTerdekat = {
    judul: "Seminar KP - Sistem Pemesanan Kantin",
    tanggal: "21 Juni 2025"
  };

  res.render('pages/dashboard_mahasiswa', {
  layout: false,                     // ← NONAKTIFKAN layout
  title: 'Dashboard Mahasiswa',
  seminarTerdekat
});
});

// Pengajuan KP
app.get('/pengajuan_kp', (req, res) => {
  res.render('pages/pengajuan_kp', {
    layout: 'layouts/main',
    title: 'Pengajuan KP',
    customCss: '/upload/pengajuan_kp.css'
  });
});

//Root formulir pengjuan kp
app.get('/formulir_pengajuan_kp', (req, res) => {
  res.render('pages/formulir_pengajuan_kp', {
    layout: 'layouts/main',
    title: 'Formulir Pengajuan KP',
    customCss: '/upload/upload_dokumen_pengajuan_kp.css' // opsional
  });
});

//Root upload dokumen pengajuan kp
app.get('/upload_dokumen_pengajuan_kp', (req, res) => {
  res.render('pages/upload_dokumen_pengajuan_kp', {
    layout: 'layouts/main',
    title: 'Upload Dokumen Pengajuan KP',
    customCss: '/upload/upload_dokumen_pengajuan_kp.css' // opsional
  });
});
// Root redirect
app.get('/', (req, res) => {
  res.redirect('/home');
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
