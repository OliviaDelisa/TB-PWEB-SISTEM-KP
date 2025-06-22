const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Pastikan path ke file koneksi database Anda benar
const moment = require('moment'); // pastikan moment sudah diinstall
const PDFDocument = require('pdfkit');

// Middleware untuk autentikasi (pastikan ditempatkan di server.js atau di awal file ini)
const requireAuth = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.redirect('/login');
    }
};

// Helper function untuk mencatat aktivitas ke tabel aktivitas_sistem
const logActivity = async (type, description, userId = null) => {
    try {
        const sql = 'INSERT INTO aktivitas_sistem (tipe_aktivitas, deskripsi_aktivitas, user_id, created_at) VALUES (?, ?, ?, NOW())';
        await db.execute(sql, [type, description, userId]);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// Redirect dari root
router.get('/', (req, res) => {
    res.redirect('/home');
});

// Home Page (Anda bisa menambahkan logika lain jika diperlukan)
router.get('/home', (req, res) => {
    res.render('pages/home', {
        layout: false,
        title: 'Home'
    });
});

// Halaman Login
router.get('/login', (req, res) => {
    res.render('pages/login_admin', {
        layout: false,
        title: 'Login Admin',
        error: null
    });
});

// Proses Login Admin
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Menggunakan db.execute untuk kueri promise-based
        // Membandingkan password langsung di kueri SQL (password teks biasa)
        const [results] = await db.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

        if (results.length > 0) {
            const user = results[0];
            
            // Cukup periksa peran setelah user ditemukan dan password cocok
            if (user.role === 'admin') {
                // Simpan data user ke session
                req.session.user = {
                    id: user.id,
                    name: user.name || 'Admin',
                    email: user.email,
                    role: user.role // Tambahkan role ke session
                };
                await logActivity('login', `Admin ${user.name} berhasil login`, user.id);
                res.redirect('/dashboard');
            } else {
                res.render('pages/login_admin', {
                    layout: false,
                    title: 'Login Admin',
                    error: 'Anda bukan Admin' // Pesan lebih spesifik
                });
            }
        } else {
            res.render('pages/login_admin', {
                layout: false,
                title: 'Login Admin',
                error: 'Email atau password salah'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Terjadi kesalahan sistem saat login.');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Gagal logout:', err);
            return res.status(500).send('Gagal logout');
        }
        res.redirect('/login');
    });
});



router.get('/dashboard', requireAuth, async (req, res) => {
    try {
        // Statistik
        const [totalMahasiswaResult] = await db.execute('SELECT COUNT(*) AS count FROM mahasiswa');
        const [totalDosenResult] = await db.execute('SELECT COUNT(*) AS count FROM dosen');
        const [totalPerusahaanResult] = await db.execute('SELECT COUNT(*) AS count FROM perusahaan');

        // Gunakan kolom status_kp jika memang ada
        let totalKPResult;
        try {
            [totalKPResult] = await db.execute("SELECT COUNT(*) AS count FROM pengajuan_kp WHERE status_kp = 'berjalan'");
        } catch {
            totalKPResult = [{ count: 0 }];
        }

        // Coba ambil data berdasarkan tanggal, fallback jika kolom tidak tersedia
        const getCountByDate = async (table, dateColumn) => {
            try {
                const [result] = await db.execute(
                    `SELECT COUNT(*) AS count FROM ${table} WHERE ${dateColumn} >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`
                );
                return result[0].count;
            } catch {
                return 0;
            }
        };

        const stats = {
            totalMahasiswa: totalMahasiswaResult[0].count,
            totalDosen: totalDosenResult[0].count,
            totalPerusahaan: totalPerusahaanResult[0].count,
            totalKP: totalKPResult[0].count,
            newMahasiswa: await getCountByDate('mahasiswa', 'created_at'),
            newDosen: await getCountByDate('dosen', 'created_at'),
            newPerusahaan: await getCountByDate('perusahaan', 'created_at'),
            newKP: await getCountByDate('pengajuan_kp', 'tanggal_pengajuan') // ganti sesuai kolom yang benar
        };

        // Aktivitas terbaru
        const [recentActivitiesResult] = await db.execute(`
            SELECT
                a.tipe_aktivitas,
                a.deskripsi_aktivitas,
                a.created_at,
                u.email AS userName
            FROM
                aktivitas_sistem a
            LEFT JOIN
                users u ON a.user_id = u.id
            ORDER BY
                a.created_at DESC
            LIMIT 10
        `);

        const recentActivities = recentActivitiesResult.map(activity => ({
            type: activity.tipe_aktivitas,
            title: activity.deskripsi_aktivitas,
            timeAgo: moment(activity.created_at).fromNow(),
            userName: activity.userName || 'Sistem'
        }));

        res.render('pages/admin/dashboard_admin', {
            layout: 'layouts/admin',
            title: 'Dashboard Admin',
            user: req.session.user || { name: 'Admin' },
            stats,
            recentActivities
        });

    } catch (error) {
        console.error('Error Dashboard:', error);
        res.status(500).send(`<pre>${error.stack}</pre>`);
    }
});


