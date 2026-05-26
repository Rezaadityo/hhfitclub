-- ============================================================
-- FILE: server/migrations/manual_add_points.sql
-- Jalankan di phpMyAdmin / MySQL CLI jika tidak memakai Sequelize CLI
-- ============================================================

-- 1. Tambah kolom points ke tabel users
ALTER TABLE `users`
  ADD COLUMN `points` INT UNSIGNED NOT NULL DEFAULT 0
  COMMENT 'Total loyalty points member'
  AFTER `phone`;

-- 2. Verifikasi hasil
SELECT id, name, points FROM users LIMIT 5;
