-- CreateTable
CREATE TABLE `pengguna` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `peran` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `programStudiId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pengguna_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahasiswa` (
    `id` VARCHAR(191) NOT NULL,
    `penggunaId` VARCHAR(191) NOT NULL,
    `pembimbingId` VARCHAR(191) NULL,
    `semester` INTEGER NULL,
    `judulDisertasi` VARCHAR(191) NULL,
    `angkatan` VARCHAR(191) NULL,
    `tempatTanggalLahir` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `alamatKeluarga` VARCHAR(191) NULL,
    `tahunLulus` VARCHAR(191) NULL,
    `mulaiMasukPendidikan` DATETIME(3) NULL,
    `pekerjaan` VARCHAR(191) NULL,
    `nomorTelpon` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `jenisKelamin` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mahasiswa_penggunaId_key`(`penggunaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dosen` (
    `id` VARCHAR(191) NOT NULL,
    `penggunaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dosen_penggunaId_key`(`penggunaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logbook` (
    `id` VARCHAR(191) NOT NULL,
    `mahasiswaId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `penggunaId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kegiatan` (
    `id` VARCHAR(191) NOT NULL,
    `logbookId` VARCHAR(191) NOT NULL,
    `mataKuliahId` INTEGER NULL,
    `jenisKegiatanId` VARCHAR(191) NOT NULL,
    `semester` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL,
    `alasanDitolak` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catatan` (
    `id` VARCHAR(191) NOT NULL,
    `kegiatanId` VARCHAR(191) NOT NULL,
    `penggunaId` VARCHAR(191) NOT NULL,
    `konten` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matakuliah` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `semester` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programStudiId` VARCHAR(191) NULL,

    UNIQUE INDEX `matakuliah_judul_semester_key`(`judul`, `semester`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lampiran` (
    `id` VARCHAR(191) NOT NULL,
    `kegiatanId` VARCHAR(191) NOT NULL,
    `namaFile` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permohonan_bimbingan` (
    `id` VARCHAR(191) NOT NULL,
    `mahasiswaId` VARCHAR(191) NOT NULL,
    `dosenId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'TERKIRIM',
    `pesan` VARCHAR(191) NULL,
    `alasanDitolak` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifikasi` (
    `id` VARCHAR(191) NOT NULL,
    `penggunaId` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `pesan` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_studi` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `ketuaProgramStudiId` VARCHAR(191) NULL,
    `templateSingleFieldForDate` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `program_studi_nama_key`(`nama`),
    UNIQUE INDEX `program_studi_ketuaProgramStudiId_key`(`ketuaProgramStudiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jenis_kegiatan` (
    `id` VARCHAR(191) NOT NULL,
    `programStudiId` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `templateIdentifier` VARCHAR(191) NULL,
    `isMataKuliahRequired` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jenis_kegiatan_templateIdentifier_key`(`templateIdentifier`),
    UNIQUE INDEX `jenis_kegiatan_programStudiId_nama_key`(`programStudiId`, `nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jenis_kegiatan_field` (
    `id` VARCHAR(191) NOT NULL,
    `jenisKegiatanId` VARCHAR(191) NOT NULL,
    `fieldName` VARCHAR(191) NOT NULL,
    `fieldType` VARCHAR(191) NOT NULL,
    `templateKey` VARCHAR(191) NULL,
    `showInTable` BOOLEAN NOT NULL DEFAULT true,
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jenis_kegiatan_field_jenisKegiatanId_fieldName_key`(`jenisKegiatanId`, `fieldName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `field_kegiatan_values` (
    `id` VARCHAR(191) NOT NULL,
    `kegiatanId` VARCHAR(191) NOT NULL,
    `jenisKegiatanFieldId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `field_kegiatan_values_kegiatanId_jenisKegiatanFieldId_key`(`kegiatanId`, `jenisKegiatanFieldId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `riwayat_perubahan_pembimbing` (
    `id` VARCHAR(191) NOT NULL,
    `mahasiswaId` VARCHAR(191) NOT NULL,
    `alasan` VARCHAR(191) NOT NULL,
    `pembimbingIdLama` VARCHAR(191) NULL,
    `pembimbingIdBaru` VARCHAR(191) NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pengguna` ADD CONSTRAINT `pengguna_programStudiId_fkey` FOREIGN KEY (`programStudiId`) REFERENCES `program_studi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_penggunaId_fkey` FOREIGN KEY (`penggunaId`) REFERENCES `pengguna`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_pembimbingId_fkey` FOREIGN KEY (`pembimbingId`) REFERENCES `dosen`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dosen` ADD CONSTRAINT `dosen_penggunaId_fkey` FOREIGN KEY (`penggunaId`) REFERENCES `pengguna`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logbook` ADD CONSTRAINT `logbook_mahasiswaId_fkey` FOREIGN KEY (`mahasiswaId`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logbook` ADD CONSTRAINT `logbook_penggunaId_fkey` FOREIGN KEY (`penggunaId`) REFERENCES `pengguna`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kegiatan` ADD CONSTRAINT `kegiatan_logbookId_fkey` FOREIGN KEY (`logbookId`) REFERENCES `logbook`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kegiatan` ADD CONSTRAINT `kegiatan_mataKuliahId_fkey` FOREIGN KEY (`mataKuliahId`) REFERENCES `matakuliah`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kegiatan` ADD CONSTRAINT `kegiatan_jenisKegiatanId_fkey` FOREIGN KEY (`jenisKegiatanId`) REFERENCES `jenis_kegiatan`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catatan` ADD CONSTRAINT `catatan_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catatan` ADD CONSTRAINT `catatan_penggunaId_fkey` FOREIGN KEY (`penggunaId`) REFERENCES `pengguna`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matakuliah` ADD CONSTRAINT `matakuliah_programStudiId_fkey` FOREIGN KEY (`programStudiId`) REFERENCES `program_studi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lampiran` ADD CONSTRAINT `lampiran_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permohonan_bimbingan` ADD CONSTRAINT `permohonan_bimbingan_mahasiswaId_fkey` FOREIGN KEY (`mahasiswaId`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permohonan_bimbingan` ADD CONSTRAINT `permohonan_bimbingan_dosenId_fkey` FOREIGN KEY (`dosenId`) REFERENCES `dosen`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifikasi` ADD CONSTRAINT `notifikasi_penggunaId_fkey` FOREIGN KEY (`penggunaId`) REFERENCES `pengguna`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program_studi` ADD CONSTRAINT `program_studi_ketuaProgramStudiId_fkey` FOREIGN KEY (`ketuaProgramStudiId`) REFERENCES `pengguna`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jenis_kegiatan` ADD CONSTRAINT `jenis_kegiatan_programStudiId_fkey` FOREIGN KEY (`programStudiId`) REFERENCES `program_studi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jenis_kegiatan_field` ADD CONSTRAINT `jenis_kegiatan_field_jenisKegiatanId_fkey` FOREIGN KEY (`jenisKegiatanId`) REFERENCES `jenis_kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `field_kegiatan_values` ADD CONSTRAINT `field_kegiatan_values_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `field_kegiatan_values` ADD CONSTRAINT `field_kegiatan_values_jenisKegiatanFieldId_fkey` FOREIGN KEY (`jenisKegiatanFieldId`) REFERENCES `jenis_kegiatan_field`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `riwayat_perubahan_pembimbing` ADD CONSTRAINT `riwayat_perubahan_pembimbing_mahasiswaId_fkey` FOREIGN KEY (`mahasiswaId`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
