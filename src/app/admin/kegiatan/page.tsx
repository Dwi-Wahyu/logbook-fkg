// src/app/admin/kegiatan/page.tsx
import { Suspense } from "react";
import { SearchParams } from "nuqs/server"; // Import SearchParams from nuqs/server

import {
  getKegiatan,
  getAllMataKuliah,
  getAllJenisKegiatan,
} from "@/app/_lib/queries/kegiatanQueries"; // Import updated queries
import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import KegiatanTable from "@/app/_components/kegiatan/KegiatanTable";
import { kegiatanSearchParams } from "@/app/_lib/validations/kegiatanSearchParams";
import { DatatableSkeleton } from "@/components/datatable/datatable-skeleton";

// Update the interface to use SearchParams from nuqs/server
interface KegiatanListPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function KegiatanListPage({
  searchParams: searchParamsPromise,
}: KegiatanListPageProps) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login");
  }

  // Ambil programStudiId dari sesi user, jika ada
  const userProgramStudiId = session.user.programStudiId || null;

  // Await and parse the searchParams using nuqs/server cache
  const rawSearchParams = await searchParamsPromise;
  const search = kegiatanSearchParams.parse(rawSearchParams);

  // Ambil data kegiatan dari server menggunakan query server-only
  const {
    data: kegiatanList,
    pageCount,
    filtered,
  } = await getKegiatan({
    page: search.page,
    perPage: search.perPage,
    judul: search.judul,
    status: search.status,
    mataKuliahId: search.mataKuliahId,
    semester: search.semester,
    jenisKegiatanId: search.jenisKegiatanId,
    filterAllProgramStudi: search.filterAllProgramStudi,
  });

  // Ambil semua mata kuliah untuk filter dropdown
  const allMataKuliah = await getAllMataKuliah();
  // Ambil semua jenis kegiatan untuk filter dropdown, filter berdasarkan Program Studi user
  const allJenisKegiatan = await getAllJenisKegiatan(userProgramStudiId);

  return (
    <div className="container mx-auto">
      <Suspense fallback={<DatatableSkeleton />}>
        <KegiatanTable
          initialKegiatanList={kegiatanList}
          initialPageCount={pageCount}
          initialFilteredCount={filtered}
          allMataKuliah={allMataKuliah}
          allJenisKegiatan={allJenisKegiatan}
        />
      </Suspense>
    </div>
  );
}
