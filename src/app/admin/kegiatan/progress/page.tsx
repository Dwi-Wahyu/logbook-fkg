import JenisKegiatanPenggunaTable from "@/app/_components/pengguna/JenisKegiatanPenggunaTable";
import UnauthorizedPage from "@/app/_components/UnauthorizedPage";
import { getDetailPengguna } from "@/app/_lib/queries/penggunaQueries";
import { getJenisKegiatanWithCounts } from "@/app/_lib/queries/programStudiQueries";
import { auth } from "@/config/auth";
import { CircleDashed } from "lucide-react";

export default async function ProgressKegiatanMahasiswa() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return <UnauthorizedPage />;
  }

  const dataPengguna = await getDetailPengguna(session.user.id);

  if (!dataPengguna) {
    return <UnauthorizedPage />;
  }

  const peran = session.user.peran;

  const jenisKegiatanList = await getJenisKegiatanWithCounts({
    programStudiId: session.user.programStudiId,
    penggunaId: session.user.id,
    peran: peran,
  });

  const titleText =
    peran === "MAHASISWA"
      ? "Progress Kegiatan Anda"
      : peran === "SUPERADMIN"
        ? "Progress Seluruh Kegiatan Mahasiswa"
        : "Progress Kegiatan Mahasiswa Program Studi";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{titleText}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Pilih jenis kegiatan di bawah untuk melihat rincian kegiatan.
        </p>
      </div>

      <JenisKegiatanPenggunaTable
        initialJenisKegiatanList={jenisKegiatanList}
        idPengguna={dataPengguna.id}
        peran={peran}
      />
    </div>
  );
}
