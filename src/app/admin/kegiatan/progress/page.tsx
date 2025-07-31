import JenisKegiatanPenggunaTable from "@/app/_components/pengguna/JenisKegiatanPenggunaTable";
import UnauthorizedPage from "@/app/_components/UnauthorizedPage";
import { getDetailPengguna } from "@/app/_lib/queries/penggunaQueries";
import { getProgramStudiById } from "@/app/_lib/queries/programStudiQueries";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { auth } from "@/config/auth";
import { CircleDashed } from "lucide-react";

export default async function ProgressKegiatanMahasiswa() {
  const session = await auth();

  if (!session) {
    return <UnauthorizedPage />;
  }

  const isMahasiswa = session?.user.peran === "MAHASISWA";

  if (!isMahasiswa) {
    return <h1>Halaman ini hanya untuk mahasiswa</h1>;
  }

  const dataPengguna = await getDetailPengguna(session.user.id);

  if (!dataPengguna) {
    return <UnauthorizedPage />;
  }

  const programStudiData = await getProgramStudiById(
    session.user.programStudiId
  );

  return (
    <Card>
      <CardContent>
        <div className="flex mb-4 gap-2 items-center">
          <CircleDashed className="h-5 w-5" />

          <CardTitle>Lihat Progress Kegiatan Anda</CardTitle>
        </div>

        <JenisKegiatanPenggunaTable
          initialJenisKegiatanList={programStudiData?.jenisKegiatan ?? []}
          idPengguna={dataPengguna.id}
        />
      </CardContent>
    </Card>
  );
}
