const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Ambil semua mahasiswa bimbingan untuk dosen tertentu
router.get('/:dosenId', (req, res) => {
    const dosenId = req.params.dosenId;
    
    const query = `
        SELECT 
            mb.id as bimbingan_id,
            m.id as mahasiswa_id,
            m.nim,
            m.nama,
            m.email,
            m.angkatan,
            mb.status,
            mb.tanggal_mulai,
            mb.tanggal_selesai,
            mb.catatan,
            d.nama as dosen_nama,
            d.gelar as dosen_gelar
        FROM mahasiswa_bimbingan mb
        JOIN mahasiswa m ON mb.mahasiswa_id = m.id
        JOIN dosen d ON mb.dosen_id = d.id
        WHERE mb.dosen_id = ? AND mb.status = 'aktif'
        ORDER BY m.nama
    `;
    
    db.query(query, [dosenId], (err, results) => {
        if (err) {
            console.error('Error fetching mahasiswa bimbingan:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Terjadi kesalahan server',
                error: err.message 
            });
        }
        
        res.json({
            success: true,
            data: results
        });
    });
});

// GET - Ambil semua mahasiswa yang belum dibimbing oleh dosen tertentu
router.get('/available/:dosenId', (req, res) => {
    const dosenId = req.params.dosenId;
    
    const query = `
        SELECT 
            m.id,
            m.nim,
            m.nama,
            m.email,
            m.angkatan,
            m.status
        FROM mahasiswa m
        WHERE m.id NOT IN (
            SELECT mahasiswa_id 
            FROM mahasiswa_bimbingan 
            WHERE dosen_id = ? AND status = 'aktif'
        ) AND m.status = 'aktif'
        ORDER BY m.nama
    `;
    
    db.query(query, [dosenId], (err, results) => {
        if (err) {
            console.error('Error fetching available mahasiswa:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Terjadi kesalahan server',
                error: err.message 
            });
        }
        
        res.json({
            success: true,
            data: results
        });
    });
});

// POST - Tambah mahasiswa bimbingan baru
router.post('/', (req, res) => {
    const { dosen_id, mahasiswa_id, catatan } = req.body;
    
    if (!dosen_id || !mahasiswa_id) {
        return res.status(400).json({
            success: false,
            message: 'Dosen ID dan Mahasiswa ID harus diisi'
        });
    }
    
    // Cek apakah mahasiswa sudah dibimbing oleh dosen ini
    const checkQuery = `
        SELECT id FROM mahasiswa_bimbingan 
        WHERE dosen_id = ? AND mahasiswa_id = ? AND status = 'aktif'
    `;
    
    db.query(checkQuery, [dosen_id, mahasiswa_id], (err, results) => {
        if (err) {
            console.error('Error checking existing bimbingan:', err);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server',
                error: err.message
            });
        }
        
        if (results.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Mahasiswa sudah dibimbing oleh dosen ini'
            });
        }
        
        // Tambah mahasiswa bimbingan baru
        const insertQuery = `
            INSERT INTO mahasiswa_bimbingan (dosen_id, mahasiswa_id, catatan, tanggal_mulai)
            VALUES (?, ?, ?, CURRENT_DATE)
        `;
        
        db.query(insertQuery, [dosen_id, mahasiswa_id, catatan || ''], (err, result) => {
            if (err) {
                console.error('Error adding mahasiswa bimbingan:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan server',
                    error: err.message
                });
            }
            
            res.json({
                success: true,
                message: 'Mahasiswa berhasil ditambahkan ke daftar bimbingan',
                data: {
                    id: result.insertId,
                    dosen_id,
                    mahasiswa_id
                }
            });
        });
    });
});

// PUT - Update data mahasiswa bimbingan
router.put('/:bimbinganId', (req, res) => {
    const bimbinganId = req.params.bimbinganId;
    const { nim, nama, email, angkatan } = req.body;
    
    if (!nim || !nama) {
        return res.status(400).json({
            success: false,
            message: 'NIM dan nama harus diisi'
        });
    }
    
    // Ambil mahasiswa_id dari bimbingan
    const getMahasiswaQuery = `
        SELECT mahasiswa_id FROM mahasiswa_bimbingan WHERE id = ?
    `;
    
    db.query(getMahasiswaQuery, [bimbinganId], (err, results) => {
        if (err) {
            console.error('Error getting mahasiswa_id:', err);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server',
                error: err.message
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data bimbingan tidak ditemukan'
            });
        }
        
        const mahasiswaId = results[0].mahasiswa_id;
        
        // Update data mahasiswa
        const updateQuery = `
            UPDATE mahasiswa 
            SET nim = ?, nama = ?, email = ?, angkatan = ?
            WHERE id = ?
        `;
        
        db.query(updateQuery, [nim, nama, email, angkatan, mahasiswaId], (err, result) => {
            if (err) {
                console.error('Error updating mahasiswa:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan server',
                    error: err.message
                });
            }
            
            res.json({
                success: true,
                message: 'Data mahasiswa berhasil diperbarui'
            });
        });
    });
});

// DELETE - Hapus mahasiswa dari bimbingan (soft delete)
router.delete('/:bimbinganId', (req, res) => {
    const bimbinganId = req.params.bimbinganId;
    
    const query = `
        UPDATE mahasiswa_bimbingan 
        SET status = 'selesai', tanggal_selesai = CURRENT_DATE
        WHERE id = ?
    `;
    
    db.query(query, [bimbinganId], (err, result) => {
        if (err) {
            console.error('Error deleting mahasiswa bimbingan:', err);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server',
                error: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data bimbingan tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            message: 'Mahasiswa berhasil dihapus dari daftar bimbingan'
        });
    });
});

// GET - Cari mahasiswa berdasarkan NIM
router.get('/search/:nim', (req, res) => {
    const nim = req.params.nim;
    
    const query = `
        SELECT id, nim, nama, email, angkatan, status
        FROM mahasiswa
        WHERE nim LIKE ? AND status = 'aktif'
        ORDER BY nama
    `;
    
    db.query(query, [`%${nim}%`], (err, results) => {
        if (err) {
            console.error('Error searching mahasiswa:', err);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server',
                error: err.message
            });
        }
        
        res.json({
            success: true,
            data: results
        });
    });
});

// GET - Statistik bimbingan untuk dosen
router.get('/stats/:dosenId', (req, res) => {
    const dosenId = req.params.dosenId;
    
    const query = `
        SELECT 
            COUNT(*) as total_mahasiswa,
            COUNT(CASE WHEN status = 'aktif' THEN 1 END) as mahasiswa_aktif,
            COUNT(CASE WHEN status = 'selesai' THEN 1 END) as mahasiswa_selesai,
            AVG(m.ipk) as rata_rata_ipk
        FROM mahasiswa_bimbingan mb
        JOIN mahasiswa m ON mb.mahasiswa_id = m.id
        WHERE mb.dosen_id = ?
    `;
    
    db.query(query, [dosenId], (err, results) => {
        if (err) {
            console.error('Error fetching stats:', err);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server',
                error: err.message
            });
        }
        
        res.json({
            success: true,
            data: results[0]
        });
    });
});

module.exports = router; 