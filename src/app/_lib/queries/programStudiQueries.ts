// src/app/_lib/queries/programStudiQueries.ts
import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

// --- TIPE DATA UNTUK PROGRAM STUDI ---
// ProgramStudiWithJenisKegiatan: ProgramStudi dengan JenisKegiatan yang terkait
export type ProgramStudiWithJenisKegiatan = Prisma.ProgramStudiGetPayload<{
  include: {
    jenisKegiatan: {
      orderBy: { nama: "asc" }; // Urutkan jenis kegiatan
      include: {
        programStudi: {
          select: {
            nama: true;
            displayName: true;
          };
        };
        fields: { orderBy: { order: "asc" } }; // Include fields dalam jenis kegiatan
      };
    };
  };
}>;

// --- TIPE DATA UNTUK JENIS KEGIATAN ---
// JenisKegiatanWithFields: JenisKegiatan dengan field kustomnya
export type JenisKegiatanWithFields = Prisma.JenisKegiatanGetPayload<{
  include: {
    fields: {
      orderBy: { order: "asc" };
    };
    programStudi: {
      select: {
        nama: true;
        displayName: true;
      };
    };
  };
}>;

// --- SERVER QUERIES UNTUK PROGRAM STUDI ---

export async function getAllProgramStudi() {
  const programStudi = await prisma.programStudi.findMany({
    select: {
      id: true,
      nama: true,
      displayName: true,
    },
    orderBy: {
      nama: "asc",
    },
  });
  return programStudi;
}

export async function getProgramStudiById(
  id: string
): Promise<ProgramStudiWithJenisKegiatan | null> {
  if (!id) {
    return null;
  }

  const programStudi = await prisma.programStudi.findFirst({
    where: { id: id },
    include: {
      jenisKegiatan: {
        orderBy: { nama: "asc" },

        include: {
          programStudi: {
            select: {
              nama: true,
              displayName: true,
            },
          },
          fields: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  return programStudi;
}

export async function getJenisKegiatanById(
  id: string
): Promise<JenisKegiatanWithFields | null> {
  if (!id) {
    return null;
  }

  const jenisKegiatan = await prisma.jenisKegiatan.findUnique({
    where: { id: id },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
      programStudi: {
        // Include programStudi jika dibutuhkan (misal untuk breadcrumb)
        select: {
          id: true,
          nama: true,
          displayName: true,
        },
      },
    },
  });

  return jenisKegiatan;
}

export async function getJenisKegiatanByProgramStudiId(
  programStudiId: string
): Promise<JenisKegiatanWithFields[]> {
  if (!programStudiId) {
    return [];
  }

  const jenisKegiatanList = await prisma.jenisKegiatan.findMany({
    where: { programStudiId: programStudiId },
    orderBy: { nama: "asc" },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
      programStudi: {
        select: {
          nama: true,
          displayName: true,
        },
      },
    },
  });

  return jenisKegiatanList;
}
