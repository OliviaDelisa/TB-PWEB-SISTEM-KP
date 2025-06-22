const express = require('express');
const router = express.Router();
const db = require('../config/db');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');

router.get('/', (req, res) => {
  const keyword = req.query.cari || '';

  const query = `
    SELECT 
      m.nama AS nama,
      m.nim,
      d.nama AS dosen,
      d.nip
    FROM pembimbing_kp pkp
    JOIN mahasiswa m ON pkp.mahasiswa_id = m.id
    JOIN dosen d ON pkp.dosen_id = d.id
    WHERE m.nama LIKE ? OR m.nim LIKE ? OR d.nama LIKE ? OR d.nip LIKE ?
  `;

  const likeKeyword = `%${keyword}%`;

  db.query(query, [likeKeyword, likeKeyword, likeKeyword, likeKeyword], (err, results) => {
    if (err) {
      console.error('Gagal mengambil data dospem:', err);
      return res.status(500).send('Gagal mengambil data');
    }

    res.render('pages/daftarDosenPembimbing', {
      layout: 'layout/main',
      title: 'Daftar Dosen Pembimbing',
      customCss: '/upload/daftarDosenPembimbing.css',
      dospemList: results,
      keyword
    });
  });
});

// Route untuk cetak PDF
router.get('/cetak-pdf', async (req, res) => {
  const query = `
    SELECT 
      m.nama AS nama_mahasiswa,
      m.nim,
      d.nama AS nama_dosen,
      d.nip
    FROM pembimbing_kp pkp
    JOIN mahasiswa m ON pkp.mahasiswa_id = m.id
    JOIN dosen d ON pkp.dosen_id = d.id
  `;

  db.query(query, async (err, results) => {
    if (err) {
      console.error('Gagal mengambil data dospem:', err);
      return res.status(500).send('Gagal mengambil data');
    }

    try {
      const html = await ejs.renderFile(
        path.join(__dirname, '../pdf/pdfTemplate.ejs'),
        { dospemList: results }
      );

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true
      });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="daftar-dosen-pembimbing.pdf"');
      res.send(pdfBuffer);
    } catch (e) {
      console.error('Gagal membuat PDF:', e);
      res.status(500).send('Gagal membuat PDF');
    }
  });
});

module.exports = router;
