import DosenDashboardClient from "@/app/_components/dashboard/DosenDashboardClient";
import DashboardInfo from "@/app/_components/DashboardInfo";
import NotifikasiCard from "@/app/_components/NotifikasiCard";
import { findAllNotifikasi } from "@/app/_lib/actions/notifikasiAction";
import { auth } from "@/config/auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    return <h1>Unauthorized</h1>;
  }

  const allNotifikasi = await findAllNotifikasi({
    penggunaId: session.user.id,
  });

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-bold text-xl">
          Selamat Datang, {session?.user.nama}
        </h1>
      </div>

      <DashboardInfo />

      <NotifikasiCard allNotifikasi={allNotifikasi} />
    </div>
  );
}
