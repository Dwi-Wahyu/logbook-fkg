// src/app/admin/kegiatan/progress/[jenisKegiatanId]/[penggunaId]/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/config/auth";
import { SearchParams } from "nuqs/server";

import {
  getKegiatan, // Query untuk mendapatkan daftar kegiatan
  getAllMataKuliah, // Untuk filter dropdown
  getAllJenisKegiatan, // Untuk filter dropdown
} from "@/app/_lib/queries/kegiatanQueries";
import {
  getDetailPengguna, // Untuk mendapatkan nama mahasiswa
} from "@/app/_lib/queries/penggunaQueries";
import { kegiatanSearchParams } from "@/app/_lib/validations/kegiatanSearchParams";

import KegiatanProgressTable from "@/app/_components/kegiatan/KegiatanProgressTable"; // Client Component baru
import { DatatableSkeleton } from "@/components/datatable/datatable-skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Frown, Home, ListOrdered } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface KegiatanProgressPageProps {
  params: Promise<{
    jenisKegiatanId: string;
    penggunaId: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export default async function KegiatanProgressPage({
  params,
  searchParams: searchParamsPromise,
}: KegiatanProgressPageProps) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login");
  }

  const { jenisKegiatanId, penggunaId } = await params;

  // Hanya Dosen, Admin, Superadmin yang bisa mengakses halaman ini
  if (session.user.peran === "MAHASISWA" && session.user.id !== penggunaId) {
    // Mahasiswa hanya bisa melihat progressnya sendiri
    redirect("/dashboard"); // Atau halaman akses ditolak
  }

  const rawSearchParams = await searchParamsPromise;
  const parsedSearchParams = kegiatanSearchParams.parse(rawSearchParams);

  // Dapatkan detail pengguna mahasiswa
  const mahasiswaPengguna = await getDetailPengguna(penggunaId);
  if (
    !mahasiswaPengguna ||
    mahasiswaPengguna.peran !== "MAHASISWA" ||
    !mahasiswaPengguna.mahasiswa?.id
  ) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-xl mx-auto text-center shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="pb-4">
            <Frown className="h-20 w-20 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Mahasiswa Tidak Ditemukan
            </CardTitle>
            <CardDescription className="text-lg text-gray-700">
              Maaf, data mahasiswa dengan ID "{penggunaId}" tidak dapat
              ditemukan.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link href="/admin/kegiatan">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md flex items-center mx-auto">
                <Home className="mr-2 h-5 w-5" /> Kembali ke Daftar Kegiatan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dapatkan nama Jenis Kegiatan untuk judul
  const allJenisKegiatan = await getAllJenisKegiatan(
    mahasiswaPengguna.programStudiId
  );
  const jenisKegiatan = allJenisKegiatan.find(
    (jk) => jk.id === jenisKegiatanId
  );

  if (!jenisKegiatan) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-xl mx-auto text-center shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="pb-4">
            <Frown className="h-20 w-20 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Jenis Kegiatan Tidak Ditemukan
            </CardTitle>
            <CardDescription className="text-lg text-gray-700">
              Maaf, jenis kegiatan dengan ID "{jenisKegiatanId}" tidak dapat
              ditemukan.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link href={`/admin/pengguna/detail/${penggunaId}`}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground  py-3 rounded-md flex items-center mx-auto">
                <Home className="mr-2 h-5 w-5" /> Kembali ke Profil Mahasiswa
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ambil data kegiatan yang sudah difilter berdasarkan jenisKegiatanId dan penggunaId
  const {
    data: kegiatanList,
    pageCount,
    filtered,
  } = await getKegiatan({
    ...parsedSearchParams, // Sertakan semua search params yang ada
    jenisKegiatanId: jenisKegiatanId, // Override/set jenisKegiatanId dari route params
    pengajuId: penggunaId, // Override/set pengajuId dari route params
  });

  // Ambil semua mata kuliah untuk filter dropdown
  const allMataKuliah = await getAllMataKuliah();

  return (
    <>
      <div className="">
        <Card className="w-full shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <ListOrdered className="h-7 w-7 text-primary" />
              <CardTitle className="text-3xl font-extrabold text-gray-900 leading-tight">
                Progress Kegiatan {jenisKegiatan.nama}
              </CardTitle>
            </div>
            <CardDescription className="text-lg text-gray-700 mt-2">
              Daftar kegiatan "{jenisKegiatan.nama}" yang diajukan oleh{" "}
              <span className="font-semibold text-primary">
                {mahasiswaPengguna.nama}
              </span>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Suspense fallback={<DatatableSkeleton />}>
              <KegiatanProgressTable
                initialKegiatanList={kegiatanList}
                initialPageCount={pageCount}
                initialFilteredCount={filtered}
                allMataKuliah={allMataKuliah}
                jenisKegiatanData={jenisKegiatan} // Teruskan data jenis kegiatan lengkap
                mahasiswaPenggunaId={penggunaId} // Teruskan penggunaId mahasiswa
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
