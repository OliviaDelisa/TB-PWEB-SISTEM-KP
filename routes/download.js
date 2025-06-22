const express = require('express');
const path = require('path');
const router = express.Router();

// DOWNLOAD FILE DARI NAMA
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/uploads', filename);

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Gagal download:', err.message);
      res.status(404).send('File tidak ditemukan.');
    }
  });
});

module.exports = router;
