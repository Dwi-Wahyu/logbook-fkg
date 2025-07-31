import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersRound, UserPlus, Users, ShieldUser } from "lucide-react"; // Menambahkan ikon UserPlus
import Link from "next/link";

export default function PenggunaPage() {
  const navigationItems = [
    {
      title: "Manajemen Dosen",
      description: "Kelola data dosen, informasi profil, dan penugasan.",
      icon: UsersRound,
      href: "/admin/pengguna/dosen",
    },
    {
      title: "Manajemen Mahasiswa",
      description:
        "Lihat dan atur data mahasiswa, bimbingan, dan progres akademik.",
      icon: Users, // Contoh ikon untuk mahasiswa
      href: "/admin/pengguna/mahasiswa",
    },
    {
      title: "Manajemen Admin Prodi",
      description: "Kelola akun dan hak akses administrator program studi.",
      icon: ShieldUser, // Contoh ikon untuk admin prodi
      href: "/admin/pengguna/admin-prodi",
    },
    {
      title: "Tambah Pengguna Baru", // Judul baru
      description: "Tambahkan akun pengguna baru ke dalam sistem.", // Deskripsi baru
      icon: UserPlus, // Ikon baru
      href: "/admin/pengguna/tambah-pengguna", // Link baru
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Manajemen Pengguna Sistem
      </h1>
      <p className="text-xl text-center text-gray-600 mb-12">
        Pilih kategori pengguna yang ingin Anda kelola.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {navigationItems.map((item, index) => (
          <Link href={item.href} key={index} className="group">
            <Card className="flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg border-2 border-transparent cursor-pointer h-full">
              <CardHeader className="flex flex-col items-center p-0 pb-4">
                <item.icon className="h-24 w-24 text-primary  transition-colors duration-300" />
                <CardTitle className="mt-4 text-2xl font-semibold text-gray-900  transition-colors duration-300">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-gray-700">
                <CardDescription className="text-base">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
