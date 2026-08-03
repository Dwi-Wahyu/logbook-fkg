import DashboardInfo from "@/app/_components/DashboardInfo";
import NotifikasiCard from "@/app/_components/NotifikasiCard";
import MahasiswaBimbinganAktifCard from "@/app/_components/dashboard/MahasiswaBimbinganAktifCard";
import { findAllNotifikasi } from "@/app/_lib/actions/notifikasiAction";
import { getMahasiswaBimbinganPalingAktif } from "@/app/_lib/queries/dashboardQueries";
import { auth } from "@/config/auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    return <h1>Unauthorized</h1>;
  }

  const isDosen = session.user.peran === "DOSEN";

  const [allNotifikasi, mahasiswaAktifList] = await Promise.all([
    findAllNotifikasi({
      penggunaId: session.user.id,
      limit: 5,
    }),
    isDosen
      ? getMahasiswaBimbinganPalingAktif(session.user.id, 5)
      : Promise.resolve([]),
  ]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-bold text-xl">
          Selamat Datang, {session?.user.nama}
        </h1>
      </div>

      <DashboardInfo />

      {isDosen ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotifikasiCard allNotifikasi={allNotifikasi} />
          <MahasiswaBimbinganAktifCard mahasiswaList={mahasiswaAktifList} />
        </div>
      ) : (
        <NotifikasiCard allNotifikasi={allNotifikasi} />
      )}
    </div>
  );
}