// Halaman Daftar Perusahaan
router.get('/perusahaan', requireAuth, async (req, res) => {
  const search = req.query.search || '';
  let perusahaanList;

  try {
    if (search) {
      const [results] = await db.execute(
        `SELECT * FROM perusahaan 
         WHERE nama_perusahaan LIKE ? 
         OR alamat_perusahaan LIKE ? 
         OR email_perusahaan LIKE ? 
         OR kategori LIKE ?`,
        [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
      );
      perusahaanList = results;
    } else {
      const [results] = await db.execute("SELECT * FROM perusahaan");
      perusahaanList = results;
    }

    res.render('pages/admin/daftar_perusahaan', {
      layout: 'layouts/admin',
      title: 'Daftar Perusahaan',
      customCss: '/upload/admincss/daftar_perusahaan.css',
      perusahaanList,
      search
    });
  } catch (err) {
    console.error("Gagal mengambil data perusahaan:", err.message);
   res.status(500).send(`<pre>${error.stack}</pre>`);
  }
});

router.get('/perusahaan/download-pdf', requireAuth, async (req, res) => {
  try {
    const [perusahaanList] = await db.execute('SELECT * FROM perusahaan');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=daftar_perusahaan.pdf');

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    // Header
    doc.fontSize(16).text('Daftar Perusahaan Kerja Praktik', { align: 'center' });
    doc.moveDown();

    // Table headers
    const tableTop = 100;
    const rowHeight = 25;
    const colWidths = {
      no: 30,
      nama: 120,
      alamat: 130,
      email: 110,
      kontak: 90,
      kuota: 50,
    };

    const startX = doc.page.margins.left;

    const drawRow = (y, data, isHeader = false) => {
      const bold = isHeader ? 'Helvetica-Bold' : 'Helvetica';
      doc.font(bold).fontSize(10);
      doc.text(data.no, startX, y, { width: colWidths.no });
      doc.text(data.nama, startX + colWidths.no, y, { width: colWidths.nama });
      doc.text(data.alamat, startX + colWidths.no + colWidths.nama, y, { width: colWidths.alamat });
      doc.text(data.email, startX + colWidths.no + colWidths.nama + colWidths.alamat, y, { width: colWidths.email });
      doc.text(data.kontak, startX + colWidths.no + colWidths.nama + colWidths.alamat + colWidths.email, y, { width: colWidths.kontak });
      doc.text(data.kuota, startX + colWidths.no + colWidths.nama + colWidths.alamat + colWidths.email + colWidths.kontak, y, { width: colWidths.kuota });
    };

    drawRow(tableTop, {
      no: 'No',
      nama: 'Nama',
      alamat: 'Alamat',
      email: 'Email',
      kontak: 'Kontak',
      kuota: 'Kuota',
    }, true);

    let y = tableTop + rowHeight;

    perusahaanList.forEach((p, i) => {
      drawRow(y, {
        no: i + 1,
        nama: p.nama_perusahaan,
        alamat: p.alamat_perusahaan,
        email: p.email_perusahaan,
        kontak: p.kontak,
        kuota: `${p.kuota} Mhs`
      });
      y += rowHeight;
    });

    doc.end();
  } catch (err) {
    console.error('Gagal generate PDF:', err);
    res.status(500).send('Terjadi kesalahan saat generate PDF');
  }
});





router.get('/perusahaan/tambah', requireAuth, (req, res) => {
    res.render('pages/admin/tambah_perusahaan', {
        layout: 'layouts/admin',
        title: 'Tambah Perusahaan',
        customCss: '/upload/admincss/tambah_peusahaan.css',
        user: req.session.user || { name: 'Admin' }
    });
});

router.post('/perusahaan/tambah', requireAuth, async (req, res) => {
    const { nama_perusahaan, alamat_perusahaan, email_perusahaan, kontak, kategori, kuota } = req.body;
    try {
        await db.execute(`
            INSERT INTO perusahaan (nama_perusahaan, alamat_perusahaan, email_perusahaan, kontak, kategori, kuota, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [nama_perusahaan, alamat_perusahaan, email_perusahaan, kontak, kategori, kuota]);
        res.redirect('/perusahaan');
    } catch (error) {
        console.error('Gagal tambah perusahaan:', error);
        res.status(500).send('Gagal tambah data');
    }
});

// GET: Form Edit Perusahaan
router.get('/perusahaan/edit/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('SELECT * FROM perusahaan WHERE id = ?', [id]);
        if (result.length === 0) return res.status(404).send('Perusahaan tidak ditemukan');

        res.render('pages/admin/edit_perusahaan', {
            layout: 'layouts/admin',
            title: 'Edit Perusahaan',
            customCss: '/upload/admincss/edit_perusahaan.css',
            user: req.session.user || { name: 'Admin' },
            perusahaan: result[0]
        });
    } catch (error) {
        console.error('Error ambil data perusahaan:', error);
        res.status(500).send('Gagal mengambil data');
    }
});

// POST: Proses Edit Perusahaan
router.post('/perusahaan/edit/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const {
        nama_perusahaan,
        alamat_perusahaan,
        email_perusahaan,
        kontak,
        kategori,
        kuota
    } = req.body;

    try {
        await db.execute(
            `UPDATE perusahaan SET nama_perusahaan = ?, alamat_perusahaan = ?, email_perusahaan = ?, kontak = ?, kategori = ?, kuota = ? WHERE id = ?`,
            [nama_perusahaan, alamat_perusahaan, email_perusahaan, kontak, kategori, kuota, id]
        );
        res.redirect('/perusahaan');
    } catch (error) {
        console.error('Gagal update perusahaan:', error);
        res.status(500).send('Gagal update data perusahaan');
    }
});

router.get('/periodeKP', requireAuth, async (req, res) => {
  const search = req.query.search || '';
  let periode_kpList = [];

  try {
    let query = 'SELECT * FROM periode_kp';
    const params = [];

    if (search) {
      query += ' WHERE nama_periode LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [results] = await db.execute(query, params);
    periode_kpList = results;

    res.render('pages/admin/atur_periodeKP', {
      layout: 'layouts/admin',
      title: 'Atur Periode KP',
      customCss: '/upload/admincss/atur_periodeKP.css',
      user: req.session.user || { name: 'Admin' },
      periode_kpList,
      search
    });
  } catch (error) {
    console.error('Error mengambil data Periode KP:', error);
    res.status(500).send(`<pre>${error.stack}</pre>`);
  }
});


router.get('/periodeKP/tambah', requireAuth, (req, res) => {
    res.render('pages/admin/tambah_periodeKP', {
        layout: 'layouts/admin',
        title: 'Tambah Periode KP',
        customCss: '/upload/admincss/tambah_periodeKP.css',
        user: req.session.user || { name: 'Admin' }
    });
});

router.post('/periodeKP/tambah', requireAuth, async (req, res) => {
    const { nama_periode, tanggal_mulai_pendaftaran, tanggal_akhir_pendaftaran, tanggal_mulai_kp, tanggal_akhir_kp } = req.body;
    try {
        await db.execute(`
            INSERT INTO periode_kp (nama_periode, tanggal_mulai_pendaftaran, tanggal_akhir_pendaftaran, tanggal_mulai_kp, tanggal_akhir_kp, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `, [nama_periode, tanggal_mulai_pendaftaran, tanggal_akhir_pendaftaran, tanggal_mulai_kp, tanggal_akhir_kp]);
        res.redirect('/periodeKP');
    } catch (error) {
        console.error('Gagal tambah periode KP:', error);
        res.status(500).send('Gagal tambah data');
    }
});

router.get('/periodeKP/edit/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('SELECT * FROM periode_kp WHERE id = ?', [id]);
        if (result.length === 0) return res.status(404).send('Periode tidak ditemukan');

        res.render('pages/admin/edit_periodeKP', {
            layout: 'layouts/admin',
            title: 'Edit PeriodeKP',
            customCss: '/upload/admincss/edit_periodeKP.css',
            user: req.session.user || { name: 'Admin' },
            periode: result[0]
        });
    } catch (error) {
        console.error('Error ambil data periode KP:', error);
        res.status(500).send('Gagal mengambil data');
    }
});


router.post('/periodeKP/edit/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const {
        nama_periode,
        tanggal_mulai_pendaftaran,
        tanggal_akhir_pendaftaran,
        tanggal_mulai_kp,
        tanggal_akhir_kp,
    } = req.body;

    try {
        await db.execute(
            `UPDATE periode_kp SET nama_periode = ?,  tanggal_mulai_pendaftaran = ?, tanggal_akhir_pendaftaran = ?,  tanggal_mulai_kp = ?, tanggal_akhir_kp = ? WHERE id = ?`,
            [nama_periode, tanggal_mulai_pendaftaran, tanggal_akhir_pendaftaran, tanggal_mulai_kp, tanggal_akhir_kp,id]
        );
        res.redirect('/periodeKP');
    } catch (error) {
        console.error('Gagal update periode kP:', error);
        res.status(500).send('Gagal update data periode KP');
    }
});



router.get('/uploadDokumen', requireAuth, (req, res) => {
    const success = req.query.success === 'true';

    res.render('pages/admin/upload_dokumen', {
        layout: 'layouts/admin',
        title: 'Upload Dokumen',
        customCss: '/upload/admincss/upload_dokumen.css',
        user: req.session.user || { name: 'Admin' },
        success // <-- ini yang ditambahkan
    });
});


module.exports = router;