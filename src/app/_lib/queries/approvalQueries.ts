// src/app/_lib/queries/kegiatanQueries.ts
import "server-only";

import { prisma } from "@/lib/prisma";
import { auth } from "@/config/auth";

export async function getApprovalsByKegiatan(kegiatanId: string) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    console.warn(
      "Unauthorized access to getKegiatan: No session or user ID found.",
    );
    return [];
  }

  const data = await prisma.approval.findMany({
    where: {
      kegiatanId,
    },
    include: {
      pengguna: {
        select: {
          id: true,
          nama: true,
          avatar: true,
          peran: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}
