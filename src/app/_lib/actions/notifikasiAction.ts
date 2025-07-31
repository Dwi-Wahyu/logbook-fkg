"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type TCreateNotifikasi = {
  judul: string;
  pesan: string;
  penggunaId: string;
};

type TFindAllNotifikasi = {
  penggunaId: string;
  dibaca?: boolean;
  limit?: number;
};

export async function createNotifikasi(payload: TCreateNotifikasi) {
  try {
    const notifikasi = await prisma.notifikasi.create({
      data: {
        judul: payload.judul,
        pesan: payload.pesan,
        penggunaId: payload.penggunaId,
      },
    });

    return {
      success: true,
      data: notifikasi,
    };
  } catch (error) {
    console.error("Gagal membuat notifikasi:", error);
    return {
      success: false,
      error: "Gagal membuat notifikasi",
    };
  }
}

export async function findAllNotifikasi(params: TFindAllNotifikasi) {
  try {
    const whereClause = {
      penggunaId: params.penggunaId,
      ...(params.dibaca !== undefined && { dibaca: params.dibaca }),
    };

    const notifikasi = await prisma.notifikasi.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: params.limit,
    });

    return {
      success: true,
      data: notifikasi,
    };
  } catch (error) {
    console.error("Gagal mengambil notifikasi:", error);
    return {
      success: false,
      error: "Gagal mengambil notifikasi",
    };
  }
}

export async function hapusNotifikasi(id: string) {
  const deletedNotifikasi = await prisma.notifikasi.delete({
    where: { id },
  });

  revalidatePath("/admin/dashboard");

  return {
    success: true,
  };
}

export async function markAsRead(notifikasiId: string) {
  try {
    const updatedNotifikasi = await prisma.notifikasi.update({
      where: { id: notifikasiId },
      data: { isRead: true },
    });

    return {
      success: true,
      data: updatedNotifikasi,
    };
  } catch (error) {
    console.error("Gagal menandai notifikasi sebagai dibaca:", error);
    return {
      success: false,
      error: "Gagal menandai notifikasi",
    };
  }
}

export async function countUnreadNotifikasi(penggunaId: string) {
  try {
    const count = await prisma.notifikasi.count({
      where: {
        penggunaId,
        isRead: false,
      },
    });

    return {
      success: true,
      count,
    };
  } catch (error) {
    console.error("Gagal menghitung notifikasi belum dibaca:", error);
    return {
      success: false,
      error: "Gagal menghitung notifikasi",
    };
  }
}
