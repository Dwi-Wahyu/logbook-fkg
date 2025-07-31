// src/app/admin/pengaturan/mata-kuliah/edit/[id]/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/config/auth";
import { getMataKuliahById } from "@/app/_lib/queries/mataKuliahQueries";
import { getAllProgramStudi } from "@/app/_lib/queries/programStudiQueries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Settings, Frown, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditMataKuliahForm from "@/app/_components/mata-kuliah/EditMataKuliahForm";

interface EditMataKuliahPageProps {
  params: Promise<{
    id: string; // MataKuliah ID (akan kita parse sebagai number)
  }>;
}

export default async function EditMataKuliahPage({
  params,
}: EditMataKuliahPageProps) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login");
  }

  // Only ADMIN or SUPERADMIN can access this page
  if (session.user.peran !== "ADMIN" && session.user.peran !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const mataKuliahId = parseInt(id); // Parse ID from string to number
  if (isNaN(mataKuliahId)) {
    // Handle invalid ID format
    notFound();
  }

  // Fetch data in parallel
  const [mataKuliahData, allProgramStudi] = await Promise.all([
    getMataKuliahById(mataKuliahId),
    getAllProgramStudi(),
  ]);

  if (!mataKuliahData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-xl mx-auto text-center shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="pb-4">
            <Frown className="h-20 w-20 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Mata Kuliah Tidak Ditemukan
            </CardTitle>
            <CardDescription className="text-lg text-gray-700">
              Maaf, Mata Kuliah dengan ID "{id}" tidak dapat ditemukan di
              database kami. Mungkin ID tersebut salah atau Mata Kuliah telah
              dihapus.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link href="/admin/pengaturan/mata-kuliah">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md flex items-center mx-auto">
                <Home className="mr-2 h-5 w-5" /> Kembali ke Daftar Mata Kuliah
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Infer the type of initialData for the form
  type InitialMataKuliahData = Awaited<ReturnType<typeof getMataKuliahById>>;

  return (
    <>
      <div className="container mx-auto">
        <Suspense
          fallback={<Skeleton className="w-full h-80 mb-6 rounded-xl" />}
        >
          <Card className="mb-8 shadow-lg rounded-xl border border-gray-200">
            <CardHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Settings className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Edit Data Mata Kuliah
                </CardTitle>
              </div>
              <CardDescription className="text-gray-700">
                Formulir ini memungkinkan Anda untuk mengubah data mata kuliah
                yang sudah ada.
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <EditMataKuliahForm
                initialData={mataKuliahData as InitialMataKuliahData} // Cast to the inferred type
                allProgramStudi={allProgramStudi}
              />
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </>
  );
}
