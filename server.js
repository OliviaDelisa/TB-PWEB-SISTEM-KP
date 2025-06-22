const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const authRoutes = require('./routes/auth');
const db = require('./config/db');
const session = require('express-session');
const flash = require('connect-flash');
const { title } = require('process');
const uploadDokumenKP = require('./routes/upload_dokumen_pengajuan_kp');




const app = express(); // <- ini harus duluan
const port = 3000;

app.use(session({
  secret: 'rahasia-unik-kp', // ganti dengan secret yang kuat
  resave: false,
  saveUninitialized: false,
}));


// ------------------ MIDDLEWARE ------------------
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// ------------------ ROUTES ------------------

//Routh auth
app.use('/', authRoutes);

app.use('/upload_dokumen_pengajuan_kp', uploadDokumenKP); // ✅ ini yang benar
const pengajuanKpRoutes = require('./routes/pengajuan_kp');
app.use('/pengajuan_kp', pengajuanKpRoutes);

const pembagianDosenRoute = require('./routes/pembagian_dosen_kp');
app.use('/pembagian_dosen_kp', pembagianDosenRoute);

const pengajuanPergantianDosenRoute = require('./routes/pengajuan_pergantian_dosen');
app.use('/', pengajuanPergantianDosenRoute);

const pendaftaranSeminarKp = require('./routes/pendaftaran_seminar_kp');
app.use('/', pendaftaranSeminarKp);

const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/feedback', feedbackRoutes);

app.use('/', require('./routes/upload_berita_acara_seminar'));
app.use('/', require('./routes/upload_absensi_seminar'));


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
  res.render('pages/contact', { layout: false });
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

app.get('/dashboard_dosen', (req, res) => {
  const seminarTerdekat = {
    judul: "Seminar KP - Sistem Pemesanan Kantin",
    tanggal: "21 Juni 2025"
  };

  res.render('pages/dashboard_dosen', {
  layout: false,                     // ← NONAKTIFKAN layout
  title: 'Dashboard Dosen',
  seminarTerdekat
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

app.get('/pengajuan_kp', (req, res) => {
  res.render('pages/pengajuan_kp', {
    layout: 'layouts/main',
    title: 'Upload Dokumen Pengajuan KP',
    customCss: '/upload/pengajuan_kp.css' // opsional
  });
});

app.get('/pembagian_dosen_kp', (req, res) => {
  res.render('pages/pembagian_dosen_kp', {
    layout: 'layouts/main',
    title: 'Pembagian Dosen KP',
    customCss: '/upload/pembagian_dosen_kp.css' // opsional
  });
});

app.get('/pengajuan_dosen_pengganti', (req, res) => {
  res.render('pages/pengajuan_dosen_pengganti', {
    layout: 'layouts/main',
    title: 'Pengajuan Pergantian Dosen KP',
    customCss: '/upload/upload_dokumen_pengajuan_kp.css' // opsional
  });
});

app.get('/laporan_kemajuan_kp', (req, res) => {
  res.render('pages/laporan_kemajuan_kp', {
    layout: 'layouts/main',
    title: 'Laporan Kemajuan KP',
    customCss: '/upload/laporan_kemajuan_kp.css' // opsional
  });
});
app.get('/upload_laporan_akhir', (req, res) => {
  res.render('pages/upload_laporan_akhir', {
    layout: 'layouts/main',
    title: 'Laporan Akhir KP',
    customCss: '/upload/laporan_kemajuan_kp.css' // opsional
  });
});

app.get('/seminar_kp', (req, res) => {
  res.render('pages/seminar_kp', {
    layout: 'layouts/main',
    title: 'Seminar KP',
    customCss: '/upload/pengajuan_kp.css' // opsional
  });
});

app.get('/pendaftaran_seminar_kp', (req, res) => {
  res.render('pages/pendaftaran_seminar_kp', {
    layout: 'layouts/main',
    title: 'Seminar KP',
    customCss: '/upload/upload_dokumen_pengajuan_kp.css' 
  });
});

app.get('/absensi_seminar', (req, res) => {
  res.render('pages/absensi_seminar', {
    layout: 'layouts/main',
    title: 'Upload Absensi Seminar',
    customCss: '/upload/laporan_kemajuan_kp.css'// opsional
  });
});  

app.get('/berita_acara_seminar', (req, res) => {
  res.render('pages/berita_acara_seminar', {
    layout: 'layouts/main',
    title: 'Upload Berita Acara Seminar',
    customCss: '/upload/laporan_kemajuan_kp.css'// opsional
  });
});  

app.get('/dowonload_template_dokumen', (req, res) => {
  res.render('pages/dowonload_template_dokumen', {
    layout: 'layouts/main',
    title: 'Template Dokumen',
    customCss: '/upload/dokumen_template.css'// opsional
  });
}); 

app.get('/feedback', (req, res) => {
  res.render('pages/feedback', {
    layout: 'layouts/main',
    title: 'Feedback',
    customCss: '/upload/feedback.css'// opsional
  });
}); 

// pelaksanaan_kp
app.get('/pelaksanaan_kp', (req, res) => {
  res.render('pages/pelaksanaan_kp', { 
    layout: 'layouts/main',
    title: 'pelaksanaan_kp',
    customCss: 'upload/pelaksanaan_kp'
  });

});

// penilaian_kp
const penilaianRoutes = require('./routes/penilaian_kp');
app.use('/penilaian', penilaianRoutes);


const downloadRoute = require('./routes/download');
app.use('/download', downloadRoute);


// unggah_dokumen
const unggahDokumenRouter = require('./routes/unggah_dokumen');
app.use('/unggah_dokumen', unggahDokumenRouter);

// absensi_mahasiswa
const absensiRoute = require('./routes/absensi_mahasiswa');
app.use('/absensi_mahasiswa', absensiRoute);

//Root persetujuan_kp
const persetujuanKpRoutes = require('./routes/persetujuan_kp');
app.use('/persetujuan_kp', persetujuanKpRoutes);

// riwayat_mhs_seminar_kp
const riwayatSeminarRoute = require('./routes/riwayat_mhs_seminar_kp');
app.use('/riwayat_mhs_seminar_kp', riwayatSeminarRoute);


// detail_persetujuan
const detailPersetujuanRouter = require('./routes/detail_persetujuan');
app.use('/detail_persetujuan', detailPersetujuanRouter);


// bimbingan
app.get('/bimbingan', (req, res) => {
  res.render('pages/bimbingan', { 
    layout: 'layouts/main',
    title: 'bimbingan',
    customCss: 'upload/bimbingan'
  });
});

// riwayat_persetujuan
app.get('/riwayat_persetujuan', (req, res) => {
  res.render('pages/riwayat_persetujuan', { 

    title: 'riwayat_persetujuan',
    customCss: 'upload/riwayat_persetujuan'
  });
});

app.get('/riwayat_bimbingan', (req, res) => {
  res.render('pages/riwayat_bimbingan', {
    layout: 'layouts/main',
    title: 'Riwayat Bimbingan',
    customCss: 'upload/riwayat_bimbingan.css'
  });
});


// pengajuan_bimbingan
const pengajuanBimbinganRoutes = require('./routes/pengajuan_bimbingan');
app.use('/pengajuan_bimbingan', pengajuanBimbinganRoutes);


// jadwal_pengajuanBimbingan
const jadwalPengajuanRouter = require('./routes/jadwal_pengajuanBimbingan');
app.use('/jadwal_pengajuanBimbingan', jadwalPengajuanRouter);





// Root redirect
app.get('/', (req, res) => {
  res.redirect('/home');
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
