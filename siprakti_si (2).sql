-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 22, 2025 at 06:47 PM
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
-- Database: `siprakti_si`
--

-- --------------------------------------------------------

--
-- Table structure for table `absensi`
--

CREATE TABLE `absensi` (
  `id` int(11) NOT NULL,
  `pertemuan` varchar(100) NOT NULL,
  `bukti` varchar(255) DEFAULT NULL,
  `tanggal` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `absensi`
--

INSERT INTO `absensi` (`id`, `pertemuan`, `bukti`, `tanggal`) VALUES
(1, '1', '1750581481717-1750498429726-Screenshot (2).png', '2025-06-22 15:38:01'),
(2, '2', '1750581495798-1750498429726-Screenshot (2).png', '2025-06-22 15:38:15'),
(3, '1', '1750607807969-1750581481717-1750498429726-Screenshot (2).png', '2025-06-22 22:56:47'),
(4, '2', '1750608132478-1750581481717-1750498429726-Screenshot (2) (1).png', '2025-06-22 23:02:12');

-- --------------------------------------------------------

--
-- Table structure for table `aktivitas_kp`
--

CREATE TABLE `aktivitas_kp` (
  `id` int(11) NOT NULL,
  `mahasiswa_id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `aktivitas` text NOT NULL,
  `status_verifikasi` enum('belum diverifikasi','disetujui','ditolak') DEFAULT 'belum diverifikasi',
  `catatan_dosen` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dokumen_kp`
--

CREATE TABLE `dokumen_kp` (
  `id` int(11) NOT NULL,
  `tanggal_upload` datetime DEFAULT current_timestamp(),
  `surat_keterangan` varchar(255) DEFAULT NULL,
  `tanda_terima` varchar(255) DEFAULT NULL,
  `nilai_pembimbing` varchar(255) DEFAULT NULL,
  `laporan_harian` varchar(255) DEFAULT NULL,
  `laporan_akhir` varchar(255) DEFAULT NULL,
  `nama_file_laporan_akhir` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dokumen_kp`
--

INSERT INTO `dokumen_kp` (`id`, `tanggal_upload`, `surat_keterangan`, `tanda_terima`, `nilai_pembimbing`, `laporan_harian`, `laporan_akhir`, `nama_file_laporan_akhir`) VALUES
(2, '2025-06-21 18:51:55', '1750506715736-Presentasi website gelora.id.pdf', '1750506715753-Presentasi website gelora.id.pdf', '1750506715780-Presentasi website gelora.id.pdf', '1750506715793-Presentasi website gelora.id.pdf', NULL, NULL),
(3, '2025-06-22 22:57:38', '1750607858220-fungsionalitas masing_ anggota kelompok.pdf', '1750607858221-fungsionalitas masing_ anggota kelompok.pdf', '1750607858224-fungsionalitas masing_ anggota kelompok.pdf', '1750607858226-fungsionalitas masing_ anggota kelompok.pdf', NULL, NULL),
(4, '2025-06-22 23:01:44', '1750608104555-fungsionalitas masing_ anggota kelompok.pdf', '1750608104556-fungsionalitas masing_ anggota kelompok.pdf', '1750608104559-fungsionalitas masing_ anggota kelompok.pdf', '1750608104569-fungsionalitas masing_ anggota kelompok.pdf', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `dokumen_pendukung`
--

CREATE TABLE `dokumen_pendukung` (
  `id` int(11) NOT NULL,
  `mahasiswa_id` int(11) NOT NULL,
  `nama_dokumen` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `tanggal_upload` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dosen`
--

CREATE TABLE `dosen` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `nip` varchar(30) NOT NULL,
  `jabatan` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dosen`
--

INSERT INTO `dosen` (`id`, `user_id`, `nama`, `nip`, `jabatan`) VALUES
(1, 3, 'Husnil Kamil', '19870701 200901 1 002', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `feedback` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jadwal_bimbingan`
--

CREATE TABLE `jadwal_bimbingan` (
  `id` int(11) NOT NULL,
  `tanggal` date DEFAULT NULL,
  `waktu` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jadwal_bimbingan`
--

INSERT INTO `jadwal_bimbingan` (`id`, `tanggal`, `waktu`) VALUES
(1, '2025-06-23', '10.00 - 11.00'),
(2, '2025-06-24', '13.00 - 14.00'),
(3, '2025-06-25', '09.00 - 10.00');

-- --------------------------------------------------------

--
-- Table structure for table `mahasiswa`
--

CREATE TABLE `mahasiswa` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `nim` varchar(20) NOT NULL,
  `alamat` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mahasiswa`
--

INSERT INTO `mahasiswa` (`id`, `user_id`, `nama`, `nim`, `alamat`) VALUES
(4, 4, 'Clara Charesta', '2311527002', 'padang');

-- --------------------------------------------------------

--
-- Table structure for table `pembimbing_kp`
--

CREATE TABLE `pembimbing_kp` (
  `id` int(11) NOT NULL,
  `mahasiswa_id` int(11) NOT NULL,
  `dosen_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pembimbing_kp`
--

INSERT INTO `pembimbing_kp` (`id`, `mahasiswa_id`, `dosen_id`, `created_at`) VALUES
(6, 4, 1, '2025-06-22 08:15:46');

-- --------------------------------------------------------

--
-- Table structure for table `pengajuan_bimbingan`
--

CREATE TABLE `pengajuan_bimbingan` (
  `id` int(11) NOT NULL,
  `id_jadwal` int(11) DEFAULT NULL,
  `nim` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Menunggu Konfirmasi',
  `tanggal` date DEFAULT NULL,
  `waktu` time DEFAULT NULL,
  `dosen` varchar(100) DEFAULT NULL,
  `id_mahasiswa` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengajuan_bimbingan`
--

INSERT INTO `pengajuan_bimbingan` (`id`, `id_jadwal`, `nim`, `status`, `tanggal`, `waktu`, `dosen`, `id_mahasiswa`) VALUES
(13, NULL, NULL, 'Menunggu', '2025-06-22', '17:40:00', 'Husnil Kamil, M.T', NULL),
(16, 1, NULL, 'Menunggu', '2025-06-23', '00:00:10', NULL, 4),
(18, 1, NULL, 'Menunggu', '2025-06-23', '00:00:10', NULL, 4);

-- --------------------------------------------------------

--
-- Table structure for table `pengajuan_kp`
--

CREATE TABLE `pengajuan_kp` (
  `id` int(11) NOT NULL,
  `mahasiswa_id` int(11) NOT NULL,
  `perusahaan_id` int(11) NOT NULL,
  `proposal_kp` varchar(255) DEFAULT NULL,
  `surat_pengajuan_kp` varchar(255) DEFAULT NULL,
  `transkrip_nilai` varchar(255) DEFAULT NULL,
  `status` enum('diajukan','diproses','ditolak','disetujui') DEFAULT 'diajukan',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengajuan_kp`
--

INSERT INTO `pengajuan_kp` (`id`, `mahasiswa_id`, `perusahaan_id`, `proposal_kp`, `surat_pengajuan_kp`, `transkrip_nilai`, `status`, `created_at`, `updated_at`) VALUES
(2, 4, 1, '1750579100711-Presentasi website gelora.id.pdf', '1750579100695-Presentasi website gelora.id.pdf', '1750579100719-Presentasi website gelora.id.pdf', 'disetujui', '2025-06-22 14:58:20', '2025-06-22 23:05:24');

-- --------------------------------------------------------

--
-- Table structure for table `pengajuan_pergantian_dosen`
--

CREATE TABLE `pengajuan_pergantian_dosen` (
  `id` int(11) NOT NULL,
  `pembimbing_kp_id` int(11) NOT NULL,
  `alasan` text NOT NULL,
  `status` enum('pending','disetujui','ditolak') DEFAULT 'pending',
  `tanggal_pengajuan` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengajuan_pergantian_dosen`
--

INSERT INTO `pengajuan_pergantian_dosen` (`id`, `pembimbing_kp_id`, `alasan`, `status`, `tanggal_pengajuan`) VALUES
(1, 6, 'Sibuk Sekali susah bimbingan', 'pending', '2025-06-21 06:06:41'),
(0, 6, 'Karena sisbuk', 'pending', '2025-06-22 08:16:50'),
(0, 6, 'Karena sisbuk', 'pending', '2025-06-22 08:16:55');

-- --------------------------------------------------------

--
-- Table structure for table `pengumuman`
--

CREATE TABLE `pengumuman` (
  `id` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `isi` text NOT NULL,
  `kategori` enum('Pendaftaran','Umum','Laporan') NOT NULL,
  `tanggal_tayang` date NOT NULL,
  `tanggal_berakhir` date NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `penilaian_kp`
--

CREATE TABLE `penilaian_kp` (
  `id` int(11) NOT NULL,
  `nim` varchar(20) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `persentase` int(11) NOT NULL,
  `nilai` float DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_mahasiswa` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `penilaian_kp`
--

INSERT INTO `penilaian_kp` (`id`, `nim`, `kategori`, `persentase`, `nilai`, `created_at`, `updated_at`, `id_mahasiswa`) VALUES
(1, '2311527001', 'Proposal', 30, 80, '2025-06-22 19:44:02', '2025-06-22 20:04:33', 4),
(2, '2311527001', 'Laporan', 40, 85, '2025-06-22 19:44:02', '2025-06-22 20:04:43', 4),
(3, '2311527001', 'Presentasi', 30, 90, '2025-06-22 19:44:02', '2025-06-22 20:04:52', 4);

-- --------------------------------------------------------

--
-- Table structure for table `periode_kp`
--

CREATE TABLE `periode_kp` (
  `id` int(11) NOT NULL,
  `nama_periode` varchar(100) NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `status` enum('aktif','tidak aktif') DEFAULT 'tidak aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `perusahaan`
--

CREATE TABLE `perusahaan` (
  `id` int(11) NOT NULL,
  `nama_perusahaan` varchar(150) NOT NULL,
  `alamat_perusahaan` text NOT NULL,
  `email_perusahaan` varchar(100) DEFAULT NULL,
  `kontak` varchar(50) DEFAULT NULL,
  `kuota` int(11) DEFAULT 0,
  `kategori` int(11) DEFAULT 0,
  `deskripsi` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `perusahaan`
--

INSERT INTO `perusahaan` (`id`, `nama_perusahaan`, `alamat_perusahaan`, `email_perusahaan`, `kontak`, `kuota`, `kategori`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'PT Metro Softwere Indonesia', 'Padang', NULL, NULL, 0, 0, NULL, '2025-06-21 08:11:55', '2025-06-21 08:11:55');

-- --------------------------------------------------------

--
-- Table structure for table `seminar_kp`
--

CREATE TABLE `seminar_kp` (
  `id` int(11) NOT NULL,
  `mahasiswa_id` int(11) NOT NULL,
  `judul_laporan` varchar(255) NOT NULL,
  `file_laporan` varchar(255) DEFAULT NULL,
  `absensi_seminar` varchar(255) DEFAULT NULL,
  `berita_acara` varchar(255) DEFAULT NULL,
  `tanggal_daftar` datetime DEFAULT current_timestamp(),
  `jadwal_seminar` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `nama_file_absensi` varchar(255) DEFAULT NULL,
  `nama_file_berita_acara` varchar(255) DEFAULT NULL,
  `status` enum('diajukan','dijadwalkan') DEFAULT 'diajukan'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seminar_kp`
--

INSERT INTO `seminar_kp` (`id`, `mahasiswa_id`, `judul_laporan`, `file_laporan`, `absensi_seminar`, `berita_acara`, `tanggal_daftar`, `jadwal_seminar`, `updated_at`, `nama_file_absensi`, `nama_file_berita_acara`, `status`) VALUES
(9, 4, 'Membuat Web App', 'laporan_1750580821089.pdf', 'absensi_seminar_1750581460588.pptx', NULL, '2025-06-26 15:27:01', NULL, '2025-06-22 15:37:40', '3. Teknik Analisis Visual.pptx', NULL, 'dijadwalkan');

-- --------------------------------------------------------

--
-- Table structure for table `template_dokumen`
--

CREATE TABLE `template_dokumen` (
  `id` int(11) NOT NULL,
  `nama_file` varchar(255) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','mahasiswa','dosen') NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(3, 'husnilk@unand.ac.id', 'password123', 'dosen', '2025-06-21 08:27:19', '2025-06-21 08:27:19'),
(4, 'claracharesta20@gmail.coom', '12345', 'mahasiswa', '2025-06-22 10:15:24', '2025-06-22 11:54:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `absensi`
--
ALTER TABLE `absensi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `aktivitas_kp`
--
ALTER TABLE `aktivitas_kp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mahasiswa_id` (`mahasiswa_id`);

--
-- Indexes for table `dokumen_kp`
--
ALTER TABLE `dokumen_kp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dokumen_pendukung`
--
ALTER TABLE `dokumen_pendukung`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mahasiswa_id` (`mahasiswa_id`);

--
-- Indexes for table `dosen`
--
ALTER TABLE `dosen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `jadwal_bimbingan`
--
ALTER TABLE `jadwal_bimbingan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mahasiswa`
--
ALTER TABLE `mahasiswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nim` (`nim`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `pembimbing_kp`
--
ALTER TABLE `pembimbing_kp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mahasiswa_id` (`mahasiswa_id`),
  ADD KEY `dosen_id` (`dosen_id`);

--
-- Indexes for table `pengajuan_bimbingan`
--
ALTER TABLE `pengajuan_bimbingan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_jadwal` (`id_jadwal`);

--
-- Indexes for table `pengajuan_kp`
--
ALTER TABLE `pengajuan_kp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mahasiswa_id` (`mahasiswa_id`),
  ADD KEY `perusahaan_id` (`perusahaan_id`);

--
-- Indexes for table `penilaian_kp`
--
ALTER TABLE `penilaian_kp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `periode_kp`
--
ALTER TABLE `periode_kp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `perusahaan`
--
ALTER TABLE `perusahaan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `seminar_kp`
--
ALTER TABLE `seminar_kp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mahasiswa_id` (`mahasiswa_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `absensi`
--
ALTER TABLE `absensi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `aktivitas_kp`
--
ALTER TABLE `aktivitas_kp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dokumen_kp`
--
ALTER TABLE `dokumen_kp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `dokumen_pendukung`
--
ALTER TABLE `dokumen_pendukung`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `jadwal_bimbingan`
--
ALTER TABLE `jadwal_bimbingan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mahasiswa`
--
ALTER TABLE `mahasiswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pembimbing_kp`
--
ALTER TABLE `pembimbing_kp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `pengajuan_bimbingan`
--
ALTER TABLE `pengajuan_bimbingan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `pengajuan_kp`
--
ALTER TABLE `pengajuan_kp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `penilaian_kp`
--
ALTER TABLE `penilaian_kp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `periode_kp`
--
ALTER TABLE `periode_kp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `perusahaan`
--
ALTER TABLE `perusahaan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `seminar_kp`
--
ALTER TABLE `seminar_kp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `aktivitas_kp`
--
ALTER TABLE `aktivitas_kp`
  ADD CONSTRAINT `aktivitas_kp_ibfk_1` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dokumen_pendukung`
--
ALTER TABLE `dokumen_pendukung`
  ADD CONSTRAINT `dokumen_pendukung_ibfk_1` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dosen`
--
ALTER TABLE `dosen`
  ADD CONSTRAINT `dosen_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mahasiswa`
--
ALTER TABLE `mahasiswa`
  ADD CONSTRAINT `mahasiswa_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pembimbing_kp`
--
ALTER TABLE `pembimbing_kp`
  ADD CONSTRAINT `pembimbing_kp_ibfk_1` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`),
  ADD CONSTRAINT `pembimbing_kp_ibfk_2` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`);

--
-- Constraints for table `pengajuan_bimbingan`
--
ALTER TABLE `pengajuan_bimbingan`
  ADD CONSTRAINT `pengajuan_bimbingan_ibfk_1` FOREIGN KEY (`id_jadwal`) REFERENCES `jadwal_bimbingan` (`id`);

--
-- Constraints for table `pengajuan_kp`
--
ALTER TABLE `pengajuan_kp`
  ADD CONSTRAINT `pengajuan_kp_ibfk_1` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pengajuan_kp_ibfk_2` FOREIGN KEY (`perusahaan_id`) REFERENCES `perusahaan` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `seminar_kp`
--
ALTER TABLE `seminar_kp`
  ADD CONSTRAINT `seminar_kp_ibfk_1` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
