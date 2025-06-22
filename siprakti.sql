-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 22, 2025 at 06:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `siprakti`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking_bimbingan`
--

CREATE TABLE `booking_bimbingan` (
  `id` int(11) NOT NULL,
  `jadwal_id` int(11) NOT NULL,
  `mahasiswa_id` int(11) NOT NULL,
  `status` enum('pending','diterima','ditolak','dibatalkan') DEFAULT 'pending',
  `catatan_mahasiswa` text DEFAULT NULL,
  `catatan_dosen` text DEFAULT NULL,
  `tanggal_booking` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_diupdate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `catatan_bimbingan`
--

CREATE TABLE `catatan_bimbingan` (
  `id` int(11) NOT NULL,
  `mahasiswa_bimbingan_id` int(11) NOT NULL COMMENT 'ID relasi bimbingan',
  `dosen_id` int(11) NOT NULL COMMENT 'ID dosen yang membuat catatan',
  `mahasiswa_id` int(11) NOT NULL COMMENT 'ID mahasiswa',
  `tanggal_bimbingan` date NOT NULL COMMENT 'Tanggal bimbingan',
  `waktu_mulai` time DEFAULT NULL COMMENT 'Waktu mulai bimbingan',
  `waktu_selesai` time DEFAULT NULL COMMENT 'Waktu selesai bimbingan',
  `topik_bimbingan` varchar(255) NOT NULL COMMENT 'Topik yang dibahas',
  `catatan` text NOT NULL COMMENT 'Catatan bimbingan',
  `progress` decimal(3,2) DEFAULT 0.00 COMMENT 'Progress dalam persen',
  `status` enum('terjadwal','berlangsung','selesai','batal') DEFAULT 'terjadwal' COMMENT 'Status bimbingan',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `catatan_bimbingan`
--

INSERT INTO `catatan_bimbingan` (`id`, `mahasiswa_bimbingan_id`, `dosen_id`, `mahasiswa_id`, `tanggal_bimbingan`, `waktu_mulai`, `waktu_selesai`, `topik_bimbingan`, `catatan`, `progress`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2024-03-15', '09:00:00', '10:30:00', 'Analisis Kebutuhan Sistem', 'Mahasiswa sudah memahami konsep analisis kebutuhan. Progress 30%', 9.99, 'selesai', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(2, 1, 1, 1, '2024-03-22', '09:00:00', '10:30:00', 'Perancangan Database', 'Mahasiswa berhasil membuat ERD dan normalisasi database. Progress 50%', 9.99, 'selesai', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(3, 2, 1, 2, '2024-03-16', '14:00:00', '15:30:00', 'Setup Development Environment', 'Mahasiswa berhasil menginstall dan mengkonfigurasi tools development', 9.99, 'selesai', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(4, 3, 1, 3, '2024-03-17', '10:00:00', '11:30:00', 'Pemahaman Konsep OOP', 'Mahasiswa perlu belajar lebih lanjut tentang konsep OOP', 9.99, 'selesai', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(5, 4, 2, 4, '2024-03-18', '13:00:00', '14:30:00', 'Database Design', 'Mahasiswa menunjukkan pemahaman yang baik tentang desain database', 9.99, 'selesai', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(6, 5, 2, 5, '2024-03-19', '15:00:00', '16:30:00', 'SQL Query Optimization', 'Mahasiswa belajar tentang optimasi query database', 9.99, 'selesai', '2025-06-22 10:59:15', '2025-06-22 10:59:15');

-- --------------------------------------------------------

--
-- Table structure for table `dosen`
--

CREATE TABLE `dosen` (
  `id` int(11) NOT NULL,
  `nip` varchar(20) NOT NULL COMMENT 'Nomor Induk Pegawai',
  `nama` varchar(100) NOT NULL COMMENT 'Nama lengkap dosen',
  `email` varchar(100) NOT NULL COMMENT 'Email dosen',
  `password` varchar(255) NOT NULL COMMENT 'Password (hashed)',
  `gelar` varchar(20) DEFAULT 'M.T' COMMENT 'Gelar akademik',
  `bidang_keahlian` varchar(100) DEFAULT NULL COMMENT 'Bidang keahlian dosen',
  `status` enum('aktif','nonaktif') DEFAULT 'aktif' COMMENT 'Status dosen',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dosen`
--

