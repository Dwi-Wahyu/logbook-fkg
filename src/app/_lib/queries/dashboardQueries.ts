// src/app/_lib/queries/DashboardQueries.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import { format, subMonths } from "date-fns"; // For date manipulation
import { Prisma } from "@/generated/prisma";

// Tipe untuk hasil query tren kegiatan
export type KegiatanTrendData = {
  date: string;
  diajukan: number;
  disetujui: number;
  ditolak: number;
};

/**
 * Fetches dashboard data for a specific user role.
 * @param userId The ID of the logged-in user.
 * @param userRole The role of the logged-in user.
 * @returns Dashboard statistics and data for charts.
 */
export async function getDashboardData(userId: string, userRole: string) {
  // Data umum untuk semua peran (Mahasiswa, Dosen, Admin, Superadmin)
  const jumlahMahasiswa = await prisma.pengguna.count({
    where: { peran: "MAHASISWA" },
  });
  const jumlahDosen = await prisma.pengguna.count({
    where: { peran: "DOSEN" },
  });

  let pengajuanWhereClause: Prisma.KegiatanWhereInput = {};
  let bimbinganWhereClause: Prisma.MahasiswaWhereInput = {};
  let dosenId: string | null = null;
  let mahasiswaId: string | null = null;
  let userProgramStudiId: string | null = null;

  // Dapatkan ID peran spesifik dan programStudiId pengguna
  if (userRole === "DOSEN") {
    const dosenData = await prisma.dosen.findUnique({
      where: { penggunaId: userId },
      select: { id: true, pengguna: { select: { programStudiId: true } } },
    });
    dosenId = dosenData?.id || null;
    userProgramStudiId = dosenData?.pengguna.programStudiId || null;
    bimbinganWhereClause = { pembimbingId: dosenId };
    pengajuanWhereClause = { logbook: { mahasiswa: bimbinganWhereClause } }; // Default: kegiatan mahasiswa bimbingan
  } else if (userRole === "MAHASISWA") {
    const mahasiswaData = await prisma.mahasiswa.findUnique({
      where: { penggunaId: userId },
      select: { id: true, pengguna: { select: { programStudiId: true } } },
    });
    mahasiswaId = mahasiswaData?.id || null;
    userProgramStudiId = mahasiswaData?.pengguna.programStudiId || null;
    pengajuanWhereClause = { logbook: { penggunaId: userId } }; // Kegiatan yang diajukan oleh mahasiswa ini
  }

  // Statistik untuk Dosen/Mahasiswa
  let jumlahPengajuan = 0;
  let jumlahPengajuanBelumDisetujui = 0;
  let jumlahMahasiswaBimbingan = 0;
  let kegiatanTrend: KegiatanTrendData[] = [];
  let kegiatanStatusDistribution: { status: string; count: number }[] = [];
  let totalMahasiswaProgramStudi = 0;

  if (userRole === "DOSEN" || userRole === "MAHASISWA") {
    jumlahPengajuan = await prisma.kegiatan.count({
      where: pengajuanWhereClause,
    });
    jumlahPengajuanBelumDisetujui = await prisma.kegiatan.count({
      where: { ...pengajuanWhereClause, status: { not: "DISETUJUI" } },
    });

    if (userRole === "DOSEN" && dosenId) {
      jumlahMahasiswaBimbingan = await prisma.mahasiswa.count({
        where: { pembimbingId: dosenId },
      });

      // Jumlah total mahasiswa di program studi yang sama (untuk dosen)
      if (userProgramStudiId) {
        totalMahasiswaProgramStudi = await prisma.mahasiswa.count({
          where: { pengguna: { programStudiId: userProgramStudiId } },
        });
      }

      // Data untuk chart tren kegiatan (hanya untuk kegiatan bimbingan dosen)
      const sixMonthsAgo = subMonths(new Date(), 5); // Data 6 bulan terakhir
      const rawKegiatanData = await prisma.kegiatan.findMany({
        where: {
          ...pengajuanWhereClause, // Filter berdasarkan mahasiswa bimbingan
          createdAt: { gte: sixMonthsAgo },
        },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
      });

      const monthlyData = new Map<
        string,
        { diajukan: number; disetujui: number; ditolak: number }
      >();
      rawKegiatanData.forEach((keg) => {
        const monthYear = format(keg.createdAt, "yyyy-MM");
        if (!monthlyData.has(monthYear)) {
          monthlyData.set(monthYear, { diajukan: 0, disetujui: 0, ditolak: 0 });
        }
        const data = monthlyData.get(monthYear)!;
        if (keg.status === "DIAJUKAN") data.diajukan++;
        else if (keg.status === "DISETUJUI") data.disetujui++;
        else if (keg.status === "DITOLAK") data.ditolak++;
      });

      kegiatanTrend = Array.from(monthlyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => ({ date, ...counts }));
    }
  }

  return {
    jumlahMahasiswa,
    jumlahDosen,
    jumlahPengajuan,
    jumlahPengajuanBelumDisetujui,
    jumlahMahasiswaBimbingan,
    kegiatanTrend,
    kegiatanStatusDistribution,
    userRole,
    totalMahasiswaProgramStudi,
  };
}

export async function getMahasiswaBimbinganPalingAktif(
  dosenPenggunaId: string,
  limit = 5
) {
  const dosen = await prisma.dosen.findUnique({
    where: { penggunaId: dosenPenggunaId },
    select: { id: true },
  });

  if (!dosen) return [];

  const mahasiswaList = await prisma.mahasiswa.findMany({
    where: { pembimbingId: dosen.id },
    select: {
      id: true,
      pengguna: {
        select: {
          id: true,
          nama: true,
          username: true,
          avatar: true,
        },
      },
      logbook: {
        select: {
          _count: {
            select: { kegiatan: true },
          },
        },
      },
    },
  });

  const result = mahasiswaList
    .map((mhs) => {
      const totalKegiatan = mhs.logbook.reduce(
        (acc, lb) => acc + (lb._count?.kegiatan ?? 0),
        0
      );
      return {
        id: mhs.pengguna.id,
        nama: mhs.pengguna.nama,
        username: mhs.pengguna.username,
        avatar: mhs.pengguna.avatar,
        jumlahAktivitas: totalKegiatan,
      };
    })
    .sort((a, b) => b.jumlahAktivitas - a.jumlahAktivitas)
    .slice(0, limit);

  return result;
}
