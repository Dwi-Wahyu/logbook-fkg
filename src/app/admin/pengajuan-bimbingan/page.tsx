// src/app/mahasiswa/pengajuan-bimbingan/page.tsx
import { Suspense } from "react"; // Import Suspense
import { redirect } from "next/navigation";
import { auth } from "@/config/auth"; // Import auth dari NextAuth.js
import {
  getDataPembimbing,
  getSejarahPengajuan,
} from "@/app/_lib/queries/bimbinganQueries"; // Import queries
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component
import PengajuanBimbinganForm from "@/app/_components/bimbingan/PengajuanBimbinganForm";
import { getAllDosen } from "@/app/_lib/queries/penggunaQueries";

export default async function PengajuanBimbinganPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login"); // Redirect jika tidak ada sesi
  }

  // Hanya MAHASISWA yang boleh mengakses halaman ini
  if (session.user.peran !== "MAHASISWA") {
    redirect("/dashboard"); // Atau halaman akses ditolak
  }

  const userId = session.user.id; // ID pengguna yang sedang login (mahasiswa)

  // Fetch data secara paralel
  const [dataPembimbing, sejarahPengajuan, daftarDosen] = await Promise.all([
    getDataPembimbing(userId),
    getSejarahPengajuan(userId),
    getAllDosen(),
  ]);

  const dosenIdMahasiswa = dataPembimbing?.mahasiswa?.pembimbing?.id || null;

  return (
    <div className="container mx-auto pb-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Pengajuan Bimbingan
      </h1>
      <Suspense fallback={<Skeleton className="w-full h-40 rounded-lg" />}>
        {" "}
        {/* Apply Suspense with Skeleton fallback */}
        <PengajuanBimbinganForm
          penggunaId={userId}
          namaPengaju={session.user.nama || "Mahasiswa"}
          dosenId={dosenIdMahasiswa}
          dataPembimbing={dataPembimbing}
          sejarahPengajuan={sejarahPengajuan}
          daftarDosen={daftarDosen}
        />
      </Suspense>
    </div>
  );
}