INSERT INTO `dosen` (`id`, `nip`, `nama`, `email`, `password`, `gelar`, `bidang_keahlian`, `status`, `created_at`, `updated_at`) VALUES
(1, '198501012010012001', 'Dr. Ahmad Setiawan', 'ahmad.setiawan@unand.ac.id', 'password123', 'Dr.', 'Sistem Informasi', 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(2, '198602022010012002', 'Dr. Siti Nurhaliza', 'siti.nurhaliza@unand.ac.id', 'password123', 'Dr.', 'Basis Data', 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(3, '198703032010012003', 'Dr. Budi Santoso', 'budi.santoso@unand.ac.id', 'password123', 'Dr.', 'Pemrograman Web', 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(4, '198804042010012004', 'M.T Husnil Kamil', 'husnil.kamil@unand.ac.id', 'password123', 'M.T', 'Jaringan Komputer', 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(5, '198905052010012005', 'M.Kom Rina Safitri', 'rina.safitri@unand.ac.id', 'password123', 'M.Kom', 'Kecerdasan Buatan', 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15');

-- --------------------------------------------------------

--
-- Table structure for table `informasi_penting`
--

CREATE TABLE `informasi_penting` (
  `id` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `isi` text NOT NULL,
  `gambar` varchar(255) DEFAULT NULL,
  `dosen_id` int(11) NOT NULL,
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `tanggal_dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_diupdate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `informasi_penting`
--

INSERT INTO `informasi_penting` (`id`, `judul`, `isi`, `gambar`, `dosen_id`, `status`, `tanggal_dibuat`, `tanggal_diupdate`) VALUES
(1, 'Jadwal Pendaftaran Kerja Praktik', 'Jadwal Pendaftaran Kerja Praktik adalah informasi penting yang berisi waktu mulai dan batas akhir mahasiswa dapat mendaftar untuk melaksanakan kerja praktik.', 'kp-jadwal.jpg', 1, 'nonaktif', '2025-06-22 14:34:40', '2025-06-22 14:35:24'),
(2, 'mafjnasbebd', 'jaksdb', '/uploads/informasi/d864a75f9e0e3c769f80f18a8b1c2aa0', 1, 'nonaktif', '2025-06-22 14:35:38', '2025-06-22 15:39:02'),
(3, 'Pengumuman Seminar KP', 'Nama Mahasiswa: Rina Ayu Pratiwi\r\n\r\nNIM: 2110512035\r\n\r\nJudul KP: Penerapan Sistem Informasi Persediaan Barang pada CV Cahaya Abadi\r\n\r\nDosen Pembimbing: Dr. Andi Nugroho, M.Kom\r\n\r\nPenguji: M. Rasyid, M.Kom\r\n\r\nHari / Tanggal: Rabu, 26 Juni 2025\r\n\r\nWaktu: 09.00 – 10.00 WIB\r\n\r\nTempat: Ruang Rapat Lantai 2, Gedung Seminar SI', '/uploads/informasi/7b91a6f45a6be72e0ed215d252d5d97c', 1, 'aktif', '2025-06-22 15:40:53', '2025-06-22 16:40:21'),
(4, 'Web Development with Express JS', 'contoh isi', '/uploads/informasi/06b3517efb99f45ece49f6b0a63d1119', 1, 'nonaktif', '2025-06-22 16:40:46', '2025-06-22 16:40:59');

-- --------------------------------------------------------

--
-- Table structure for table `jadwal_bimbingan`
--

CREATE TABLE `jadwal_bimbingan` (
  `id` int(11) NOT NULL,
  `dosen_id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `waktu_mulai` time NOT NULL,
  `waktu_selesai` time NOT NULL,
  `kapasitas` int(11) DEFAULT 1,
  `status` enum('tersedia','penuh','dibatalkan') DEFAULT 'tersedia',
  `keterangan` text DEFAULT NULL,
  `tanggal_dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_diupdate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jadwal_bimbingan`
--

INSERT INTO `jadwal_bimbingan` (`id`, `dosen_id`, `tanggal`, `waktu_mulai`, `waktu_selesai`, `kapasitas`, `status`, `keterangan`, `tanggal_dibuat`, `tanggal_diupdate`) VALUES
(1, 1, '2025-06-12', '09:00:00', '11:00:00', 3, 'tersedia', 'Bimbingan KP - Konsultasi Laporan', '2025-06-22 14:44:05', '2025-06-22 14:44:05'),
(2, 1, '2025-06-15', '15:00:00', '17:00:00', 2, 'tersedia', 'Bimbingan KP - Review Progress', '2025-06-22 14:44:05', '2025-06-22 14:44:05'),
(3, 1, '2025-06-17', '13:00:00', '15:00:00', 4, 'tersedia', 'Bimbingan KP - Persiapan Seminar', '2025-06-22 14:44:05', '2025-06-22 14:44:05');

-- --------------------------------------------------------

--
-- Table structure for table `mahasiswa`
--

CREATE TABLE `mahasiswa` (
  `id` int(11) NOT NULL,
  `nim` varchar(15) NOT NULL COMMENT 'Nomor Induk Mahasiswa',
  `nama` varchar(100) NOT NULL COMMENT 'Nama lengkap mahasiswa',
  `email` varchar(100) NOT NULL COMMENT 'Email mahasiswa',
  `password` varchar(255) NOT NULL COMMENT 'Password (hashed)',
  `jurusan` varchar(50) NOT NULL DEFAULT 'Teknik Informatika' COMMENT 'Jurusan mahasiswa',
  `angkatan` int(11) NOT NULL COMMENT 'Tahun angkatan',
  `semester` int(11) DEFAULT 6 COMMENT 'Semester saat ini',
  `ipk` decimal(3,2) DEFAULT 0.00 COMMENT 'IPK mahasiswa',
  `status` enum('aktif','nonaktif','lulus') DEFAULT 'aktif' COMMENT 'Status mahasiswa',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mahasiswa`
--

INSERT INTO `mahasiswa` (`id`, `nim`, `nama`, `email`, `password`, `jurusan`, `angkatan`, `semester`, `ipk`, `status`, `created_at`, `updated_at`) VALUES
(1, '2311520001', 'Budi Setiono', 'budi.setiono@student.unand.ac.id', 'password123', 'Teknik Informatika', 2023, 6, 3.45, 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(2, '231152003', 'Andi Pratama', 'andi.pratama@student.unand.ac.id', 'password123', 'Teknik Informatika', 2023, 6, 3.67, 'aktif', '2025-06-22 10:59:15', '2025-06-22 16:31:59'),
(3, '2311520003', 'Siti Aminah', 'siti.aminah@student.unand.ac.id', 'password123', 'Teknik Informatika', 2023, 6, 3.23, 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(4, '2311520004', 'Rina Marlina', 'rina.marlina@student.unand.ac.id', 'password123', 'Teknik Informatika', 2023, 6, 3.78, 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(5, '2311520005', 'Dedi Kurniawan', 'dedi.kurniawan@student.unand.ac.id', 'password123', 'Teknik Informatika', 2023, 6, 3.12, 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(6, '2311520006', 'Nina Safitri', 'nina.safitri@student.unand.ac.id', 'password123', 'Teknik Informatika', 2023, 6, 3.89, 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(7, '2311520007', 'Rudi Hermawan', 'rudi.hermawan@student.unand.ac.id', 'password123', 'Teknik Informatika', 2023, 6, 3.34, 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(8, '2311520008', 'Maya Indah', 'maya.indah@student.unand.ac.id', 'password123', 'Teknik Informatika', 2023, 6, 3.56, 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(9, '2311520009', 'Ahmad Fauzi', 'ahmad.fauzi@student.unand.ac.id', 'password123', 'Teknik Informatika', 2023, 6, 3.67, 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(10, '2311520010', 'Dewi Sartika', 'dewi.sartika@student.unand.ac.id', 'password123', 'Teknik Informatika', 2023, 6, 3.45, 'aktif', '2025-06-22 10:59:15', '2025-06-22 10:59:15');

-- --------------------------------------------------------

--
-- Table structure for table `mahasiswa_bimbingan`
--

CREATE TABLE `mahasiswa_bimbingan` (
  `id` int(11) NOT NULL,
  `dosen_id` int(11) NOT NULL COMMENT 'ID dosen pembimbing',
  `mahasiswa_id` int(11) NOT NULL COMMENT 'ID mahasiswa yang dibimbing',
  `status` enum('aktif','selesai','batal') DEFAULT 'aktif' COMMENT 'Status bimbingan',
  `tanggal_mulai` date DEFAULT curdate() COMMENT 'Tanggal mulai bimbingan',
  `tanggal_selesai` date DEFAULT NULL COMMENT 'Tanggal selesai bimbingan',
  `catatan` text DEFAULT NULL COMMENT 'Catatan tambahan',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mahasiswa_bimbingan`
--

INSERT INTO `mahasiswa_bimbingan` (`id`, `dosen_id`, `mahasiswa_id`, `status`, `tanggal_mulai`, `tanggal_selesai`, `catatan`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'selesai', '2024-01-15', '2025-06-22', 'Mahasiswa aktif dan rajin mengikuti bimbingan', '2025-06-22 10:59:15', '2025-06-22 16:17:28'),
(2, 1, 2, 'aktif', '2024-01-20', NULL, 'Mahasiswa memiliki pemahaman yang baik', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(3, 1, 3, 'aktif', '2024-02-01', NULL, 'Perlu bimbingan lebih intensif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(4, 2, 4, 'aktif', '2024-01-10', NULL, 'Mahasiswa sangat antusias', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(5, 2, 5, 'aktif', '2024-01-25', NULL, 'Progress bimbingan berjalan lancar', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(6, 3, 6, 'aktif', '2024-02-05', NULL, 'Mahasiswa memiliki ide yang kreatif', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(7, 3, 7, 'aktif', '2024-01-30', NULL, 'Perlu bimbingan teknis lebih lanjut', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(8, 4, 8, 'aktif', '2024-02-10', NULL, 'Mahasiswa sudah memahami konsep dasar', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(9, 4, 9, 'aktif', '2024-01-18', NULL, 'Bimbingan berjalan sesuai jadwal', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(10, 5, 10, 'aktif', '2024-02-15', NULL, 'Mahasiswa menunjukkan kemajuan yang baik', '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(11, 1, 9, 'selesai', '2025-06-22', '2025-06-22', '', '2025-06-22 13:57:46', '2025-06-22 14:03:44'),
(12, 1, 10, 'selesai', '2025-06-22', '2025-06-22', '', '2025-06-22 15:37:57', '2025-06-22 16:32:14'),
(15, 1, 5, 'selesai', '2025-06-22', '2025-06-22', '', '2025-06-22 16:19:35', '2025-06-22 16:27:22'),
(20, 1, 8, 'aktif', '2025-06-22', NULL, '', '2025-06-22 16:29:15', '2025-06-22 16:29:15'),
(21, 1, 6, 'aktif', '2025-06-22', NULL, '', '2025-06-22 16:29:41', '2025-06-22 16:29:41'),
(22, 1, 4, 'aktif', '2025-06-22', NULL, '', '2025-06-22 16:33:29', '2025-06-22 16:33:29');

-- --------------------------------------------------------

--
-- Table structure for table `materi_bimbingan`
--

CREATE TABLE `materi_bimbingan` (
  `id` int(11) NOT NULL,
  `dosen_id` int(11) NOT NULL COMMENT 'ID dosen yang mengupload',
  `judul` varchar(255) NOT NULL COMMENT 'Judul materi bimbingan',
  `deskripsi` text DEFAULT NULL COMMENT 'Deskripsi materi',
  `nama_file` varchar(255) NOT NULL COMMENT 'Nama asli file',
  `ukuran_file` bigint(20) NOT NULL COMMENT 'Ukuran file dalam bytes',
  `tipe_file` varchar(50) DEFAULT NULL COMMENT 'MIME type file',
  `path_file` varchar(500) NOT NULL COMMENT 'Path file di server',
  `kategori` enum('teori','praktikum','referensi','lainnya') DEFAULT 'teori' COMMENT 'Kategori materi',
  `status` enum('aktif','nonaktif') DEFAULT 'aktif' COMMENT 'Status materi',
  `download_count` int(11) DEFAULT 0 COMMENT 'Jumlah download',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materi_bimbingan`
--

INSERT INTO `materi_bimbingan` (`id`, `dosen_id`, `judul`, `deskripsi`, `nama_file`, `ukuran_file`, `tipe_file`, `path_file`, `kategori`, `status`, `download_count`, `created_at`, `updated_at`) VALUES
(1, 1, 'Analisis dan Perancangan Sistem Informasi (APSI)', 'Materi dasar tentang analisis dan perancangan sistem informasi untuk kerja praktik', 'apsi_materi.pdf', 3221225, 'application/pdf', '/uploads/materi/apsi_materi.pdf', 'teori', 'aktif', 0, '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(2, 1, 'Web Development with Express JS', 'Panduan lengkap pengembangan web menggunakan Express.js dan Node.js', 'express_js_tutorial.pdf', 3221225, 'application/pdf', '/uploads/materi/express_js_tutorial.pdf', 'praktikum', 'aktif', 0, '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(3, 2, 'Database Design Principles', 'Prinsip-prinsip desain database yang baik untuk sistem informasi', 'database_design.pdf', 1572864, 'application/pdf', '/uploads/materi/database_design.pdf', 'teori', 'aktif', 0, '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(4, 2, 'MySQL Database Management', 'Panduan penggunaan MySQL untuk pengembangan aplikasi', 'mysql_guide.pdf', 2097152, 'application/pdf', '/uploads/materi/mysql_guide.pdf', 'praktikum', 'aktif', 0, '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(5, 3, 'Frontend Development with React', 'Tutorial pengembangan frontend menggunakan React.js', 'react_tutorial.pdf', 2621440, 'application/pdf', '/uploads/materi/react_tutorial.pdf', 'praktikum', 'aktif', 0, '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(6, 3, 'API Development Best Practices', 'Praktik terbaik dalam pengembangan API RESTful', 'api_best_practices.pdf', 1835008, 'application/pdf', '/uploads/materi/api_best_practices.pdf', 'teori', 'aktif', 0, '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(7, 4, 'Network Security Fundamentals', 'Dasar-dasar keamanan jaringan untuk aplikasi web', 'network_security.pdf', 1310720, 'application/pdf', '/uploads/materi/network_security.pdf', 'teori', 'aktif', 0, '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(8, 5, 'Machine Learning Basics', 'Pengenalan dasar machine learning untuk aplikasi cerdas', 'ml_basics.pdf', 3145728, 'application/pdf', '/uploads/materi/ml_basics.pdf', 'teori', 'aktif', 0, '2025-06-22 10:59:15', '2025-06-22 10:59:15'),
(9, 1, 'Bimbingan', 'sdfu', 'daftar_mahasiswa_bimbingan_22_Juni_2025 (1).pdf', 13048, 'application/pdf', '/uploads/materi/materi-1750610212054-556297995.pdf', 'teori', 'nonaktif', 0, '2025-06-22 16:36:52', '2025-06-22 16:37:33');

-- --------------------------------------------------------

--
-- Table structure for table `nilai_seminar`
--

CREATE TABLE `nilai_seminar` (
  `id` int(11) NOT NULL,
  `seminar_id` int(11) NOT NULL,
  `dosen_id` int(11) NOT NULL,
  `nilai` decimal(4,2) NOT NULL CHECK (`nilai` >= 0 and `nilai` <= 100),
  `keterangan` text DEFAULT NULL,
  `tanggal_penilaian` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nilai_seminar`
--

INSERT INTO `nilai_seminar` (`id`, `seminar_id`, `dosen_id`, `nilai`, `keterangan`, `tanggal_penilaian`) VALUES
(1, 1, 1, 85.50, 'Presentasi sangat baik, penguasaan materi sangat baik, perlu perbaikan pada dokumentasi', '2025-06-22 11:28:01'),
(2, 2, 1, 88.00, 'Implementasi aplikasi mobile sangat baik, UI/UX menarik, perlu optimasi performa', '2025-06-22 12:36:59'),
(3, 4, 2, 82.50, 'Sistem e-commerce berfungsi dengan baik, perlu perbaikan pada keamanan transaksi', '2025-06-22 11:28:01'),
(4, 3, 1, 45.00, 'axfdf', '2025-06-22 11:37:38'),
(5, 5, 1, 78.00, 'msdjnhudsf', '2025-06-22 12:21:14'),
(6, 4, 1, 82.50, 'Sistem e-commerce berfungsi dengan baik, perlu perbaikan pada keamanan transaksi', '2025-06-22 12:02:05'),
(7, 15, 1, 87.00, '', '2025-06-22 16:39:27');

-- --------------------------------------------------------

--
-- Table structure for table `seminar`
--

CREATE TABLE `seminar` (
  `id` int(11) NOT NULL,
  `mahasiswa_bimbingan_id` int(11) NOT NULL,
  `judul_seminar` varchar(200) NOT NULL,
  `tanggal_seminar` datetime NOT NULL,
  `lokasi` varchar(100) DEFAULT NULL,
  `status` enum('jadwal','selesai','batal') DEFAULT 'jadwal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seminar`
--

INSERT INTO `seminar` (`id`, `mahasiswa_bimbingan_id`, `judul_seminar`, `tanggal_seminar`, `lokasi`, `status`, `created_at`) VALUES
(1, 1, 'Sistem Informasi Akademik Berbasis Web', '2024-06-20 10:00:00', 'Ruang Seminar A', 'selesai', '2025-06-22 11:28:00'),
(2, 2, 'Aplikasi Mobile untuk Monitoring KP', '2024-06-25 14:00:00', 'Ruang Seminar B', 'selesai', '2025-06-22 11:28:00'),
(3, 3, 'Implementasi Machine Learning dalam Sistem Rekomendasi', '2024-07-01 09:00:00', 'Ruang Seminar A', 'selesai', '2025-06-22 11:28:00'),
(4, 4, 'Pengembangan Sistem E-Commerce', '2024-06-15 13:00:00', 'Ruang Seminar C', 'selesai', '2025-06-22 11:28:00'),
(5, 5, 'Sistem Monitoring IoT untuk Smart City', '2024-07-05 11:00:00', 'Ruang Seminar B', 'selesai', '2025-06-22 11:28:00'),
(6, 1, 'Sistem Informasi Akademik Berbasis Web', '2025-07-15 09:00:00', 'Ruang Seminar A', 'jadwal', '2025-06-22 16:02:38'),
(7, 2, 'Aplikasi Mobile untuk Monitoring KP', '2025-07-18 14:00:00', 'Ruang Seminar B', 'jadwal', '2025-06-22 16:02:38'),
(8, 3, 'Implementasi Machine Learning dalam Sistem Rekomendasi', '2025-07-20 10:00:00', 'Ruang Seminar A', 'jadwal', '2025-06-22 16:02:38'),
(9, 4, 'Pengembangan Sistem E-Commerce', '2025-07-22 13:00:00', 'Ruang Seminar C', 'selesai', '2025-06-22 16:02:38'),
(10, 5, 'Sistem Monitoring IoT untuk Smart City', '2025-07-25 11:00:00', 'Ruang Seminar B', 'jadwal', '2025-06-22 16:02:38'),
(11, 6, 'Aplikasi Web untuk Manajemen Inventaris', '2025-07-28 15:00:00', 'Ruang Seminar A', 'jadwal', '2025-06-22 16:02:38'),
(12, 7, 'Sistem Informasi Geografis untuk Pariwisata', '2025-08-01 09:30:00', 'Ruang Seminar B', 'jadwal', '2025-06-22 16:02:38'),
(13, 8, 'Aplikasi Chatbot untuk Customer Service', '2025-08-03 14:30:00', 'Ruang Seminar C', 'jadwal', '2025-06-22 16:02:38'),
(14, 9, 'Sistem Manajemen Keuangan Digital', '2025-08-05 10:00:00', 'Ruang Seminar A', 'jadwal', '2025-06-22 16:02:38'),
(15, 10, 'Platform E-Learning Berbasis Web', '2025-08-08 13:00:00', 'Ruang Seminar B', 'selesai', '2025-06-22 16:02:38'),
(16, 1, 'Sistem Informasi Akademik Berbasis Web', '2025-06-20 10:00:00', 'Ruang Seminar A', 'selesai', '2025-06-22 16:02:40'),
(17, 2, 'Aplikasi Mobile untuk Monitoring KP', '2025-06-25 14:00:00', 'Ruang Seminar B', 'selesai', '2025-06-22 16:02:40'),
(18, 3, 'Implementasi Machine Learning dalam Sistem Rekomendasi', '2025-07-01 09:00:00', 'Ruang Seminar A', 'selesai', '2025-06-22 16:02:40'),
(19, 4, 'Pengembangan Sistem E-Commerce', '2025-06-15 13:00:00', 'Ruang Seminar C', 'selesai', '2025-06-22 16:02:40'),
(20, 5, 'Sistem Monitoring IoT untuk Smart City', '2025-07-05 11:00:00', 'Ruang Seminar B', 'selesai', '2025-06-22 16:02:40');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_booking_bimbingan`
-- (See below for the actual view)
--
CREATE TABLE `v_booking_bimbingan` (
`id` int(11)
,`jadwal_id` int(11)
,`mahasiswa_id` int(11)
,`nama_mahasiswa` varchar(100)
,`nim` varchar(15)
,`status` enum('pending','diterima','ditolak','dibatalkan')
,`catatan_mahasiswa` text
,`catatan_dosen` text
,`tanggal_booking` timestamp
,`tanggal` date
,`waktu_mulai` time
,`waktu_selesai` time
,`keterangan` text
,`nama_dosen` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_informasi_penting`
-- (See below for the actual view)
--
CREATE TABLE `v_informasi_penting` (
`id` int(11)
,`judul` varchar(255)
,`isi` text
,`gambar` varchar(255)
,`dosen_id` int(11)
,`nama_dosen` varchar(10)
,`status` enum('aktif','nonaktif')
,`tanggal_dibuat` timestamp
,`tanggal_diupdate` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_jadwal_bimbingan`
-- (See below for the actual view)
--
CREATE TABLE `v_jadwal_bimbingan` (
`id` int(11)
,`dosen_id` int(11)
,`nama_dosen` varchar(100)
,`tanggal` date
,`waktu_mulai` time
,`waktu_selesai` time
,`kapasitas` int(11)
,`status` enum('tersedia','penuh','dibatalkan')
,`keterangan` text
,`tanggal_dibuat` timestamp
,`tanggal_diupdate` timestamp
,`waktu_bimbingan` varchar(23)
,`tanggal_formatted` varchar(10)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_mahasiswa_bimbingan_detail`
-- (See below for the actual view)
--
CREATE TABLE `v_mahasiswa_bimbingan_detail` (
`bimbingan_id` int(11)
,`dosen_id` int(11)
,`dosen_nip` varchar(20)
,`dosen_nama` varchar(100)
,`dosen_gelar` varchar(20)
,`mahasiswa_id` int(11)
,`mahasiswa_nim` varchar(15)
,`mahasiswa_nama` varchar(100)
,`mahasiswa_jurusan` varchar(50)
,`mahasiswa_angkatan` int(11)
,`mahasiswa_semester` int(11)
,`mahasiswa_ipk` decimal(3,2)
,`status_bimbingan` enum('aktif','selesai','batal')
,`tanggal_mulai` date
,`tanggal_selesai` date
,`catatan_bimbingan` text
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_materi_bimbingan_detail`
-- (See below for the actual view)
--
CREATE TABLE `v_materi_bimbingan_detail` (
`id` int(11)
,`judul` varchar(255)
,`deskripsi` text
,`nama_file` varchar(255)
,`ukuran_file` bigint(20)
,`tipe_file` varchar(50)
,`path_file` varchar(500)
,`kategori` enum('teori','praktikum','referensi','lainnya')
,`status` enum('aktif','nonaktif')
,`download_count` int(11)
,`created_at` timestamp
,`dosen_id` int(11)
,`dosen_nama` varchar(100)
,`dosen_gelar` varchar(20)
,`ukuran_file_mb` decimal(22,2)
);

-- --------------------------------------------------------

--
-- Structure for view `v_booking_bimbingan`
--
DROP TABLE IF EXISTS `v_booking_bimbingan`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_booking_bimbingan`  AS SELECT `bb`.`id` AS `id`, `bb`.`jadwal_id` AS `jadwal_id`, `bb`.`mahasiswa_id` AS `mahasiswa_id`, `m`.`nama` AS `nama_mahasiswa`, `m`.`nim` AS `nim`, `bb`.`status` AS `status`, `bb`.`catatan_mahasiswa` AS `catatan_mahasiswa`, `bb`.`catatan_dosen` AS `catatan_dosen`, `bb`.`tanggal_booking` AS `tanggal_booking`, `jb`.`tanggal` AS `tanggal`, `jb`.`waktu_mulai` AS `waktu_mulai`, `jb`.`waktu_selesai` AS `waktu_selesai`, `jb`.`keterangan` AS `keterangan`, `d`.`nama` AS `nama_dosen` FROM (((`booking_bimbingan` `bb` join `mahasiswa` `m` on(`bb`.`mahasiswa_id` = `m`.`id`)) join `jadwal_bimbingan` `jb` on(`bb`.`jadwal_id` = `jb`.`id`)) join `dosen` `d` on(`jb`.`dosen_id` = `d`.`id`)) ORDER BY `bb`.`tanggal_booking` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_informasi_penting`
--
DROP TABLE IF EXISTS `v_informasi_penting`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_informasi_penting`  AS SELECT `ip`.`id` AS `id`, `ip`.`judul` AS `judul`, `ip`.`isi` AS `isi`, `ip`.`gambar` AS `gambar`, `ip`.`dosen_id` AS `dosen_id`, 'Dosen Test' AS `nama_dosen`, `ip`.`status` AS `status`, `ip`.`tanggal_dibuat` AS `tanggal_dibuat`, `ip`.`tanggal_diupdate` AS `tanggal_diupdate` FROM `informasi_penting` AS `ip` WHERE `ip`.`status` = 'aktif' ORDER BY `ip`.`tanggal_dibuat` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_jadwal_bimbingan`
--
DROP TABLE IF EXISTS `v_jadwal_bimbingan`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_jadwal_bimbingan`  AS SELECT `jb`.`id` AS `id`, `jb`.`dosen_id` AS `dosen_id`, `d`.`nama` AS `nama_dosen`, `jb`.`tanggal` AS `tanggal`, `jb`.`waktu_mulai` AS `waktu_mulai`, `jb`.`waktu_selesai` AS `waktu_selesai`, `jb`.`kapasitas` AS `kapasitas`, `jb`.`status` AS `status`, `jb`.`keterangan` AS `keterangan`, `jb`.`tanggal_dibuat` AS `tanggal_dibuat`, `jb`.`tanggal_diupdate` AS `tanggal_diupdate`, concat(`jb`.`waktu_mulai`,' - ',`jb`.`waktu_selesai`) AS `waktu_bimbingan`, date_format(`jb`.`tanggal`,'%d/%m/%Y') AS `tanggal_formatted` FROM (`jadwal_bimbingan` `jb` join `dosen` `d` on(`jb`.`dosen_id` = `d`.`id`)) ORDER BY `jb`.`tanggal` DESC, `jb`.`waktu_mulai` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `v_mahasiswa_bimbingan_detail`
--
DROP TABLE IF EXISTS `v_mahasiswa_bimbingan_detail`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_mahasiswa_bimbingan_detail`  AS SELECT `mb`.`id` AS `bimbingan_id`, `d`.`id` AS `dosen_id`, `d`.`nip` AS `dosen_nip`, `d`.`nama` AS `dosen_nama`, `d`.`gelar` AS `dosen_gelar`, `m`.`id` AS `mahasiswa_id`, `m`.`nim` AS `mahasiswa_nim`, `m`.`nama` AS `mahasiswa_nama`, `m`.`jurusan` AS `mahasiswa_jurusan`, `m`.`angkatan` AS `mahasiswa_angkatan`, `m`.`semester` AS `mahasiswa_semester`, `m`.`ipk` AS `mahasiswa_ipk`, `mb`.`status` AS `status_bimbingan`, `mb`.`tanggal_mulai` AS `tanggal_mulai`, `mb`.`tanggal_selesai` AS `tanggal_selesai`, `mb`.`catatan` AS `catatan_bimbingan`, `mb`.`created_at` AS `created_at` FROM ((`mahasiswa_bimbingan` `mb` join `dosen` `d` on(`mb`.`dosen_id` = `d`.`id`)) join `mahasiswa` `m` on(`mb`.`mahasiswa_id` = `m`.`id`)) WHERE `mb`.`status` = 'aktif' ORDER BY `mb`.`created_at` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `v_materi_bimbingan_detail`
--
DROP TABLE IF EXISTS `v_materi_bimbingan_detail`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_materi_bimbingan_detail`  AS SELECT `mb`.`id` AS `id`, `mb`.`judul` AS `judul`, `mb`.`deskripsi` AS `deskripsi`, `mb`.`nama_file` AS `nama_file`, `mb`.`ukuran_file` AS `ukuran_file`, `mb`.`tipe_file` AS `tipe_file`, `mb`.`path_file` AS `path_file`, `mb`.`kategori` AS `kategori`, `mb`.`status` AS `status`, `mb`.`download_count` AS `download_count`, `mb`.`created_at` AS `created_at`, `d`.`id` AS `dosen_id`, `d`.`nama` AS `dosen_nama`, `d`.`gelar` AS `dosen_gelar`, round(`mb`.`ukuran_file` / (1024 * 1024),2) AS `ukuran_file_mb` FROM (`materi_bimbingan` `mb` join `dosen` `d` on(`mb`.`dosen_id` = `d`.`id`)) WHERE `mb`.`status` = 'aktif' ORDER BY `mb`.`created_at` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking_bimbingan`
--
ALTER TABLE `booking_bimbingan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_booking` (`jadwal_id`,`mahasiswa_id`),
  ADD KEY `mahasiswa_id` (`mahasiswa_id`),
  ADD KEY `idx_booking_status` (`status`);

--
-- Indexes for table `catatan_bimbingan`
--
ALTER TABLE `catatan_bimbingan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mahasiswa_bimbingan_id` (`mahasiswa_bimbingan_id`),
  ADD KEY `idx_dosen_id` (`dosen_id`),
  ADD KEY `idx_mahasiswa_id` (`mahasiswa_id`),
  ADD KEY `idx_tanggal_bimbingan` (`tanggal_bimbingan`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `dosen`
--
ALTER TABLE `dosen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_nip` (`nip`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `informasi_penting`
--
ALTER TABLE `informasi_penting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jadwal_bimbingan`
--
ALTER TABLE `jadwal_bimbingan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_jadwal_tanggal` (`tanggal`),
  ADD KEY `idx_jadwal_dosen` (`dosen_id`),
  ADD KEY `idx_jadwal_status` (`status`);

--
-- Indexes for table `mahasiswa`
--
ALTER TABLE `mahasiswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nim` (`nim`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_nim` (`nim`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_jurusan` (`jurusan`),
  ADD KEY `idx_angkatan` (`angkatan`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `mahasiswa_bimbingan`
--
ALTER TABLE `mahasiswa_bimbingan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_bimbingan` (`dosen_id`,`mahasiswa_id`),
  ADD KEY `idx_dosen_id` (`dosen_id`),
  ADD KEY `idx_mahasiswa_id` (`mahasiswa_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tanggal_mulai` (`tanggal_mulai`);

--
-- Indexes for table `materi_bimbingan`
--
ALTER TABLE `materi_bimbingan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dosen_id` (`dosen_id`),
  ADD KEY `idx_kategori` (`kategori`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `nilai_seminar`
--
ALTER TABLE `nilai_seminar`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_nilai_seminar` (`seminar_id`,`dosen_id`),
  ADD KEY `dosen_id` (`dosen_id`);

--
-- Indexes for table `seminar`
--
ALTER TABLE `seminar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mahasiswa_bimbingan_id` (`mahasiswa_bimbingan_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking_bimbingan`
--
ALTER TABLE `booking_bimbingan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `catatan_bimbingan`
--
ALTER TABLE `catatan_bimbingan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `informasi_penting`
--
ALTER TABLE `informasi_penting`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `jadwal_bimbingan`
--
ALTER TABLE `jadwal_bimbingan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mahasiswa`
--
ALTER TABLE `mahasiswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `mahasiswa_bimbingan`
--
ALTER TABLE `mahasiswa_bimbingan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `materi_bimbingan`
--
ALTER TABLE `materi_bimbingan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `nilai_seminar`
--
ALTER TABLE `nilai_seminar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `seminar`
--
ALTER TABLE `seminar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking_bimbingan`
--
ALTER TABLE `booking_bimbingan`
  ADD CONSTRAINT `booking_bimbingan_ibfk_1` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwal_bimbingan` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_bimbingan_ibfk_2` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `catatan_bimbingan`
--
ALTER TABLE `catatan_bimbingan`
  ADD CONSTRAINT `catatan_bimbingan_ibfk_1` FOREIGN KEY (`mahasiswa_bimbingan_id`) REFERENCES `mahasiswa_bimbingan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `catatan_bimbingan_ibfk_2` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `catatan_bimbingan_ibfk_3` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `jadwal_bimbingan`
--
ALTER TABLE `jadwal_bimbingan`
  ADD CONSTRAINT `jadwal_bimbingan_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mahasiswa_bimbingan`
--
ALTER TABLE `mahasiswa_bimbingan`
  ADD CONSTRAINT `mahasiswa_bimbingan_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mahasiswa_bimbingan_ibfk_2` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `materi_bimbingan`
--
ALTER TABLE `materi_bimbingan`
  ADD CONSTRAINT `materi_bimbingan_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `nilai_seminar`
--
ALTER TABLE `nilai_seminar`
  ADD CONSTRAINT `nilai_seminar_ibfk_1` FOREIGN KEY (`seminar_id`) REFERENCES `seminar` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nilai_seminar_ibfk_2` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `seminar`
--
ALTER TABLE `seminar`
  ADD CONSTRAINT `seminar_ibfk_1` FOREIGN KEY (`mahasiswa_bimbingan_id`) REFERENCES `mahasiswa_bimbingan` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
