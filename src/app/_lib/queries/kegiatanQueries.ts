// src/app/_lib/queries/kegiatanQueries.ts
import "server-only";

import { prisma } from "@/lib/prisma";
import { TKegiatanSearchParams } from "../validations/kegiatanSearchParams";
import { auth } from "@/config/auth";
import { Prisma } from "@/generated/prisma";
import { JenisKegiatanWithFields } from "./programStudiQueries";

// Tipe untuk data field kustom beserta nilainya
export type FieldValueWithDefinition = Prisma.FieldKegiatanValuesGetPayload<{
  include: {
    jenisKegiatanField: {
      select: {
        id: true;
        fieldName: true;
        fieldType: true;
        templateKey: true;
        isRequired: true;
        order: true;
      };
    };
  };
}>;

// Tipe lengkap Kegiatan dengan semua relasi yang diperlukan untuk tampilan dan logika
export type KegiatanWithRelations = Prisma.KegiatanGetPayload<{
  include: {
    MataKuliah: {
      select: {
        id: true; // Tambahkan id
        judul: true;
        semester: true;
        ProgramStudi: {
          // Termasuk ProgramStudi jika diperlukan
          select: { id: true; nama: true; displayName: true };
        };
      };
    };
    logbook: {
      include: {
        mahasiswa: {
          include: {
            pengguna: {
              select: { id: true; nama: true; username: true; avatar: true };
            };
            pembimbing: {
              // Tambahkan pembimbing untuk detail
              select: {
                pengguna: { select: { id: true; nama: true; username: true } };
              };
            };
          };
        };
      };
    };
    jenisKegiatan: {
      // Termasuk JenisKegiatan
      select: {
        id: true;
        nama: true;
        templateIdentifier: true;
        isMataKuliahRequired: true;
        fields: {
          // Termasuk definisi field kustom untuk jenis kegiatan ini
          orderBy: { order: "asc" };
        };
      };
    };
    fieldValues: {
      // Termasuk FieldKegiatanValues dengan definisi field-nya
      include: {
        jenisKegiatanField: {
          select: {
            id: true;
            fieldName: true;
            fieldType: true;
            templateKey: true;
            isRequired: true;
            order: true;
          };
        };
      };
    };
    Catatan: {
      include: {
        pengguna: {
          select: {
            avatar: true;
            nama: true;
          };
        };
      };
    };
    lampiran: true; // true akan meng-include semua field Lampiran
  };
}>;

export async function getKegiatan(input: TKegiatanSearchParams) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    console.warn(
      "Unauthorized access to getKegiatan: No session or user ID found."
    );
    return { data: [], pageCount: 0, filtered: 0 };
  }

  const filters: Prisma.KegiatanWhereInput[] = [];

  if (input.pengajuId) {
    filters.push({
      logbook: {
        penggunaId: input.pengajuId,
      },
    });
  } else if (session.user.peran === "MAHASISWA") {
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { penggunaId: session.user.id },
      select: { id: true },
    });
    if (!mahasiswa) {
      console.warn(
        "Mahasiswa record not found for logged-in user ID:",
        session.user.id
      );
      return { data: [], pageCount: 0, filtered: 0 };
    }
    filters.push({
      logbook: {
        mahasiswaId: mahasiswa.id,
      },
    });
  } else if (session.user.peran === "DOSEN") {
    const dosen = await prisma.dosen.findUnique({
      where: { penggunaId: session.user.id },
      select: { id: true, pengguna: { select: { programStudiId: true } } },
    });
    if (!dosen) {
      console.warn(
        "Dosen record not found for logged-in user ID:",
        session.user.id
      );
      return { data: [], pageCount: 0, filtered: 0 };
    }

    // --- LOGIKA FILTER DOSEN BERDASARKAN filterAllProgramStudi ---
    if (input.filterAllProgramStudi && dosen.pengguna.programStudiId) {
      // Jika filterAllProgramStudi aktif, tampilkan semua kegiatan dari mahasiswa di Program Studi yang sama
      filters.push({
        logbook: {
          mahasiswa: {
            pengguna: {
              programStudiId: dosen.pengguna.programStudiId,
            },
          },
        },
      });
    } else {
      // Default: Hanya tampilkan kegiatan mahasiswa bimbingan dosen ini
      filters.push({
        logbook: {
          mahasiswa: {
            pembimbingId: dosen.id,
          },
        },
      });
    }
  }

  // Filter berdasarkan status
  if (input.status) {
    filters.push({ status: input.status });
  }

  // Filter berdasarkan mataKuliahId
  if (
    input.mataKuliahId &&
    input.mataKuliahId !== "all" &&
    input.mataKuliahId !== "0"
  ) {
    filters.push({ mataKuliahId: parseInt(input.mataKuliahId) });
  }

  // --- PERBAIKAN FILTER SEMESTER DI SINI ---
  // Logika filter semester yang lebih canggih:
  // Jika input.semester didefinisikan, filter kegiatan yang:
  // (Memiliki MataKuliah DAN semester MataKuliah cocok)
  // ATAU
  // (Tidak memiliki MataKuliah (mataKuliahId null) DAN semester di model Kegiatan cocok)
  if (input.semester !== undefined && input.semester !== null) {
    filters.push({
      semester: input.semester,
    });
  }

  // Filter berdasarkan jenisKegiatanId
  if (
    input.jenisKegiatanId &&
    input.jenisKegiatanId !== "all" &&
    input.jenisKegiatanId !== ""
  ) {
    filters.push({ jenisKegiatanId: input.jenisKegiatanId });
  }

  const finalWhereClause: Prisma.KegiatanWhereInput =
    filters.length > 0 ? { AND: filters } : {};

  const filtered = await prisma.kegiatan.count({ where: finalWhereClause });

  const data: KegiatanWithRelations[] = await prisma.kegiatan.findMany({
    take: input.perPage,
    skip: (input.page - 1) * input.perPage,
    where: finalWhereClause,
    orderBy: { createdAt: "desc" },
    include: {
      MataKuliah: {
        select: {
          id: true,
          judul: true,
          semester: true,
          ProgramStudi: { select: { id: true, nama: true, displayName: true } },
        },
      },
      logbook: {
        include: {
          mahasiswa: {
            include: {
              pengguna: {
                select: { id: true, nama: true, username: true, avatar: true },
              },
              pembimbing: {
                select: {
                  pengguna: {
                    select: { id: true, nama: true, username: true },
                  },
                },
              },
            },
          },
        },
      },
      jenisKegiatan: {
        select: {
          id: true,
          nama: true,
          templateIdentifier: true,
          isMataKuliahRequired: true,
          fields: { orderBy: { order: "asc" } }, // Include field definitions
        },
      },
      fieldValues: {
        include: {
          jenisKegiatanField: {
            select: {
              fieldName: true,
              fieldType: true,
              templateKey: true,
              isRequired: true,
              order: true,
            },
          },
        },
      },
      lampiran: true,

      Catatan: {
        include: {
          pengguna: {
            select: {
              avatar: true,
              nama: true,
            },
          },
        },
      },
    },
  });

  const pageCount = Math.ceil(filtered / input.perPage);

  return { data, pageCount, filtered };
}

