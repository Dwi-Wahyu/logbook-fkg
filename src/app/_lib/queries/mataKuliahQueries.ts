// app/queries/mataKuliahQueries.ts
import "server-only";

import { prisma } from "@/lib/prisma";
import { TMataKuliahSearchParams } from "@/schema/MataKuliahSchema";
import { Prisma } from "@/generated/prisma";

export async function getMataKuliah(input: TMataKuliahSearchParams) {
  type WhereClause = Prisma.MataKuliahWhereInput;
  let whereClause: WhereClause = {};

  if (input.judul) {
    whereClause.judul = {
      contains: input.judul,
    };
  }
  if (input.semester) {
    whereClause.semester = input.semester;
  }
  if (input.programStudiId) {
    // Add programStudiId filter
    whereClause.programStudiId = input.programStudiId;
  }

  const filtered = await prisma.mataKuliah.count({
    where: whereClause,
  });

  const data = await prisma.mataKuliah.findMany({
    take: input.perPage,
    skip: (input.page - 1) * input.perPage,
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      // Include ProgramStudi for display in list
      ProgramStudi: {
        select: {
          nama: true,
        },
      },
    },
  });

  const pageCount = Math.ceil(filtered / input.perPage);

  return { data, pageCount, filtered };
}

export async function getMataKuliahById(id: number) {
  if (typeof id !== "number") {
    return null;
  }
  const mataKuliah = await prisma.mataKuliah.findUnique({
    where: { id },
    include: {
      ProgramStudi: {
        select: {
          id: true,
          nama: true,
        },
      },
    },
  });
  return mataKuliah;
}
