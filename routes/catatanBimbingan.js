const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET: Mendapatkan semua catatan bimbingan untuk mahasiswa tertentu
router.get('/:mahasiswaId', async (req, res) => {
    try {
        const { mahasiswaId } = req.params;
        
        const query = `
            SELECT 
                cb.id,
                cb.tanggal_bimbingan,
                cb.waktu_mulai,
                cb.waktu_selesai,
                cb.topik_bimbingan,
                cb.catatan,
                cb.progress,
                cb.status,
                cb.created_at,
                m.nim,
                m.nama as mahasiswa_nama,
                d.nama as dosen_nama
            FROM catatan_bimbingan cb
            JOIN mahasiswa m ON cb.mahasiswa_id = m.id
            JOIN dosen d ON cb.dosen_id = d.id
            WHERE cb.mahasiswa_id = ?
            ORDER BY cb.tanggal_bimbingan DESC, cb.created_at DESC
        `;
        
        db.query(query, [mahasiswaId], (error, rows) => {
            if (error) {
                console.error('Error fetching catatan bimbingan:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan saat mengambil data catatan bimbingan'
                });
            }
            
            res.json({
                success: true,
                data: rows
            });
        });
    } catch (error) {
        console.error('Error fetching catatan bimbingan:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data catatan bimbingan'
        });
    }
});

// GET: Mendapatkan detail mahasiswa untuk identitas
router.get('/mahasiswa-detail/:mahasiswaId', async (req, res) => {
    try {
        const { mahasiswaId } = req.params;
        
        const query = `
            SELECT 
                m.id,
                m.nim,
                m.nama,
                m.email,
                m.jurusan,
                m.angkatan,
                m.semester,
                m.ipk,
                m.status,
                d.nama as dosen_nama,
                d.gelar as dosen_gelar
            FROM mahasiswa m
            LEFT JOIN mahasiswa_bimbingan mb ON m.id = mb.mahasiswa_id
            LEFT JOIN dosen d ON mb.dosen_id = d.id
            WHERE m.id = ?
        `;
        
        db.query(query, [mahasiswaId], (error, rows) => {
            if (error) {
                console.error('Error fetching mahasiswa detail:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan saat mengambil data mahasiswa'
                });
            }
            
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Mahasiswa tidak ditemukan'
                });
            }
            
            res.json({
                success: true,
                data: rows[0]
            });
        });
    } catch (error) {
        console.error('Error fetching mahasiswa detail:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data mahasiswa'
        });
    }
});

// POST: Menambah catatan bimbingan baru
router.post('/', async (req, res) => {
    try {
        const {
            dosen_id,
            mahasiswa_id,
            tanggal_bimbingan,
            waktu_mulai,
            waktu_selesai,
            topik_bimbingan,
            catatan,
            progress,
            status
        } = req.body;

        console.log('Received data:', req.body); // Debug log
        console.log('Tanggal bimbingan type:', typeof tanggal_bimbingan);
        console.log('Tanggal bimbingan value:', tanggal_bimbingan);

        // Validasi input
        if (!mahasiswa_id || !dosen_id || !tanggal_bimbingan || !topik_bimbingan || !catatan) {
            return res.status(400).json({
                success: false,
                message: 'Data wajib tidak boleh kosong'
            });
        }

        // Pastikan format tanggal benar (YYYY-MM-DD)
        let formattedTanggal = tanggal_bimbingan;
        if (tanggal_bimbingan && typeof tanggal_bimbingan === 'string') {
            // Jika tanggal dalam format ISO string, ambil hanya bagian date
            if (tanggal_bimbingan.includes('T')) {
                formattedTanggal = tanggal_bimbingan.split('T')[0];
            }
        }

        console.log('Formatted tanggal:', formattedTanggal);

        // Cari mahasiswa_bimbingan_id berdasarkan dosen_id dan mahasiswa_id
        const findBimbinganQuery = `
            SELECT id FROM mahasiswa_bimbingan 
            WHERE dosen_id = ? AND mahasiswa_id = ? AND status = 'aktif'
            LIMIT 1
        `;

        db.query(findBimbinganQuery, [dosen_id, mahasiswa_id], (error, bimbinganRows) => {
            if (error) {
                console.error('Error finding mahasiswa_bimbingan:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan saat mencari data bimbingan',
                    error: error.message
                });
            }

            if (bimbinganRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tidak ditemukan relasi bimbingan aktif antara dosen dan mahasiswa ini'
                });
            }

            const mahasiswa_bimbingan_id = bimbinganRows[0].id;

            const insertQuery = `
                INSERT INTO catatan_bimbingan 
                (mahasiswa_bimbingan_id, dosen_id, mahasiswa_id, tanggal_bimbingan, waktu_mulai, waktu_selesai, topik_bimbingan, catatan, progress, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                mahasiswa_bimbingan_id,
                dosen_id,
                mahasiswa_id,
                formattedTanggal,
                waktu_mulai || null,
                waktu_selesai || null,
                topik_bimbingan,
                catatan,
                progress || 0,
                status || 'selesai'
            ];

            console.log('Insert values:', values);

            db.query(insertQuery, values, (error, result) => {
                if (error) {
                    console.error('Error adding catatan bimbingan:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Terjadi kesalahan saat menambah catatan bimbingan',
                        error: error.message
                    });
                }

                res.json({
                    success: true,
                    message: 'Catatan bimbingan berhasil ditambahkan',
                    data: { id: result.insertId }
                });
            });
        });
    } catch (error) {
        console.error('Error adding catatan bimbingan:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menambah catatan bimbingan',
            error: error.message
        });
    }
});

// PUT: Mengupdate catatan bimbingan
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            tanggal_bimbingan,
            waktu_mulai,
            waktu_selesai,
            topik_bimbingan,
            catatan,
            progress,
            status
        } = req.body;

        // Validasi input
        if (!tanggal_bimbingan || !topik_bimbingan || !catatan) {
            return res.status(400).json({
                success: false,
                message: 'Data wajib tidak boleh kosong'
            });
        }

        const query = `
            UPDATE catatan_bimbingan 
            SET tanggal_bimbingan = ?, waktu_mulai = ?, waktu_selesai = ?, 
                topik_bimbingan = ?, catatan = ?, progress = ?, status = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const values = [
            tanggal_bimbingan,
            waktu_mulai || null,
            waktu_selesai || null,
            topik_bimbingan,
            catatan,
            progress || 0,
            status || 'selesai',
            id
        ];

        db.query(query, values, (error, result) => {
            if (error) {
                console.error('Error updating catatan bimbingan:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan saat memperbarui catatan bimbingan'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Catatan bimbingan tidak ditemukan'
                });
            }

            res.json({
                success: true,
                message: 'Catatan bimbingan berhasil diperbarui'
            });
        });
    } catch (error) {
        console.error('Error updating catatan bimbingan:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memperbarui catatan bimbingan'
        });
    }
});

// DELETE: Menghapus catatan bimbingan
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM catatan_bimbingan WHERE id = ?';
        
        db.query(query, [id], (error, result) => {
            if (error) {
                console.error('Error deleting catatan bimbingan:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Terjadi kesalahan saat menghapus catatan bimbingan'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Catatan bimbingan tidak ditemukan'
                });
            }

            res.json({
                success: true,
                message: 'Catatan bimbingan berhasil dihapus'
            });
        });
    } catch (error) {
        console.error('Error deleting catatan bimbingan:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus catatan bimbingan'
        });
    }
});

module.exports = router; 