const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/materi';
    // Buat direktori jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate nama file unik dengan timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, 'materi-' + uniqueSuffix + path.extname(originalName));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Batas 10MB
  },
  fileFilter: function (req, file, cb) {
    // Filter tipe file yang diizinkan
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak diizinkan. Hanya PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG yang diizinkan.'), false);
    }
  }
});

// GET - Ambil semua materi bimbingan untuk dosen tertentu
router.get('/:dosenId', (req, res) => {
  const dosenId = req.params.dosenId;
  
  const query = `
    SELECT 
      id,
      judul,
      deskripsi,
      nama_file,
      ukuran_file,
      tipe_file,
      path_file,
      status,
      created_at,
      updated_at
    FROM materi_bimbingan
    WHERE dosen_id = ? AND status = 'aktif'
    ORDER BY created_at DESC
  `;
  
  db.query(query, [dosenId], (err, results) => {
    if (err) {
      console.error('Error fetching materi bimbingan:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server',
        error: err.message 
      });
    }
    
    // Format ukuran file ke MB
    const formattedResults = results.map(item => ({
      ...item,
      ukuran_file_mb: (item.ukuran_file / (1024 * 1024)).toFixed(2)
    }));
    
    res.json({
      success: true,
      data: formattedResults
    });
  });
});

