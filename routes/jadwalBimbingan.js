const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

// GET - Ambil semua jadwal bimbingan dosen
router.get('/dosen/:dosenId', async (req, res) => {
  let connection;
  try {
    const { dosenId } = req.params;
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        jb.id,
        jb.tanggal,
        jb.waktu_mulai,
        jb.waktu_selesai,
        jb.kapasitas,
        jb.status,
        jb.keterangan,
        jb.tanggal_dibuat,
        CONCAT(jb.waktu_mulai, ' - ', jb.waktu_selesai) AS waktu_bimbingan,
        DATE_FORMAT(jb.tanggal, '%d/%m/%Y') AS tanggal_formatted,
        COUNT(bb.id) AS jumlah_booking
      FROM jadwal_bimbingan jb
      LEFT JOIN booking_bimbingan bb ON jb.id = bb.jadwal_id AND bb.status IN ('pending', 'diterima')
      WHERE jb.dosen_id = ?
      GROUP BY jb.id
      ORDER BY jb.tanggal DESC, jb.waktu_mulai ASC
    `, [dosenId]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching jadwal bimbingan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jadwal bimbingan',
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// GET - Ambil detail jadwal bimbingan
router.get('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        jb.*,
        CONCAT(jb.waktu_mulai, ' - ', jb.waktu_selesai) AS waktu_bimbingan,
        DATE_FORMAT(jb.tanggal, '%d/%m/%Y') AS tanggal_formatted
      FROM jadwal_bimbingan jb
      WHERE jb.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal bimbingan tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching jadwal bimbingan detail:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail jadwal bimbingan',
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// POST - Tambah jadwal bimbingan baru
router.post('/', async (req, res) => {
  let connection;
  try {
    const { dosen_id, tanggal, waktu_mulai, waktu_selesai, kapasitas, keterangan } = req.body;
    
    // Validasi input
    if (!dosen_id || !tanggal || !waktu_mulai || !waktu_selesai) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap'
      });
    }
    
    // Validasi waktu
    if (waktu_mulai >= waktu_selesai) {
      return res.status(400).json({
        success: false,
        message: 'Waktu selesai harus lebih besar dari waktu mulai'
      });
    }
    
    // Validasi tanggal tidak boleh di masa lalu
    const today = new Date();
    const inputDate = new Date(tanggal);
    if (inputDate < today.setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal tidak boleh di masa lalu'
      });
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    // Cek konflik jadwal
    const [conflicts] = await connection.execute(`
      SELECT id FROM jadwal_bimbingan 
      WHERE dosen_id = ? AND tanggal = ? 
      AND (
        (waktu_mulai <= ? AND waktu_selesai > ?) OR
        (waktu_mulai < ? AND waktu_selesai >= ?) OR
        (waktu_mulai >= ? AND waktu_selesai <= ?)
      )
    `, [dosen_id, tanggal, waktu_mulai, waktu_mulai, waktu_selesai, waktu_selesai, waktu_mulai, waktu_selesai]);
    
    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Jadwal bimbingan konflik dengan jadwal yang sudah ada'
      });
    }
    
    const [result] = await connection.execute(`
      INSERT INTO jadwal_bimbingan (dosen_id, tanggal, waktu_mulai, waktu_selesai, kapasitas, keterangan)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [dosen_id, tanggal, waktu_mulai, waktu_selesai, kapasitas || 1, keterangan || '']);
    
    res.json({
      success: true,
      message: 'Jadwal bimbingan berhasil ditambahkan',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating jadwal bimbingan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan jadwal bimbingan',
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// PUT - Update jadwal bimbingan
router.put('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { tanggal, waktu_mulai, waktu_selesai, kapasitas, keterangan, status } = req.body;
    
    connection = await mysql.createConnection(dbConfig);
    
    // Cek apakah jadwal ada
    const [existing] = await connection.execute(`
      SELECT * FROM jadwal_bimbingan WHERE id = ?
    `, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal bimbingan tidak ditemukan'
      });
    }
    
    // Jika ada perubahan tanggal/waktu, cek konflik
    if (tanggal || waktu_mulai || waktu_selesai) {
      const finalTanggal = tanggal || existing[0].tanggal;
      const finalWaktuMulai = waktu_mulai || existing[0].waktu_mulai;
      const finalWaktuSelesai = waktu_selesai || existing[0].waktu_selesai;
      
      // Validasi waktu
      if (finalWaktuMulai >= finalWaktuSelesai) {
        return res.status(400).json({
          success: false,
          message: 'Waktu selesai harus lebih besar dari waktu mulai'
        });
      }
      
      // Cek konflik dengan jadwal lain
      const [conflicts] = await connection.execute(`
        SELECT id FROM jadwal_bimbingan 
        WHERE dosen_id = ? AND tanggal = ? AND id != ?
        AND (
          (waktu_mulai <= ? AND waktu_selesai > ?) OR
          (waktu_mulai < ? AND waktu_selesai >= ?) OR
          (waktu_mulai >= ? AND waktu_selesai <= ?)
        )
      `, [existing[0].dosen_id, finalTanggal, id, finalWaktuMulai, finalWaktuMulai, finalWaktuSelesai, finalWaktuSelesai, finalWaktuMulai, finalWaktuSelesai]);
      
      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Jadwal bimbingan konflik dengan jadwal yang sudah ada'
        });
      }
    }
    
    // Update jadwal
    const [result] = await connection.execute(`
      UPDATE jadwal_bimbingan 
      SET tanggal = ?, waktu_mulai = ?, waktu_selesai = ?, kapasitas = ?, keterangan = ?, status = ?
      WHERE id = ?
    `, [
      tanggal || existing[0].tanggal,
      waktu_mulai || existing[0].waktu_mulai,
      waktu_selesai || existing[0].waktu_selesai,
      kapasitas || existing[0].kapasitas,
      keterangan || existing[0].keterangan,
      status || existing[0].status,
      id
    ]);
    
    res.json({
      success: true,
      message: 'Jadwal bimbingan berhasil diupdate'
    });
  } catch (error) {
    console.error('Error updating jadwal bimbingan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate jadwal bimbingan',
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// DELETE - Hapus jadwal bimbingan
router.delete('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await mysql.createConnection(dbConfig);
    
    // Cek apakah ada booking yang aktif
    const [bookings] = await connection.execute(`
      SELECT COUNT(*) as count FROM booking_bimbingan 
      WHERE jadwal_id = ? AND status IN ('pending', 'diterima')
    `, [id]);
    
    if (bookings[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus jadwal yang sudah dibooking mahasiswa'
      });
    }
    
    const [result] = await connection.execute(`
      DELETE FROM jadwal_bimbingan WHERE id = ?
    `, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal bimbingan tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Jadwal bimbingan berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting jadwal bimbingan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus jadwal bimbingan',
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// GET - Ambil booking untuk jadwal tertentu
router.get('/:id/bookings', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        bb.id,
        bb.mahasiswa_id,
        m.nama AS nama_mahasiswa,
        m.nim,
        bb.status,
        bb.catatan_mahasiswa,
        bb.catatan_dosen,
        bb.tanggal_booking,
        DATE_FORMAT(bb.tanggal_booking, '%d/%m/%Y %H:%i') AS tanggal_booking_formatted
      FROM booking_bimbingan bb
      JOIN mahasiswa m ON bb.mahasiswa_id = m.id
      WHERE bb.jadwal_id = ?
      ORDER BY bb.tanggal_booking DESC
    `, [id]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data booking',
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// PUT - Update status booking
router.put('/booking/:id/status', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { status, catatan_dosen } = req.body;
    
    if (!['pending', 'diterima', 'ditolak', 'dibatalkan'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(`
      UPDATE booking_bimbingan 
      SET status = ?, catatan_dosen = ?
      WHERE id = ?
    `, [status, catatan_dosen || '', id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Status booking berhasil diupdate'
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate status booking',
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// GET - Ambil jadwal bimbingan waktu dekat (7 hari ke depan)
router.get('/waktu-dekat/:dosenId', async (req, res) => {
  let connection;
  try {
    const { dosenId } = req.params;
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        jb.id,
        jb.tanggal,
        jb.waktu_mulai,
        jb.waktu_selesai,
        jb.kapasitas,
        jb.status,
        jb.keterangan,
        CONCAT(jb.waktu_mulai, ' - ', jb.waktu_selesai) AS waktu_bimbingan,
        DATE_FORMAT(jb.tanggal, '%d/%m/%Y') AS tanggal_formatted,
        COUNT(bb.id) AS jumlah_booking,
        GROUP_CONCAT(
          CONCAT(m.nama, ' (', m.nim, ')') SEPARATOR ', '
        ) AS nama_mahasiswa
      FROM jadwal_bimbingan jb
      LEFT JOIN booking_bimbingan bb ON jb.id = bb.jadwal_id AND bb.status IN ('pending', 'diterima')
      LEFT JOIN mahasiswa m ON bb.mahasiswa_id = m.id
      WHERE jb.dosen_id = ? 
        AND jb.tanggal >= CURDATE() 
        AND jb.tanggal <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND jb.status != 'dibatalkan'
      GROUP BY jb.id
      ORDER BY jb.tanggal ASC, jb.waktu_mulai ASC
    `, [dosenId]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching upcoming jadwal bimbingan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jadwal bimbingan waktu dekat',
      error: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

module.exports = router; 