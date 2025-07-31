"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, NotebookText, CheckCircle, XCircle, Clock } from "lucide-react";

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

interface DosenDashboardClientProps {
  jumlahMahasiswaBimbingan: number;
  totalMahasiswaProgramStudi: number;
  kegiatanTrend: KegiatanTrendData[];
}

export default function DosenDashboardClient({
  jumlahMahasiswaBimbingan,
  totalMahasiswaProgramStudi,
  kegiatanTrend,
}: DosenDashboardClientProps) {
  return (
    <div className="mt-8 space-y-8">
      {/* Statistik Kunci Dosen */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          icon={Users}
          title="Mahasiswa Bimbingan Anda"
          value={jumlahMahasiswaBimbingan}
          description={`Dari ${totalMahasiswaProgramStudi} mahasiswa di Program Studi Anda.`}
          accentColorClass="text-blue-500"
        />
        <DashboardCard
          icon={NotebookText}
          title="Pengajuan Kegiatan (Bimbingan)"
          value={kegiatanTrend.reduce(
            (sum, item) => sum + item.diajukan + item.disetujui + item.ditolak,
            0
          )}
          description="Total kegiatan dari mahasiswa bimbingan."
          accentColorClass="text-indigo-500"
        />
        <DashboardCard
          icon={Clock}
          title="Rata-rata Waktu Respon"
          value="Segera Hadir" // Placeholder, perlu logika tambahan untuk menghitung ini
          description="Rata-rata waktu Anda merespon pengajuan."
          accentColorClass="text-orange-500"
        />
      </div>

      {/* Charts Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Tren Pengajuan Kegiatan (6 Bulan Terakhir)</CardTitle>
            <CardDescription>
              Jumlah kegiatan yang diajukan oleh mahasiswa bimbingan Anda.
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
      </div> */}

      {/* Tambahan: Daftar Mahasiswa Bimbingan Teratas (Placeholder) */}
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Mahasiswa Bimbingan Paling Aktif</CardTitle>
          <CardDescription>
            Mahasiswa bimbingan dengan pengajuan kegiatan terbanyak.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Fitur ini akan segera tersedia.</p>
        </CardContent>
      </Card>
    </div>
  );
}