// POST - Tambah materi bimbingan baru
router.post('/', upload.single('file'), (req, res) => {
  console.log('Received upload request:', req.body);
  console.log('File received:', req.file);
  
  const { dosen_id, judul, deskripsi } = req.body;
  const file = req.file;
  
  if (!dosen_id || !judul || !file) {
    console.log('Validation failed:', { dosen_id, judul, hasFile: !!file });
    return res.status(400).json({
      success: false,
      message: 'Dosen ID, judul, dan file harus diisi'
    });
  }
  
  const fileData = {
    dosen_id: parseInt(dosen_id),
    judul: judul,
    deskripsi: deskripsi || '',
    nama_file: file.originalname,
    ukuran_file: file.size,
    tipe_file: file.mimetype,
    path_file: '/uploads/materi/' + file.filename
  };
  
  console.log('File data to be inserted:', fileData);
  
  const query = `
    INSERT INTO materi_bimbingan 
    (dosen_id, judul, deskripsi, nama_file, ukuran_file, tipe_file, path_file)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [
    fileData.dosen_id,
    fileData.judul,
    fileData.deskripsi,
    fileData.nama_file,
    fileData.ukuran_file,
    fileData.tipe_file,
    fileData.path_file
  ], (err, result) => {
    if (err) {
      console.error('Error adding materi bimbingan:', err);
      // Hapus file jika gagal insert ke database
      if (fs.existsSync('public' + fileData.path_file)) {
        fs.unlinkSync('public' + fileData.path_file);
      }
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: err.message
      });
    }
    
    console.log('Successfully inserted materi bimbingan with ID:', result.insertId);
    
    res.json({
      success: true,
      message: 'Materi bimbingan berhasil ditambahkan',
      data: {
        id: result.insertId,
        ...fileData,
        ukuran_file_mb: (fileData.ukuran_file / (1024 * 1024)).toFixed(2)
      }
    });
  });
});

// PUT - Update materi bimbingan
router.put('/:id', upload.single('file'), (req, res) => {
  console.log('=== EDIT REQUEST START ===');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  console.log('Request params:', req.params);
  
  const materiId = req.params.id;
  const { judul, deskripsi } = req.body;
  const newFile = req.file;
  
  // Validasi input
  if (!materiId || isNaN(materiId)) {
    console.log('Invalid materi ID:', materiId);
    return res.status(400).json({
      success: false,
      message: 'ID materi bimbingan tidak valid'
    });
  }
  
  if (!judul || judul.trim() === '') {
    console.log('Empty judul');
    return res.status(400).json({
      success: false,
      message: 'Judul harus diisi'
    });
  }
  
  // Jika ada file baru, update file juga
  if (newFile) {
    console.log('Processing file update for materi ID:', materiId);
    console.log('New file info:', {
      originalname: newFile.originalname,
      filename: newFile.filename,
      size: newFile.size,
      mimetype: newFile.mimetype
    });
    
    // Validasi file
    if (!newFile.originalname || !newFile.filename) {
      console.log('Invalid file data');
      return res.status(400).json({
        success: false,
        message: 'File tidak valid'
      });
    }
    
    // Ambil informasi file lama
    const getOldFileQuery = `
      SELECT path_file, nama_file FROM materi_bimbingan WHERE id = ?
    `;
    
    db.query(getOldFileQuery, [materiId], (err, results) => {
      if (err) {
        console.error('Database error getting old file info:', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan server',
          error: err.message
        });
      }
      
      if (results.length === 0) {
        console.log('Materi not found with ID:', materiId);
        return res.status(404).json({
          success: false,
          message: 'Materi bimbingan tidak ditemukan'
        });
      }
      
      const oldFilePath = results[0].path_file;
      const oldFileName = results[0].nama_file;
      console.log('Old file info:', { path: oldFilePath, name: oldFileName });
      
      // Update dengan file baru
      const updateQuery = `
        UPDATE materi_bimbingan 
        SET judul = ?, deskripsi = ?, nama_file = ?, ukuran_file = ?, tipe_file = ?, path_file = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const newFileData = {
        nama_file: newFile.originalname,
        ukuran_file: newFile.size,
        tipe_file: newFile.mimetype,
        path_file: '/uploads/materi/' + newFile.filename
      };
      
      console.log('New file data to be saved:', newFileData);
      
      db.query(updateQuery, [
        judul.trim(), 
        deskripsi ? deskripsi.trim() : '', 
        newFileData.nama_file,
        newFileData.ukuran_file,
        newFileData.tipe_file,
        newFileData.path_file,
        materiId
      ], (err, result) => {
        if (err) {
          console.error('Database error updating materi:', err);
          // Hapus file baru jika gagal update
          const newFilePath = 'public' + newFileData.path_file;
          if (fs.existsSync(newFilePath)) {
            try {
              fs.unlinkSync(newFilePath);
              console.log('Cleaned up new file after error:', newFilePath);
            } catch (cleanupErr) {
              console.error('Error cleaning up new file:', cleanupErr);
            }
          }
          return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: err.message
          });
        }
        
        console.log('Successfully updated materi bimbingan with file. Affected rows:', result.affectedRows);
        
        // Hapus file lama jika ada
        if (oldFilePath) {
          const fullOldPath = 'public' + oldFilePath;
          if (fs.existsSync(fullOldPath)) {
            try {
              fs.unlinkSync(fullOldPath);
              console.log('Old file deleted:', fullOldPath);
            } catch (deleteErr) {
              console.error('Error deleting old file:', deleteErr);
            }
          } else {
            console.log('Old file not found at:', fullOldPath);
          }
        }
        
        console.log('=== EDIT REQUEST SUCCESS ===');
        res.json({
          success: true,
          message: 'Materi bimbingan berhasil diperbarui dengan file baru'
        });
      });
    });
  } else {
    console.log('Processing text-only update for materi ID:', materiId);
    
    // Update tanpa file baru
    const query = `
      UPDATE materi_bimbingan 
      SET judul = ?, deskripsi = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.query(query, [judul.trim(), deskripsi ? deskripsi.trim() : '', materiId], (err, result) => {
      if (err) {
        console.error('Database error updating materi (text only):', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan server',
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        console.log('No rows affected for materi ID:', materiId);
        return res.status(404).json({
          success: false,
          message: 'Materi bimbingan tidak ditemukan'
        });
      }
      
      console.log('Successfully updated materi bimbingan (text only). Affected rows:', result.affectedRows);
      console.log('=== EDIT REQUEST SUCCESS ===');
      
      res.json({
        success: true,
        message: 'Materi bimbingan berhasil diperbarui'
      });
    });
  }
});

// DELETE - Hapus materi bimbingan (soft delete)
router.delete('/:id', (req, res) => {
  const materiId = req.params.id;
  
  // Ambil informasi file sebelum dihapus
  const getFileQuery = `
    SELECT path_file FROM materi_bimbingan WHERE id = ?
  `;
  
  db.query(getFileQuery, [materiId], (err, results) => {
    if (err) {
      console.error('Error getting file info:', err);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: err.message
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Materi bimbingan tidak ditemukan'
      });
    }
    
    const filePath = results[0].path_file;
    
    // Soft delete dengan mengubah status
    const deleteQuery = `
      UPDATE materi_bimbingan 
      SET status = 'nonaktif', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.query(deleteQuery, [materiId], (err, result) => {
      if (err) {
        console.error('Error deleting materi bimbingan:', err);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan server',
          error: err.message
        });
      }
      
      // Hapus file fisik dari server
      const fullPath = 'public' + filePath;
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      
      res.json({
        success: true,
        message: 'Materi bimbingan berhasil dihapus'
      });
    });
  });
});

// GET - Download file materi bimbingan
router.get('/download/:id', (req, res) => {
  const materiId = req.params.id;
  
  const query = `
    SELECT nama_file, path_file, tipe_file 
    FROM materi_bimbingan 
    WHERE id = ? AND status = 'aktif'
  `;
  
  db.query(query, [materiId], (err, results) => {
    if (err) {
      console.error('Error getting file info:', err);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File tidak ditemukan'
      });
    }
    
    const fileInfo = results[0];
    const filePath = 'public' + fileInfo.path_file;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File tidak ditemukan di server'
      });
    }
    
    // Set header untuk download
    res.setHeader('Content-Type', fileInfo.tipe_file);
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.nama_file}"`);
    
    // Stream file ke response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

// Error handling untuk multer
router.use((error, req, res, next) => {
  console.error('Multer error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file terlalu besar. Maksimal 10MB.'
      });
    }
  }
  
  if (error.message.includes('Tipe file tidak diizinkan')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  // Default error
  return res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan saat upload file',
    error: error.message
  });
});

module.exports = router; 