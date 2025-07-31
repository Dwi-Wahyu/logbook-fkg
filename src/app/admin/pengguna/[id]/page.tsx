import { EditPenggunaForm } from "@/app/_components/pengguna/EditPenggunaForm";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";

export default async function EditPengguna({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pengguna = await prisma.pengguna.findUnique({
    where: {
      id,
    },
    select: {
      username: true,
      nama: true,
      peran: true,
    },
  });

  if (!pengguna) {
    return <h1>Pengguna Tidak Ditemukan</h1>;
  }

  const allowedPeran =
    pengguna.peran === "ADMIN"
      ? undefined
      : (pengguna.peran as "MAHASISWA" | "DOSEN" | undefined);

  return (
    <Suspense fallback={<Skeleton className="w-full h-60" />}>
      <EditPenggunaForm
        id={id}
        username={pengguna.username}
        nama={pengguna.nama}
      />
    </Suspense>
  );
}
