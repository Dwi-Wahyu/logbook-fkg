import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, LayoutGrid } from "lucide-react";
import Link from "next/link";

export type JenisKegiatanWithCountItem = {
  id: string;
  nama: string;
  programStudiId: string;
  jumlahKegiatan: number;
};

interface JenisKegiatanManagementProps {
  initialJenisKegiatanList: JenisKegiatanWithCountItem[];
  idPengguna: string;
  peran?: string;
}

export default function JenisKegiatanPenggunaTable({
  initialJenisKegiatanList,
  idPengguna,
  peran = "MAHASISWA",
}: JenisKegiatanManagementProps) {
  return (
    <>
      {initialJenisKegiatanList.length === 0 ? (
        <div className="text-center p-8 text-gray-500 rounded-lg bg-gray-50 border border-gray-200">
          <LayoutGrid className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">
            Belum ada Jenis Kegiatan yang ditambahkan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {initialJenisKegiatanList.map((jenisKegiatan) => {
            const detailUrl =
              peran === "MAHASISWA"
                ? `/admin/kegiatan/progress/${jenisKegiatan.id}/${idPengguna}`
                : `/admin/kegiatan?jenisKegiatanId=${jenisKegiatan.id}`;

            return (
              <Card
                key={jenisKegiatan.id}
                className="shadow-sm hover:shadow-md transition-shadow rounded-xl border border-gray-200 flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 leading-snug">
                    {jenisKegiatan.nama}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    Jumlah Kegiatan: {jenisKegiatan.jumlahKegiatan}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href={detailUrl} passHref>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Lihat Progress
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
