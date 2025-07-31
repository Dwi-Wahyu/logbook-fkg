import "server-only";

import { prisma } from "@/lib/prisma";
import {
  PenggunaWithRelations,
  TPenggunaSearchParams,
} from "../validations/penggunaSearchParams";
import { Prisma } from "@/generated/prisma";
import { auth } from "@/config/auth";

export async function getPengguna(input: TPenggunaSearchParams) {
  const session = await auth();

  type WhereClause = Prisma.PenggunaWhereInput;
  let whereClause: WhereClause = {
    nama: {
      contains: input.nama,
    },
  };

  if (input.peran) {
    whereClause["peran"] = input.peran;
  }

  if (session?.user.peran !== "SUPERADMIN") {
    whereClause["programStudiId"] = session?.user.programStudiId;
  }

  const filtered = await prisma.pengguna.count({
    where: { ...whereClause },
  });
  const data = await prisma.pengguna.findMany({
    take: input.perPage,
    skip: (input.page - 1) * input.perPage,
    where: { ...whereClause },
    select: {
      id: true,
      nama: true,
      username: true,
      peran: true,
      programStudi: {
        select: {
          nama: true,
        },
      },
      mahasiswa: {
        select: {
          angkatan: true,
        },
      },
      dosen: {
        select: {
          mahasiswaBimbingan: {
            select: {
              pengguna: {
                select: {
                  nama: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const pageCount = Math.ceil(filtered / input.perPage);

  return { data, pageCount, filtered };
}

export async function getProfilPengguna(id: string) {
  const profil = await prisma.pengguna.findUnique({
    where: {
      id,
    },
    select: {
      nama: true,
      username: true,
      peran: true,
      avatar: true,
      mahasiswa: {
        select: {
          semester: true,
          judulDisertasi: true,
          alamat: true,
          alamatKeluarga: true,
          angkatan: true,
          email: true,
          mulaiMasukPendidikan: true,
          nomorTelpon: true,
          pekerjaan: true,
          tahunLulus: true,
          tempatTanggalLahir: true,
          pembimbing: {
            select: {
              pengguna: {
                select: {
                  nama: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return profil;
}

export async function getAllDosen() {
  const dosenList = await prisma.dosen.findMany({
    select: {
      id: true, // ID dari model Dosen
      pengguna: {
        select: {
          id: true,
          nama: true,
        },
      },
    },
    orderBy: {
      pengguna: {
        nama: "asc",
      },
    },
  });

  return dosenList.map((dosen) => ({
    id: dosen.id,
    nama: dosen.pengguna.nama,
  }));
}

export async function getDetailPengguna(id: string) {
  const dataPengguna = await prisma.pengguna.findUnique({
    where: {
      id,
    },
    include: {
      programStudi: {
        select: {
          displayName: true,
        },
      },
      mahasiswa: {
        select: {
          id: true,
          email: true,
          nomorTelpon: true,
          alamat: true,
          tempatTanggalLahir: true,
          mulaiMasukPendidikan: true,
          tahunLulus: true,
          pembimbingId: true,
          pembimbing: {
            select: {
              pengguna: {
                select: {
                  id: true,
                  nama: true,
                  username: true,
                  avatar: true,
                  programStudi: {
                    select: {
                      displayName: true,
                    },
                  },
                },
              },
            },
          },
          pengguna: {
            select: {
              nama: true,
              username: true,
            },
          },
        },
      },
      dosen: {
        select: {
          pengguna: {
            select: {
              nama: true,
              username: true,
            },
          },
          mahasiswaBimbingan: {
            select: {
              pengguna: {
                select: {
                  id: true,
                  avatar: true,
                  nama: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return dataPengguna;
}

export async function getAllPenggunaDosen() {
  const allDosen = prisma.pengguna.findMany({
    where: {
      peran: "DOSEN",
    },
    select: {
      id: true,
      nama: true,
    },
  });

  return allDosen;
}

export async function getPenggunaByProgramStudi(
  programStudiId: string,
  params: TPenggunaSearchParams
) {
  const whereClause: Prisma.PenggunaWhereInput = {
    programStudiId: programStudiId,
  };

  if (params.nama) {
    whereClause.nama = {
      contains: params.nama,
    };
  }
  if (params.username) {
    whereClause.username = {
      contains: params.username,
    };
  }
  if (params.angkatan) {
    if (params.peran === "MAHASISWA") {
      whereClause.mahasiswa = {
        angkatan: {
          contains: params.angkatan,
        },
      };
    } else {
      console.warn("Filter angkatan hanya berlaku untuk peran MAHASISWA.");
    }
  }
  if (params.peran && params.peran !== null) {
    whereClause.peran = params.peran;
  }

  const total = await prisma.pengguna.count({
    where: {
      programStudiId: programStudiId,
    },
  });

  const filtered = await prisma.pengguna.count({
    where: whereClause,
  });

  const data: PenggunaWithRelations[] = await prisma.pengguna.findMany({
    take: params.perPage,
    skip: (params.page - 1) * params.perPage,
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      mahasiswa: true,
      dosen: true,
      programStudi: {
        select: {
          id: true,
          nama: true,
          displayName: true,
        },
      },
    },
  });

  const pageCount = Math.ceil(filtered / params.perPage);

  return { data, total, pageCount, filtered };
}

// NEW QUERY: getKegiatanProgressByMahasiswaId
// Mengambil semua kegiatan untuk mahasiswa tertentu, dikelompokkan berdasarkan JenisKegiatan.
export async function getKegiatanProgressByMahasiswaId(mahasiswaId: string) {
  // Pastikan mahasiswaId valid
  if (!mahasiswaId) {
    return [];
  }

  const kegiatanList = await prisma.kegiatan.findMany({
    where: {
      logbook: {
        mahasiswaId: mahasiswaId,
      },
    },
    include: {
      jenisKegiatan: {
        select: {
          id: true,
          nama: true,
          templateIdentifier: true,
        },
      },
      fieldValues: {
        include: {
          jenisKegiatanField: {
            select: {
              fieldName: true,
              fieldType: true,
              templateKey: true,
              order: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Urutkan dari yang terbaru
    },
  });

  // Kelompokkan kegiatan berdasarkan jenisKegiatan
  const groupedProgress = new Map<
    string,
    {
      jenisKegiatanId: string;
      jenisKegiatanNama: string;
      kegiatan: Array<(typeof kegiatanList)[number]>;
    }
  >();

  kegiatanList.forEach((kegiatan) => {
    const jenisKegiatanId = kegiatan.jenisKegiatan.id;
    if (!groupedProgress.has(jenisKegiatanId)) {
      groupedProgress.set(jenisKegiatanId, {
        jenisKegiatanId: jenisKegiatanId,
        jenisKegiatanNama: kegiatan.jenisKegiatan.nama,
        kegiatan: [],
      });
    }
    groupedProgress.get(jenisKegiatanId)?.kegiatan.push(kegiatan);
  });

  // Konversi Map ke Array dan urutkan jenis kegiatan berdasarkan nama
  return Array.from(groupedProgress.values()).sort((a, b) =>
    a.jenisKegiatanNama.localeCompare(b.jenisKegiatanNama)
  );
}
