"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  NotebookText,
  CheckCircle,
  XCircle,
  User,
  MessageSquare,
} from "lucide-react"; // Import relevant icons

// Recharts imports
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DashboardCard from "./DashboardCard";
import { KegiatanTrendData } from "@/app/_lib/queries/dashboardQueries";

interface MahasiswaDashboardClientProps {
  currentSupervisorName: string | null;
  jumlahPengajuan: number;
  jumlahPengajuanBelumDisetujui: number;
  kegiatanTrend: KegiatanTrendData[];
}

export default function MahasiswaDashboardClient({
  currentSupervisorName,
  jumlahPengajuan,
  jumlahPengajuanBelumDisetujui,
  kegiatanTrend,
}: MahasiswaDashboardClientProps) {
  return (
    <div className="mt-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Dashboard Mahasiswa
      </h2>

      {/* Statistik Kunci Mahasiswa */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          icon={User}
          title="Pembimbing Anda"
          value={currentSupervisorName || "Belum Ditentukan"}
          description={
            currentSupervisorName
              ? "DPJP Anda saat ini."
              : "Silakan ajukan permohonan bimbingan."
          }
          accentColorClass="text-indigo-500"
        />
        <DashboardCard
          icon={NotebookText}
          title="Total Pengajuan Kegiatan Anda"
          value={jumlahPengajuan}
          description="Jumlah kegiatan yang Anda ajukan."
          accentColorClass="text-green-500"
        />
        <DashboardCard
          icon={MessageSquare}
          title="Pengajuan Menunggu Respon"
          value={jumlahPengajuanBelumDisetujui}
          description="Kegiatan yang belum disetujui atau ditolak."
          accentColorClass="text-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Tren Pengajuan Kegiatan Anda (Area Chart) */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>
              Tren Pengajuan Kegiatan Anda (6 Bulan Terakhir)
            </CardTitle>
            <CardDescription>
              Jumlah kegiatan yang Anda ajukan dari waktu ke waktu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kegiatanTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={kegiatanTrend}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted))"
                  />
                  <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="diajukan"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    name="Diajukan"
                  />
                  <Area
                    type="monotone"
                    dataKey="disetujui"
                    stackId="1"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    name="Disetujui"
                  />
                  <Area
                    type="monotone"
                    dataKey="ditolak"
                    stackId="1"
                    stroke="hsl(var(--chart-3))"
                    fill="hsl(var(--chart-3))"
                    name="Ditolak"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-500">
                Tidak ada data tren kegiatan untuk ditampilkan.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
