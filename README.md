# Logbook Digital FKG-UH

Selamat datang di repositori Logbook Digital Fakultas Kedokteran Gigi Universitas Hasanuddin (FKG-UH). Aplikasi web ini dirancang untuk memodernisasi dan menyederhanakan proses pencatatan kegiatan (logbook) dan bimbingan antara mahasiswa dan dosen.

## 📜 Deskripsi

Aplikasi ini menyediakan platform terpusat bagi mahasiswa untuk mencatat kegiatan harian mereka, mengunggah lampiran, dan mengajukan bimbingan kepada dosen pembimbing. Dosen dapat memantau kemajuan mahasiswa bimbingan mereka, memberikan tanggapan, dan menyetujui permohonan bimbingan. Admin memiliki kontrol penuh atas manajemen pengguna dan data master seperti mata kuliah.

## ✨ Fitur Utama

- **Manajemen Peran**: Tiga peran pengguna dengan hak akses yang berbeda: **Admin**, **Dosen**, dan **Mahasiswa**.
- **Dashboard Interaktif**: Visualisasi data dan ringkasan statistik untuk setiap peran pengguna.
- **Pencatatan Kegiatan (Logbook)**: Mahasiswa dapat membuat, mengedit, dan melihat entri logbook harian mereka.
- **Manajemen Lampiran**: Kemampuan untuk mengunggah dan mengelola file lampiran untuk setiap kegiatan.
- **Sistem Bimbingan**: Mahasiswa dapat mengajukan bimbingan, dan dosen dapat menerima atau menolak permohonan tersebut.
- **Notifikasi**: Sistem notifikasi untuk pembaruan penting seperti persetujuan bimbingan atau tanggapan baru.
- **Manajemen Pengguna**: Admin dapat mengelola data mahasiswa dan dosen.
- **Manajemen Mata Kuliah**: Admin dapat menambah dan mengedit mata kuliah yang tersedia.
- **Ekspor Dokumen**: Mahasiswa dapat mengunduh rekap logbook mereka dalam format `.docx`.
- **Desain Responsif**: Antarmuka yang dapat diakses dengan baik di perangkat desktop maupun mobile.

## 🚀 Tumpukan Teknologi (Tech Stack)

- **Framework**: [Next.js](https://nextjs.org/) (dengan App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Autentikasi**: [NextAuth.js](https://next-auth.js.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Manajemen Form**: [React Hook Form](https://react-hook-form.com/)
- **Validasi Skema**: [Zod](https://zod.dev/)
- **Tabel Data**: [TanStack Table](https://tanstack.com/table/v8)
- **Grafik & Chart**: [Recharts](https://recharts.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## 📁 Struktur Proyek

```
├── prisma/                 # Skema, migrasi, dan seed database Prisma
├── public/                 # Aset statis, termasuk template dokumen
├── src/
│   ├── app/                # Rute aplikasi (Next.js App Router)
│   │   ├── admin/          # Halaman khusus Admin
│   │   ├── api/            # Rute API (termasuk NextAuth)
│   │   └── (user)/         # Halaman untuk Dosen & Mahasiswa
│   ├── _components/        # Komponen UI reusable
│   ├── config/             # Konfigurasi aplikasi (menu sidebar, auth)
│   ├── hooks/              # Custom hooks React
│   ├── lib/                # Fungsi utilitas, koneksi Prisma, dll.
│   ├── schema/             # Skema validasi Zod
│   └── types/              # Definisi tipe TypeScript
├── next.config.ts          # File konfigurasi Next.js
└── package.json            # Dependensi dan skrip proyek
```
