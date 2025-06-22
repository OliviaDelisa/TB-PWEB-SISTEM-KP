const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Informasi Penting API is working!',
    timestamp: new Date().toISOString()
  });
});

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'siprakti'
};

// Multer configuration for file uploads
const upload = multer({
  dest: path.join(__dirname, '../public/uploads/informasi/'),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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

// GET all informasi penting
router.get('/', async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.execute(`
      SELECT 
        ip.id,
        ip.judul,
        ip.isi,
        ip.gambar,
        ip.dosen_id,
        'Dosen Test' AS nama_dosen,
        ip.status,
        ip.tanggal_dibuat,
        ip.tanggal_diupdate
      FROM informasi_penting ip
      WHERE ip.status = 'aktif'
      ORDER BY ip.tanggal_dibuat DESC
    `);
    
    await connection.end();
    
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

// GET single informasi by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    const [rows] = await connection.execute(`
      SELECT 
        ip.id,
        ip.judul,
        ip.isi,
        ip.gambar,
        ip.dosen_id,
        'Dosen Test' AS nama_dosen,
        ip.status,
        ip.tanggal_dibuat,
        ip.tanggal_diupdate
      FROM informasi_penting ip
      WHERE ip.id = ? AND ip.status = 'aktif'
    `, [id]);
    
    await connection.end();
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Informasi tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching informasi by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching informasi',
      error: error.message
    });
  }
});

// POST create new informasi
router.post('/', upload.single('gambar'), async (req, res) => {
  try {
    console.log('POST /api/informasi-penting called');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { judul, isi, dosen_id = 1 } = req.body; // Default dosen_id = 1 for testing
    
    if (!judul || !isi) {
      console.log('Validation failed: missing judul or isi');
      return res.status(400).json({
        success: false,
        message: 'Judul dan isi informasi harus diisi'
      });
    }
    
    console.log('Creating database connection...');
    const connection = await createConnection();
    console.log('Database connection created');
    
    // Handle file upload
    let gambarPath = null;
    if (req.file) {
      gambarPath = `/uploads/informasi/${req.file.filename}`;
      console.log('File uploaded:', gambarPath);
    } else {
      console.log('No file uploaded');
    }
    
    console.log('Executing INSERT query...');
    const [result] = await connection.execute(`
      INSERT INTO informasi_penting (judul, isi, gambar, dosen_id, status)
      VALUES (?, ?, ?, ?, 'aktif')
    `, [judul, isi, gambarPath, dosen_id]);
    
    console.log('INSERT result:', result);
    await connection.end();
    console.log('Database connection closed');
    
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
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating informasi',
      error: error.message
    });
  }
});

// PUT update informasi
router.put('/:id', upload.single('gambar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, isi, dosen_id = 1 } = req.body;
    
    if (!judul || !isi) {
      return res.status(400).json({
        success: false,
        message: 'Judul dan isi informasi harus diisi'
      });
    }
    
    const connection = await createConnection();
    
    // Get current informasi to check if image exists
    const [currentInfo] = await connection.execute(`
      SELECT gambar FROM informasi_penting WHERE id = ?
    `, [id]);
    
    if (currentInfo.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Informasi tidak ditemukan'
      });
    }
    
    let gambarPath = currentInfo[0].gambar;
    
    // Handle new file upload
    if (req.file) {
      // Delete old image if exists
      if (currentInfo[0].gambar) {
        const oldImagePath = path.join(__dirname, '../public', currentInfo[0].gambar);
        try {
          await fs.unlink(oldImagePath);
        } catch (error) {
          console.log('Old image not found or already deleted');
        }
      }
      
      gambarPath = `/uploads/informasi/${req.file.filename}`;
    }
    
    const [result] = await connection.execute(`
      UPDATE informasi_penting 
      SET judul = ?, isi = ?, gambar = ?, dosen_id = ?, tanggal_diupdate = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [judul, isi, gambarPath, dosen_id, id]);
    
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Informasi tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Informasi berhasil diupdate',
      data: {
        id: parseInt(id),
        judul,
        isi,
        gambar: gambarPath,
        dosen_id
      }
    });
  } catch (error) {
    console.error('Error updating informasi:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating informasi',
      error: error.message
    });
  }
});

// DELETE informasi (soft delete by setting status to nonaktif)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    const [result] = await connection.execute(`
      UPDATE informasi_penting 
      SET status = 'nonaktif', tanggal_diupdate = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);
    
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Informasi tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Informasi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting informasi:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting informasi',
      error: error.message
    });
  }
});

// GET image file
router.get('/image/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, '../public/uploads/informasi', filename);
  
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  });
});

module.exports = router; 