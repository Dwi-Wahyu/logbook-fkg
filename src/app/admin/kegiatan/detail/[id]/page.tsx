// src/app/admin/kegiatan/detail/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import {
  getKegiatanById,
  KegiatanWithRelations,
} from "@/app/_lib/queries/kegiatanQueries"; // Import type and query
import { auth } from "@/config/auth";
import KegiatanDetailClient from "@/app/_components/kegiatan/KegiatanDetailClient";

export default async function KegiatanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login");
  }

  const { id } = await params;

  // getKegiatanById sekarang mengembalikan KegiatanWithRelations yang sudah mencakup jenisKegiatan dan fieldValues
  const kegiatan: KegiatanWithRelations | null = await getKegiatanById(id);

  if (!kegiatan) {
    return <h1>Kegiatan Tidak Ditemukan</h1>;
  }

  return (
    <>
      <div className="pb-2">
        <KegiatanDetailClient kegiatan={kegiatan} />
      </div>
    </>
  );
}
