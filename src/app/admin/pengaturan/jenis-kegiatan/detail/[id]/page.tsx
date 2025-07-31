// src/app/admin/pengaturan/jenis-kegiatan/detail/[id]/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/config/auth";
import { getJenisKegiatanById } from "@/app/_lib/queries/programStudiQueries"; // Import query
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Frown, Home, LayoutGrid, ListPlus } from "lucide-react"; // Import ListPlus icon
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import JenisKegiatanDetailClient from "@/app/_components/program-studi/JenisKegiatanDetailClient"; // Client component
import JenisKegiatanFieldsForm from "@/app/_components/program-studi/JenisKegiatanFieldsForm"; // Import the fields management form

interface JenisKegiatanDetailPageProps {
  params: Promise<{
    id: string; // JenisKegiatan ID
  }>;
}

export default async function JenisKegiatanDetailPage({
  params,
}: JenisKegiatanDetailPageProps) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login");
  }

  // Only ADMIN or SUPERADMIN can access this page
  if (session.user.peran !== "ADMIN" && session.user.peran !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const { id: jenisKegiatanId } = await params;
  const jenisKegiatanData = await getJenisKegiatanById(jenisKegiatanId);

  if (!jenisKegiatanData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-xl mx-auto text-center shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="pb-4">
            <Frown className="h-20 w-20 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Jenis Kegiatan Tidak Ditemukan
            </CardTitle>
            <CardDescription className="text-lg text-gray-700">
              Maaf, Jenis Kegiatan dengan ID "{jenisKegiatanId}" tidak dapat
              ditemukan di database kami. Mungkin ID tersebut salah atau Jenis
              Kegiatan telah dihapus.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link href={`/admin/pengaturan/program-studi`}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md flex items-center mx-auto">
                <Home className="mr-2 h-5 w-5" /> Kembali ke Program Studi
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto pb-2">
        <Card className="w-full shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <LayoutGrid className="h-7 w-7 text-primary" />
              <CardTitle className="text-3xl font-extrabold text-gray-900 leading-tight">
                Detail Jenis Kegiatan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Suspense
              fallback={<Skeleton className="w-full h-96 rounded-md" />}
            >
              {/* Display Jenis Kegiatan Details */}
              <JenisKegiatanDetailClient jenisKegiatan={jenisKegiatanData} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader className="pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <ListPlus className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold text-gray-900">
                Kelola Kolom Kegiatan
              </CardTitle>
            </div>
            <CardDescription className="text-gray-700">
              Tambahkan, ubah, atau hapus field yang akan muncul pada form
              kegiatan mahasiswa untuk Jenis Kegiatan ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {" "}
            {/* Adjusted padding */}
            {/* Form untuk mengelola field kustom */}
            <JenisKegiatanFieldsForm
              jenisKegiatanId={jenisKegiatanData.id}
              initialFields={jenisKegiatanData.fields}
              jenisKegiatanNama={jenisKegiatanData.nama}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
