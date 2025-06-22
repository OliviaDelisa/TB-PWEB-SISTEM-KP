const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Mendapatkan semua jadwal seminar (yang akan datang)
router.get('/jadwal', async (req, res) => {
    try {
        const { sort = 'date', order = 'asc' } = req.query;
        
        let orderBy = 's.tanggal_seminar ASC'; // default sorting
        
        // Handle different sorting options
        switch (sort) {
            case 'name':
                orderBy = `m.nama ${order.toUpperCase()}`;
                break;
            case 'date':
                orderBy = `s.tanggal_seminar ${order.toUpperCase()}`;
                break;
            default:
                orderBy = `s.tanggal_seminar ASC`;
        }
        
        const query = `
            SELECT 
                s.id,
                s.judul_seminar,
                s.tanggal_seminar,
                s.lokasi,
                s.status,
                m.nama as nama_mahasiswa,
                m.nim,
                d.nama as nama_dosen
            FROM seminar s
            JOIN mahasiswa_bimbingan mb ON s.mahasiswa_bimbingan_id = mb.id
            JOIN mahasiswa m ON mb.mahasiswa_id = m.id
            JOIN dosen d ON mb.dosen_id = d.id
            WHERE s.status = 'jadwal'
            ORDER BY ${orderBy}
        `;
        
        db.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching seminar schedule:', error);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - Mendapatkan riwayat seminar (yang sudah selesai)
router.get('/riwayat', async (req, res) => {
    try {
        const { sort = 'date', order = 'desc' } = req.query;
        
        let orderBy = 's.tanggal_seminar DESC'; // default sorting for history
        
        // Handle different sorting options
        switch (sort) {
            case 'name':
                orderBy = `m.nama ${order.toUpperCase()}`;
                break;
            case 'date':
                orderBy = `s.tanggal_seminar ${order.toUpperCase()}`;
                break;
            case 'score':
                orderBy = `ns.nilai ${order.toUpperCase()}`;
                break;
            default:
                orderBy = `s.tanggal_seminar DESC`;
        }
        
        const query = `
            SELECT 
                s.id,
                s.judul_seminar,
                s.tanggal_seminar,
                s.lokasi,
                s.status,
                m.nama as nama_mahasiswa,
                m.nim,
                d.nama as nama_dosen,
                ns.nilai,
                ns.keterangan,
                ns.tanggal_penilaian
            FROM seminar s
            JOIN mahasiswa_bimbingan mb ON s.mahasiswa_bimbingan_id = mb.id
            JOIN mahasiswa m ON mb.mahasiswa_id = m.id
            JOIN dosen d ON mb.dosen_id = d.id
            LEFT JOIN nilai_seminar ns ON s.id = ns.seminar_id
            WHERE s.status = 'selesai'
            ORDER BY ${orderBy}
        `;
        
        db.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching seminar history:', error);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST - Menambah jadwal seminar baru
router.post('/jadwal', async (req, res) => {
    try {
        const { mahasiswa_bimbingan_id, judul_seminar, tanggal_seminar, lokasi } = req.body;
        
        if (!mahasiswa_bimbingan_id || !judul_seminar || !tanggal_seminar) {
            return res.status(400).json({ error: 'Semua field wajib diisi' });
        }
        
        const query = `
            INSERT INTO seminar (mahasiswa_bimbingan_id, judul_seminar, tanggal_seminar, lokasi, status)
            VALUES (?, ?, ?, ?, 'jadwal')
        `;
        
        db.query(query, [mahasiswa_bimbingan_id, judul_seminar, tanggal_seminar, lokasi], (error, results) => {
            if (error) {
                console.error('Error adding seminar:', error);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ 
                message: 'Jadwal seminar berhasil ditambahkan',
                id: results.insertId 
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT - Mengubah status seminar menjadi selesai
router.put('/selesai/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `UPDATE seminar SET status = 'selesai' WHERE id = ?`;
        
        db.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error updating seminar status:', error);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Seminar tidak ditemukan' });
            }
            
            res.json({ message: 'Status seminar berhasil diubah menjadi selesai' });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST - Input nilai seminar
router.post('/nilai', async (req, res) => {
    try {
        const { seminar_id, dosen_id, nilai, keterangan } = req.body;
        
        if (!seminar_id || !dosen_id || !nilai) {
            return res.status(400).json({ error: 'Seminar ID, Dosen ID, dan Nilai wajib diisi' });
        }
        
        // Validasi nilai (0-100)
        const nilaiNum = parseFloat(nilai);
        if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
            return res.status(400).json({ error: 'Nilai harus antara 0-100' });
        }
        
        // Cek apakah sudah ada nilai untuk seminar dan dosen ini
        const checkQuery = `SELECT id FROM nilai_seminar WHERE seminar_id = ? AND dosen_id = ?`;
        
        db.query(checkQuery, [seminar_id, dosen_id], (checkError, checkResults) => {
            if (checkError) {
                console.error('Error checking existing nilai:', checkError);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (checkResults.length > 0) {
                // Update nilai yang sudah ada
                const updateQuery = `
                    UPDATE nilai_seminar 
                    SET nilai = ?, keterangan = ?, tanggal_penilaian = CURRENT_TIMESTAMP
                    WHERE seminar_id = ? AND dosen_id = ?
                `;
                
                db.query(updateQuery, [nilai, keterangan, seminar_id, dosen_id], (updateError, updateResults) => {
                    if (updateError) {
                        console.error('Error updating nilai:', updateError);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json({ message: 'Nilai seminar berhasil diperbarui' });
                });
            } else {
                // Insert nilai baru
                const insertQuery = `
                    INSERT INTO nilai_seminar (seminar_id, dosen_id, nilai, keterangan)
                    VALUES (?, ?, ?, ?)
                `;
                
                db.query(insertQuery, [seminar_id, dosen_id, nilai, keterangan], (insertError, insertResults) => {
                    if (insertError) {
                        console.error('Error inserting nilai:', insertError);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json({ 
                        message: 'Nilai seminar berhasil disimpan',
                        id: insertResults.insertId 
                    });
                });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - Mendapatkan detail nilai seminar
router.get('/nilai/:seminar_id', async (req, res) => {
    try {
        const { seminar_id } = req.params;
        
        const query = `
            SELECT 
                ns.id,
                ns.nilai,
                ns.keterangan,
                ns.tanggal_penilaian,
                d.nama as nama_dosen,
                d.nip
            FROM nilai_seminar ns
            JOIN dosen d ON ns.dosen_id = d.id
            WHERE ns.seminar_id = ?
        `;
        
        db.query(query, [seminar_id], (error, results) => {
            if (error) {
                console.error('Error fetching nilai:', error);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET - Mendapatkan daftar mahasiswa bimbingan untuk dropdown
router.get('/mahasiswa-bimbingan', async (req, res) => {
    try {
        const query = `
            SELECT 
                mb.id,
                m.nama as nama_mahasiswa,
                m.nim,
                d.nama as nama_dosen
            FROM mahasiswa_bimbingan mb
            JOIN mahasiswa m ON mb.mahasiswa_id = m.id
            JOIN dosen d ON mb.dosen_id = d.id
            WHERE mb.status = 'aktif'
            ORDER BY m.nama ASC
        `;
        
        db.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching mahasiswa bimbingan:', error);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 