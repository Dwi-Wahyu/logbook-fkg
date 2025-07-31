// src/app/admin/kegiatan/edit/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import {
  getKegiatanById,
  getAllMataKuliah, // Import untuk mendapatkan daftar Mata Kuliah
} from "@/app/_lib/queries/kegiatanQueries"; // Server-only queries
import { auth } from "@/config/auth";
import KegiatanEditForm from "@/app/_components/kegiatan/KegiatanEditForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // Import Card for not found UI
import { Frown, Home } from "lucide-react"; // Import icons for not found UI
import Link from "next/link"; // Import Link for navigation button
import { Button } from "@/components/ui/button"; // Import Button for navigation button

export default async function KegiatanEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  const { id } = await params;

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login");
  }

  // Fetch data kegiatan berdasarkan ID dan semua mata kuliah secara paralel
  const [kegiatan, allMataKuliah] = await Promise.all([
    getKegiatanById(id),
    getAllMataKuliah(), // Ambil semua mata kuliah
  ]);

  if (!kegiatan) {
    // Tampilan UI ketika kegiatan tidak ditemukan
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-xl mx-auto text-center shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="pb-4">
            <Frown className="h-20 w-20 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Kegiatan Tidak Ditemukan
            </CardTitle>
            <CardDescription className="text-lg text-gray-700">
              Maaf, Kegiatan dengan ID "{id}" tidak dapat ditemukan di database
              kami. Mungkin ID tersebut salah atau Kegiatan telah dihapus.
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

  // SetBreadcrumbSegment (jika digunakan, asumsikan diimpor di sini)
  // const activityTitle = kegiatan.jenisKegiatan.nama; // Atau ambil dari fieldValues jika ada templateKey 'judul'
  // <SetBreadcrumbSegment pathSegment={id} displayName={`Edit ${activityTitle}`} />

  return (
    <div className="">
      <KegiatanEditForm
        kegiatan={kegiatan} // Teruskan objek kegiatan lengkap
        allMataKuliah={allMataKuliah} // Teruskan daftar mata kuliah
      />
    </div>
  );
}
