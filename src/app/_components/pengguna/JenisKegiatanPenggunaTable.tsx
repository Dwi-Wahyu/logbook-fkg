import { ProgramStudiWithJenisKegiatan } from "@/app/_lib/queries/programStudiQueries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Edit,
  Eye,
  LayoutGrid,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface JenisKegiatanManagementProps {
  initialJenisKegiatanList: ProgramStudiWithJenisKegiatan["jenisKegiatan"];
  idPengguna: string;
}

export default function JenisKegiatanPenggunaTable({
  initialJenisKegiatanList,
  idPengguna,
}: JenisKegiatanManagementProps) {
  return (
    <>
      {initialJenisKegiatanList.length === 0 ? (
        <div className="text-center p-8 text-gray-500 rounded-lg bg-gray-50 border border-gray-200">
          <LayoutGrid className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">
            Belum ada Jenis Kegiatan yang ditambahkan.
          </p>
          <p className="text-sm">
            Silakan tambahkan jenis kegiatan baru di atas.
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

                <TableHead className="text-center font-bold text-gray-700">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialJenisKegiatanList.map((jenisKegiatan, index) => (
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

                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        href={`/admin/kegiatan/progress/${jenisKegiatan.id}/${idPengguna}`}
                        passHref
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="p-2 rounded-md border-indigo-500 text-indigo-500 hover:bg-indigo-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Detail</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
