import MahasiswaBimbinganCard from "@/app/_components/pengguna/MahasiswaBimbinganCard";
import UnauthorizedPage from "@/app/_components/UnauthorizedPage";
import { getDetailPengguna } from "@/app/_lib/queries/penggunaQueries";
import { auth } from "@/config/auth";

export default async function DaftarMahasiswaBimbingan() {
  const session = await auth();

  if (!session) {
    return <UnauthorizedPage />;
  }

  const dataPengguna = await getDetailPengguna(session?.user.id);

  return <MahasiswaBimbinganCard dataPengguna={dataPengguna} />;
}
