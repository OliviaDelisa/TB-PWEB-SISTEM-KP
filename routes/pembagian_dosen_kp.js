const express = require('express');
const router = express.Router();
const db = require('../config/db');
const path = require('path');
const ejs = require('ejs');
const pdf = require('html-pdf');

router.get('/', (req, res) => {
  const q = req.query.q || ''; // ambil nilai pencarian dari query string

  let sql = `
    SELECT m.nim, m.nama AS nama_mahasiswa, p.nama_perusahaan, d.nama AS nama_dosen
    FROM pembimbing_kp pk
    JOIN mahasiswa m ON pk.mahasiswa_id = m.id
    LEFT JOIN pengajuan_kp pj ON pj.mahasiswa_id = m.id
    LEFT JOIN perusahaan p ON pj.perusahaan_id = p.id
    JOIN dosen d ON pk.dosen_id = d.id
  `;

  let params = [];

  if (q) {
    sql += `
      WHERE m.nama LIKE ? 
      OR m.nim LIKE ?
      OR p.nama_perusahaan LIKE ? 
      OR d.nama LIKE ?
    `;
    const wildcard = `%${q}%`;
    params = [wildcard, wildcard, wildcard, wildcard];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.send("Terjadi kesalahan saat mengambil data");
    }

    res.render('pages/pembagian_dosen_kp', {
      layout: 'layouts/main',
      title: 'Pembagian Dosen KP',
      customCss: '/upload/pembagian_dosen_kp.css',
      data: results,
      query: q
    });
  });
});

router.get('/download-pdf', (req, res) => {
  const q = req.query.q || '';

  let sql = `
    SELECT m.nim, m.nama AS nama_mahasiswa, p.nama_perusahaan, d.nama AS nama_dosen
    FROM pembimbing_kp pk
    JOIN mahasiswa m ON pk.mahasiswa_id = m.id
    LEFT JOIN pengajuan_kp pj ON pj.mahasiswa_id = m.id
    LEFT JOIN perusahaan p ON pj.perusahaan_id = p.id
    JOIN dosen d ON pk.dosen_id = d.id
  `;

  let params = [];

  if (q) {
    sql += ` WHERE m.nama LIKE ? OR m.nim LIKE ? OR p.nama_perusahaan LIKE ? OR d.nama LIKE ?`;
    const wildcard = `%${q}%`;
    params = [wildcard, wildcard, wildcard, wildcard];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Gagal mengambil data');
    }

    const templatePath = path.join(__dirname, '../views/pdf/pembagian_dosen_kp_pdf.ejs');

    ejs.renderFile(templatePath, { data: results }, (err, html) => {
      if (err) {
        console.error('Render EJS error:', err);
        return res.status(500).send('Gagal render HTML untuk PDF');
      }

      const options = {
        format: 'A4',
        orientation: 'portrait',
        border: '10mm'
      };

      pdf.create(html, options).toStream((err, stream) => {
        if (err) {
          console.error('PDF generation error:', err);
          return res.status(500).send('Gagal membuat PDF');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="pembagian_dosen_kp.pdf"');
        stream.pipe(res);
      });
    });
  });
});



module.exports = router;
