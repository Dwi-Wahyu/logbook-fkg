import "server-only";

import { prisma } from "@/lib/prisma";
import { TPermohonanBimbinganSearchParams } from "../validations/permohonanBimbinganSearchParams";
import { auth } from "@/config/auth";

export async function getMahasiswaBimbingan(
  input: TPermohonanBimbinganSearchParams
) {
  const session = await auth();

  const filtered = await prisma.pengguna.count({});
  const data = await prisma.pengguna.findMany({
    take: input.perPage,
    skip: (input.page - 1) * input.perPage,
    where: {
      mahasiswa: {
        pembimbingId: session?.user.id,
      },
    },
  });

  console.log(data);

  const pageCount = Math.ceil(filtered / input.perPage);

  return { data, pageCount, filtered };
}

export async function getPermohonanBimbingan(
  input: TPermohonanBimbinganSearchParams
) {
  const session = await auth();

  const filtered = await prisma.permohonanBimbingan.count({
    where: {
      dosen: {
        pengguna: {
          id: session?.user.id,
        },
      },
    },
  });
  const data = await prisma.permohonanBimbingan.findMany({
    take: input.perPage,
    skip: (input.page - 1) * input.perPage,
    where: {
      dosen: {
        pengguna: {
          id: session?.user.id,
        },
      },
    },
    include: {
      dosen: {
        select: {
          pengguna: {
            select: {
              nama: true,
            },
          },
        },
      },
      mahasiswa: {
        select: {
          pengguna: {
            select: {
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

export async function getSejarahPengajuan(id: string) {
  const sejarahPengajuan = await prisma.permohonanBimbingan.findMany({
    where: {
      mahasiswaId: id,
    },
    include: {
      dosen: {
        select: {
          pengguna: {
            select: {
              nama: true,
            },
          },
        },
      },
    },
  });

  return sejarahPengajuan;
}

export async function getDataPembimbing(id: string) {
  const dataPembimbing = await prisma.pengguna.findUnique({
    where: {
      id,
    },
    select: {
      mahasiswa: {
        select: {
          pembimbing: {
            select: {
              id: true,
              pengguna: {
                select: {
                  username: true,
                  id: true,
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

  return dataPembimbing;
}

export async function getMahasiswaWithPembimbing(mahasiswaId: string) {
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { penggunaId: mahasiswaId },
    select: {
      id: true,
      pengguna: {
        select: {
          nama: true,
          username: true,
        },
      },
      pembimbing: {
        // Hanya satu pembimbing
        select: {
          id: true,
          pengguna: {
            select: {
              nama: true,
            },
          },
        },
      },
    },
  });

  if (!mahasiswa) return null;

  return {
    id: mahasiswa.id,
    namaMahasiswa: mahasiswa.pengguna.nama,
    usernameMahasiswa: mahasiswa.pengguna.username,
    pembimbingId: mahasiswa.pembimbing?.id || null, // Null jika tidak ada pembimbing
    pembimbingNama: mahasiswa.pembimbing?.pengguna.nama || "Belum Ditentukan",
  };
}
