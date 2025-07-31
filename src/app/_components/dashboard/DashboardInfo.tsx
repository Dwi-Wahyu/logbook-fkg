import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import {
  NotebookText,
  Users,
  Users2,
  UserSearch,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"; // Import more icons
import { Suspense } from "react";
import { auth } from "@/config/auth"; // Import auth

// Import Client Component for Dosen Dashboard
import DosenDashboardClient from "./DosenDashboardClient";
import { getDashboardData } from "@/app/_lib/queries/dashboardQueries";
import DashboardCard from "./DashboardCard";
import { Card } from "@/components/ui/card";

export default async function DashboardInfo() {
  const session = await auth();

  if (!session || !session.user || !session.user.id || !session.user.peran) {
    // Handle unauthenticated or incomplete session
    return (
      <div className="text-center p-8 text-gray-500">
        Silakan login untuk melihat dashboard.
      </div>
    );
  }

  const userId = session.user.id;
  const userRole = session.user.peran;

  // Fetch all dashboard data using the new query
  const dashboardData = await getDashboardData(userId, userRole);

  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";

  return (
    <Suspense fallback={<DashboardInfoSkeleton />}>
      <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Cards for all users */}
        <DashboardCard
          icon={Users}
          title="Total Mahasiswa"
          value={dashboardData.jumlahMahasiswa}
          accentColorClass="text-blue-500"
        />
        <DashboardCard
          icon={Users2}
          title="Total Dosen"
          value={dashboardData.jumlahDosen}
          accentColorClass="text-purple-500"
        />

        {/* Specific cards for Dosen/Mahasiswa */}
        {!isAdmin && (
          <>
            <DashboardCard
              icon={NotebookText}
              title="Total Pengajuan Kegiatan"
              value={dashboardData.jumlahPengajuan}
              accentColorClass="text-green-500"
            />
            <DashboardCard
              icon={UserSearch}
              title="Pengajuan Belum Disetujui"
              value={dashboardData.jumlahPengajuanBelumDisetujui}
              accentColorClass="text-orange-500"
            />
          </>
        )}
      </div>

      {/* Dosen Specific Dashboard Section */}
      {userRole === "DOSEN" && (
        <DosenDashboardClient
          jumlahMahasiswaBimbingan={dashboardData.jumlahMahasiswaBimbingan}
          totalMahasiswaProgramStudi={dashboardData.totalMahasiswaProgramStudi}
          kegiatanTrend={dashboardData.kegiatanTrend}
        />
      )}

      {/* Admin/Superadmin Specific Dashboard Section (Placeholder for future expansion) */}
      {isAdmin && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Dashboard Admin/Superadmin
          </h2>
          <Card className="p-6 shadow-lg rounded-xl">
            <p className="text-gray-600">
              Konten dashboard untuk Admin/Superadmin akan datang.
            </p>
          </Card>
        </div>
      )}
    </Suspense>
  );
}

function DashboardInfoSkeleton() {
  return (
    <div className="mb-5 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
      <Skeleton className="w-full h-28 rounded-xl" />
      <Skeleton className="w-full h-28 rounded-xl" />
      <Skeleton className="w-full h-28 rounded-xl" />
      <Skeleton className="w-full h-28 rounded-xl" />
    </div>
  );
}
