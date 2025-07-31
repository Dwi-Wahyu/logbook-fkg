// /admin/kegiatan/tambah-kegiatan/page.tsx
import { Suspense } from "react";
import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { Loader2, PlusCircle } from "lucide-react"; // Import Loader2
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Import Card components
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for fallback

import TambahKegiatanForm from "@/app/_components/kegiatan/TambahKegiatanForm";
import {
  getAllMataKuliah,
  getAllJenisKegiatan,
} from "@/app/_lib/queries/kegiatanQueries"; // Import getAllJenisKegiatan

// Loading fallback component
const TambahKegiatanFormSkeleton = () => (
  <Card className="w-full shadow-lg rounded-xl">
    <CardHeader className="pb-4">
      <CardTitle className="text-xl font-bold text-gray-800">
        <Skeleton className="h-6 w-2/3" />
      </CardTitle>
      <Skeleton className="h-4 w-1/2 mt-2" />
    </CardHeader>
    <CardContent className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
      <div className="flex justify-end gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    </CardContent>
  </Card>
);

export default async function TambahKegiatanPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login");
  }

  // Dapatkan ID pengguna yang sedang login
  const pengajuId = session.user.id;
  const userProgramStudiId = session.user.programStudiId || null; // Ambil programStudiId dari sesi

  // Ambil semua data Mata Kuliah dan Jenis Kegiatan dari database secara paralel
  const [allMataKuliah, allJenisKegiatan] = await Promise.all([
    getAllMataKuliah(),
    getAllJenisKegiatan(userProgramStudiId), // Filter jenis kegiatan berdasarkan program studi user
  ]);

  return (
    <div className="container mx-auto pb-2">
      <Suspense fallback={<TambahKegiatanFormSkeleton />}>
        <TambahKegiatanForm
          allMataKuliah={allMataKuliah}
          allJenisKegiatan={allJenisKegiatan} // Teruskan ke form
          pengajuId={pengajuId}
        />
      </Suspense>
    </div>
  );
}
