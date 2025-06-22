const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'siprakti'
};

// Simple multer configuration
const upload = multer({
  dest: path.join(__dirname, '../public/uploads/informasi/'),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('gambar');

// Helper function to create database connection
async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Informasi Penting API is working!',
    timestamp: new Date().toISOString()
  });
});

// GET all informasi penting
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/informasi-penting called');
    const connection = await createConnection();
    
    const [rows] = await connection.execute(`
      SELECT 
        id,
        judul,
        isi,
        gambar,
        dosen_id,
        status,
        tanggal_dibuat,
        tanggal_diupdate
      FROM informasi_penting
      WHERE status = 'aktif'
      ORDER BY tanggal_dibuat DESC
    `);
    
    await connection.end();
    
    console.log('Found', rows.length, 'records');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching informasi:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching informasi',
      error: error.message
    });
  }
});

// POST create new informasi (simplified)
router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    }

    try {
      console.log('POST /api/informasi-penting called');
      console.log('Request body:', req.body);
      console.log('Request file:', req.file);
      
      const { judul, isi, dosen_id = 1 } = req.body;
      
      if (!judul || !isi) {
        return res.status(400).json({
          success: false,
          message: 'Judul dan isi informasi harus diisi'
        });
      }
      
      const connection = await createConnection();
      
      // Handle file upload
      let gambarPath = null;
      if (req.file) {
        gambarPath = `/uploads/informasi/${req.file.filename}`;
      }
      
      const [result] = await connection.execute(`
        INSERT INTO informasi_penting (judul, isi, gambar, dosen_id, status)
        VALUES (?, ?, ?, ?, 'aktif')
      `, [judul, isi, gambarPath, dosen_id]);
      
      await connection.end();
      
      res.status(201).json({
        success: true,
        message: 'Informasi berhasil ditambahkan',
        data: {
          id: result.insertId,
          judul,
          isi,
          gambar: gambarPath,
          dosen_id
        }
      });
    } catch (error) {
      console.error('Error creating informasi:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating informasi',
        error: error.message
      });
    }
  });
});

module.exports = router; 