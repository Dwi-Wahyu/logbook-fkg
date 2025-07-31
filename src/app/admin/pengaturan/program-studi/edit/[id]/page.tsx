// src/app/admin/pengaturan/program-studi/edit/[id]/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/config/auth";
import { getProgramStudiById } from "@/app/_lib/queries/programStudiQueries"; // Import updated query
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Settings, ListPlus, Frown, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import ProgramStudiEditForm from "@/app/_components/program-studi/ProgramStudiEditForm"; // Path tetap
import JenisKegiatanManagement from "@/app/_components/program-studi/JenisKegiatanManagement";
// Import komponen baru untuk mengelola Jenis Kegiatan

interface EditProgramStudiPageProps {
  params: Promise<{
    id: string; // ProgramStudi ID
  }>;
}

export default async function EditProgramStudiPage({
  params,
}: EditProgramStudiPageProps) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login");
  }

  if (session.user.peran !== "ADMIN" && session.user.peran !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const { id: programStudiId } = await params;
  // getProgramStudiById sekarang mengembalikan ProgramStudiWithJenisKegiatan
  const programStudiData = await getProgramStudiById(programStudiId);

  if (!programStudiData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-xl mx-auto text-center shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="pb-4">
            <Frown className="h-20 w-20 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Program Studi Tidak Ditemukan
            </CardTitle>
            <CardDescription className="text-lg text-gray-700">
              Maaf, Program Studi dengan ID "{programStudiId}" tidak dapat
              ditemukan di database kami. Mungkin ID tersebut salah atau Program
              Studi telah dihapus.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link href="/admin/pengaturan/program-studi">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md flex items-center mx-auto">
                <Home className="mr-2 h-5 w-5" /> Kembali ke Daftar Program
                Studi
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tipe untuk initialData ProgramStudiEditForm (tanpa jenisKegiatan)
  type InitialProgramStudiData = Omit<typeof programStudiData, "jenisKegiatan">;
  const initialProgramStudi: InitialProgramStudiData = {
    id: programStudiData.id,
    nama: programStudiData.nama,
    displayName: programStudiData.displayName,
    templateSingleFieldForDate: programStudiData.templateSingleFieldForDate,
    createdAt: programStudiData.createdAt,
    updatedAt: programStudiData.updatedAt,
    ketuaProgramStudiId: "",
  };

  return (
    <>
      <div className="container mx-auto pb-4">
        <Suspense
          fallback={<Skeleton className="w-full h-80 mb-6 rounded-xl" />}
        >
          <Card className="mb-8 shadow-lg rounded-xl border border-gray-200">
            <CardHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Settings className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Data Utama Program Studi
                </CardTitle>
              </div>
              <CardDescription className="text-gray-700">
                Ubah informasi dasar Program Studi ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-1">
              <ProgramStudiEditForm initialData={initialProgramStudi} />
            </CardContent>
          </Card>
        </Suspense>

        <Suspense fallback={<Skeleton className="w-full h-96 rounded-xl" />}>
          {/* Card 2: Manage Jenis Kegiatan and their Fields */}
          <Card className="shadow-lg rounded-xl border border-gray-200">
            <CardHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <ListPlus className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Kelola Jenis Kegiatan
                </CardTitle>
              </div>
              <CardDescription className="text-gray-700">
                Tambahkan, ubah, atau hapus jenis kegiatan serta field yang
                relevan untuk setiap jenis kegiatan di Program Studi ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-1">
              {/* Komponen baru untuk mengelola Jenis Kegiatan */}
              <JenisKegiatanManagement
                programStudiId={programStudiData.id}
                initialJenisKegiatanList={programStudiData.jenisKegiatan} // Teruskan daftar jenis kegiatan
              />
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </>
  );
}