// Mengubah getKegiatanById untuk mendapatkan data fieldValues dan jenisKegiatan
export async function getKegiatanById(
  id: string
): Promise<KegiatanWithRelations | null> {
  if (!id) return null;

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id },
    include: {
      MataKuliah: {
        select: {
          id: true,
          judul: true,
          semester: true,
          ProgramStudi: {
            select: { id: true, nama: true, displayName: true },
          },
        },
      },
      logbook: {
        include: {
          mahasiswa: {
            include: {
              pengguna: {
                select: { id: true, nama: true, username: true, avatar: true },
              },
              pembimbing: {
                select: {
                  pengguna: {
                    select: { id: true, nama: true, username: true },
                  },
                },
              },
            },
          },
        },
      },
      jenisKegiatan: {
        select: {
          id: true,
          nama: true,
          templateIdentifier: true,
          isMataKuliahRequired: true,
          fields: { orderBy: { order: "asc" } }, // Sertakan definisi field kustom
        },
      },
      fieldValues: {
        // Sertakan FieldKegiatanValues dengan definisi field-nya
        include: {
          jenisKegiatanField: {
            select: {
              id: true, // Ambil ID fieldValue untuk penggunaan di frontend (opsional)
              fieldName: true,
              fieldType: true,
              templateKey: true,
              isRequired: true,
              order: true,
            },
          },
        },
      },
      lampiran: true,
      Catatan: {
        include: {
          pengguna: {
            select: {
              avatar: true,
              nama: true,
            },
          },
        },
      },
    },
  });
  return kegiatan;
}

// NEW Query: getAllJenisKegiatan (untuk dropdown di Tambah Kegiatan Form)
export async function getAllJenisKegiatan(programStudiId?: string | null) {
  // Jika programStudiId diberikan, filter berdasarkan itu
  const whereClause: Prisma.JenisKegiatanWhereInput = programStudiId
    ? { programStudiId: programStudiId }
    : {};

  const jenisKegiatanList = await prisma.jenisKegiatan.findMany({
    where: whereClause,
    select: {
      id: true,
      nama: true,
      isMataKuliahRequired: true,
      programStudiId: true,
      fields: {
        // Include fields definition for frontend dynamic rendering
        select: {
          id: true,
          fieldName: true,
          fieldType: true,
          isRequired: true,
          order: true,
          templateKey: true,
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { nama: "asc" },
  });
  return jenisKegiatanList;
}

export async function getAllMataKuliah() {
  const allMataKuliah = await prisma.mataKuliah.findMany({
    select: { id: true, judul: true, semester: true, programStudiId: true },
    orderBy: { judul: "asc" },
  });
  return allMataKuliah;
}

export async function getPenanggungJawabMahasiswa(mahasiswaId: string) {
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { id: mahasiswaId },
    select: {
      pengguna: { select: { nama: true, username: true } },
      pembimbing: {
        select: { pengguna: { select: { nama: true, username: true } } },
      },
    },
  });
  return mahasiswa;
}
