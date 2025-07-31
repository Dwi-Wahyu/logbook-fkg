"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Frown, ListOrdered } from "lucide-react"; // Import Frown and ListOrdered icons
import { Badge } from "@/components/ui/badge"; // Import Badge

// Import tipe JenisKegiatanWithFields dari programStudiQueries.ts
import { JenisKegiatanWithFields } from "@/app/_lib/queries/programStudiQueries";

interface MahasiswaJenisKegiatanTableProps {
  jenisKegiatanList: JenisKegiatanWithFields[];
  mahasiswaPenggunaId: string; // ID Pengguna mahasiswa
}

export default function MahasiswaJenisKegiatanTable({
  jenisKegiatanList,
  mahasiswaPenggunaId,
}: MahasiswaJenisKegiatanTableProps) {
  const router = useRouter();

  // Fungsi untuk membuat URL filter kegiatan
  const getKegiatanListUrl = (jenisKegiatanId: string) => {
    const params = new URLSearchParams();
    params.set("jenisKegiatanId", jenisKegiatanId);
    // Kita tidak perlu pengajuId di URL karena getKegiatan akan mengambilnya dari sesi
    // Namun, jika Anda ingin filter ini bekerja untuk DPJP yang melihat profil mahasiswa lain,
    // maka Anda perlu parameter tambahan di getKegiatan untuk pengajuId.
    // Untuk saat ini, asumsikan getKegiatan akan memfilter berdasarkan sesi user.
    // Jika Anda ingin DPJP melihat kegiatan spesifik mahasiswa ini, Anda harus meneruskan
    // mahasiswaPenggunaId sebagai filter tambahan di sini dan di getKegiatan.
    // Contoh: params.set("pengajuId", mahasiswaPenggunaId);
    return `/admin/kegiatan?${params.toString()}`;
  };

  return (
    <Card className="mt-5 shadow-lg rounded-xl">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ListOrdered className="h-6 w-6 text-primary" />
          Daftar Jenis Kegiatan
        </CardTitle>
        <CardDescription className="text-gray-600">
          Lihat seluruh kegiatan yang diajukan berdasarkan jenisnya.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {jenisKegiatanList.length === 0 ? (
          <div className="text-center p-8 text-gray-500 rounded-lg bg-gray-50 border border-gray-200">
            <Frown className="h-10 w-10 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">
              Belum ada jenis kegiatan yang terdaftar untuk Program Studi ini.
            </p>
          </div>
        ) : (
          <div className="relative w-full overflow-auto rounded-lg border border-gray-200 shadow-sm">
            <Table className="min-w-full bg-white">
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[50px] font-bold text-gray-700">
                    No
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">
                    Nama Jenis Kegiatan
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">
                    Jumlah Field
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">
                    Mata Kuliah Wajib
                  </TableHead>
                  <TableHead className="w-[120px] text-center font-bold text-gray-700">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jenisKegiatanList.map((jenisKegiatan, index) => (
                  <TableRow
                    key={jenisKegiatan.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-800">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {jenisKegiatan.nama}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                      {jenisKegiatan.fields.length}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`px-3 py-1 rounded-full font-semibold text-xs inline-flex items-center space-x-1 ${
                          jenisKegiatan.isMataKuliahRequired
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {jenisKegiatan.isMataKuliahRequired ? "Ya" : "Tidak"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={getKegiatanListUrl(jenisKegiatan.id)}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="p-2 rounded-md border-primary text-primary hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Lihat Kegiatan</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
