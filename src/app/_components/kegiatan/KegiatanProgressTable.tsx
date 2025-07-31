// src/app/admin/kegiatan/_components/KegiatanProgressTable.tsx
"use client";

import { useState, useTransition } from "react"; // Hapus useEffect
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, Eye, Edit, Trash2, Filter as FilterIcon } from "lucide-react";

import { CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import Link from "next/link";

import {
  KegiatanWithRelations,
  getAllMataKuliah,
  getAllJenisKegiatan,
} from "@/app/_lib/queries/kegiatanQueries";
import {
  updateKegiatanStatus,
  deleteKegiatan,
} from "@/app/_lib/actions/kegiatanActions";
import { useSession } from "next-auth/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import useQueryState dan parsers dari 'nuqs'
import { useQueryState, parseAsInteger, parseAsStringEnum } from "nuqs";

// Inferensi tipe untuk MataKuliahOption
type MataKuliahOption = Awaited<ReturnType<typeof getAllMataKuliah>>[number];
type JenisKegiatanData = Awaited<
  ReturnType<typeof getAllJenisKegiatan>
>[number];

interface KegiatanProgressTableProps {
  initialKegiatanList: KegiatanWithRelations[];
  initialPageCount: number;
  initialFilteredCount: number;
  // allMataKuliah tidak digunakan di komponen ini, bisa dihapus jika tidak ada rencana pakai
  allMataKuliah: MataKuliahOption[];
  jenisKegiatanData: JenisKegiatanData;
  mahasiswaPenggunaId: string;
}

export default function KegiatanProgressTable({
  initialKegiatanList,
  initialPageCount,
  initialFilteredCount,
  jenisKegiatanData,
  mahasiswaPenggunaId,
}: KegiatanProgressTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [kegiatanToDeleteId, setKegiatanToDeleteId] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Gunakan useQueryState untuk pagination dan filter status ---
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(10).withOptions({ shallow: false })
  );
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringEnum(["DIAJUKAN", "DISETUJUI", "DITOLAK"])
      .withOptions({ clearOnDefault: true })
      .withOptions({ shallow: false })
  );
  // Tambahkan pengajuId dan jenisKegiatanId sebagai useQueryState juga
  // Jika mereka selalu ada di URL, Anda bisa menggunakannya seperti ini.
  // Pastikan parameter ini juga ada di `kegiatanSearchParams.ts`
  const [queryJenisKegiatanId, setQueryJenisKegiatanId] = useQueryState(
    "jenisKegiatanId",
    parseAsStringEnum([jenisKegiatanData.id]).withOptions({
      shallow: false,
      clearOnDefault: true, // Akan dihapus jika null, atau Anda bisa pakai withDefault(jenisKegiatanData.id)
    })
  );
  const [queryPengajuId, setQueryPengajuId] = useQueryState(
    "pengajuId",
    parseAsStringEnum([mahasiswaPenggunaId]).withOptions({
      shallow: false,
      clearOnDefault: true, // Akan dihapus jika null, atau Anda bisa pakai withDefault(mahasiswaPenggunaId)
    })
  );

  // Hapus useEffect sinkronisasi, karena useQueryState menanganinya
  // useEffect(() => {
  //   setData(initialKegiatanList);
  //   setPageCount(initialPageCount);
  //   setFilteredCount(initialFilteredCount);
  //   const urlParams = new URLSearchParams(window.location.search);
  //   setStatusFilter(urlParams.get("status") || "all");
  //   setPage(parseInt(urlParams.get("page") || "1"));
  //   setPerPage(parseInt(urlParams.get("perPage") || "10"));
  // }, [initialKegiatanList, initialPageCount, initialFilteredCount]);

  // Fungsi untuk menerapkan filter
  const handleApplyFilters = () => {
    startTransition(() => {
      setPage(1); // Reset halaman ke 1 saat filter baru diterapkan
      // setStatusFilter sudah diatur oleh komponen Select
      // queryJenisKegiatanId dan queryPengajuId tidak perlu diatur di sini
      // karena mereka diasumsikan sudah ada dari route params.
      // Namun, jika route params TIDAK secara otomatis menjadi query params,
      // Anda mungkin perlu secara eksplisit set ini (lihat catatan di bawah).
    });
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setPage(newPage);
    });
  };

  // --- LOGIKA DAN STATE UNTUK HAPUS KEGIATAN ---
  const handleDeleteClick = (kegiatanId: string) => {
    setKegiatanToDeleteId(kegiatanId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!kegiatanToDeleteId) return;

    setIsDeleting(true);
    const result = await deleteKegiatan(kegiatanToDeleteId);
    setIsDeleting(false);

    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Kegiatan Berhasil Dihapus"
          description={
            result.message ||
            "Data kegiatan telah berhasil dihapus dari sistem."
          }
          variant="success"
        />
      ));
      router.refresh(); // Re-fetch data dari Server Component
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Menghapus Kegiatan"
          description={
            result.message || "Terjadi kesalahan saat menghapus kegiatan."
          }
          variant="destructive"
        />
      ));
    }
    setIsDeleteDialogOpen(false);
    setKegiatanToDeleteId(null);
  };

  const session = useSession();
  const isMahasiswa = session.data?.user.peran === "MAHASISWA";
  const isAdminOrSuperadmin =
    session.data?.user.peran === "ADMIN" ||
    session.data?.user.peran === "SUPERADMIN";

  // Helper untuk mendapatkan nilai field kustom berdasarkan templateKey
  const getFieldValue = (
    kegiatan: KegiatanWithRelations,
    templateKey: string
  ) => {
    const fieldValue = kegiatan.fieldValues.find(
      (fv) => fv.jenisKegiatanField.templateKey === templateKey
    );
    return fieldValue?.value || "-";
  };

  // Helper untuk memformat nilai field berdasarkan fieldType
  const formatValueBasedOnType = (value: any, fieldType: string): string => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return "-";
    }
    switch (fieldType) {
      case "DATE":
        try {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return String(value);
          }
          return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch {
          return String(value);
        }
      case "NUMBER":
        return Number(value).toLocaleString("id-ID");
      case "BOOLEAN":
        return value === "true" || value === true ? "Ya" : "Tidak";
      case "TEXTAREA":
        return String(value);
      default:
        return String(value);
    }
  };

  // Helper untuk mendapatkan status badge class
  const getStatusBadgeColorClass = (status: string) => {
    switch (status) {
      case "DISETUJUI":
        return "bg-green-100 text-green-800 border-green-200";
      case "DIAJUKAN":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DITOLAK":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="pt-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Filter Status */}
        <Select
          value={statusFilter === null ? "all" : statusFilter} // Pastikan nilai default di Select item match
          onValueChange={(value) => {
            if (value === "all") {
              setStatusFilter(null); // Set ke null untuk menghapus dari URL jika clearOnDefault
            } else if (["DIAJUKAN", "DISETUJUI", "DITOLAK"].includes(value)) {
              setStatusFilter(value as "DIAJUKAN" | "DISETUJUI" | "DITOLAK");
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="DIAJUKAN">Diajukan</SelectItem>
            <SelectItem value="DISETUJUI">Disetujui</SelectItem>
            <SelectItem value="DITOLAK">Ditolak</SelectItem>
          </SelectContent>
        </Select>

        {/* Apply Filter Button */}
        <Button onClick={handleApplyFilters} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Terapkan Filter
        </Button>
      </div>

      <p className="text-sm text-gray-600 my-4">
        Total Kegiatan: {initialFilteredCount}
      </p>

      {isPending && initialKegiatanList.length === 0 ? ( // Gunakan initialKegiatanList
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin" size={32} />
          <span className="ml-2">Memuat data...</span>
        </div>
      ) : initialKegiatanList.length === 0 ? ( // Gunakan initialKegiatanList
        <div className="text-center p-8 text-gray-500">
          Tidak ada kegiatan yang ditemukan.
        </div>
      ) : (
        <div className="relative w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <Table className="min-w-full bg-white overflow-x-auto">
            <TableHeader>
              <TableRow>
                {jenisKegiatanData.fields.map((value) => (
                  <TableHead key={value.id}>{value.fieldName}</TableHead>
                ))}
                <TableHead>Status</TableHead> {/* Tambahkan kolom Status */}
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialKegiatanList.map((kegiatan, index) => {
                // Gunakan initialKegiatanList
                const isDosenPembimbing =
                  session.data?.user.id ===
                  kegiatan.logbook.mahasiswa?.pembimbing?.pengguna.id;

                return (
                  <TableRow key={kegiatan.id}>
                    {jenisKegiatanData.fields.map((value) => (
                      <TableCell key={value.id}>
                        {formatValueBasedOnType(
                          getFieldValue(kegiatan, value.templateKey ?? ""),
                          value.fieldType
                        )}
                      </TableCell>
                    ))}
                    {/* Tambahkan Td untuk Status */}
                    <TableCell>
                      {/* prettier-ignore */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColorClass(kegiatan.status)}`}
                      >
                        {kegiatan.status}
                      </span>
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Link href={`/admin/kegiatan/detail/${kegiatan.id}`}>
                        <Button variant="outline" size="sm" className="p-2">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {/* Aksi edit dan hapus (kondisional berdasarkan peran dan status) */}
                      {(isMahasiswa || isAdminOrSuperadmin) && (
                        <>
                          {isMahasiswa && kegiatan.status === "DIAJUKAN" && (
                            <Link href={`/admin/kegiatan/edit/${kegiatan.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="p-2"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="p-2"
                            onClick={() => handleDeleteClick(kegiatan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, (page || 1) - 1))}
              className={
                (page || 1) === 1 ? "pointer-events-none opacity-50" : undefined
              }
            />
          </PaginationItem>
          {Array.from({ length: initialPageCount }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={(page || 1) === i + 1}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                handlePageChange(Math.min(initialPageCount, (page || 1) + 1))
              }
              className={
                (page || 1) === initialPageCount
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <AlertDialog
        open={isDeleteDialogOpen} // Mengontrol visibilitas dialog
        onOpenChange={setIsDeleteDialogOpen} // Untuk menutup dialog jika diklik di luar atau Esc
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Konfirmasi Menghapus Kegiatan
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              Anda yakin ingin menghapus kegiatan ini secara permanen? Tindakan
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" className="px-5 py-2 rounded-md">
                Batal
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleConfirmDelete} // Panggil fungsi konfirmasi saat diklik
                disabled={isDeleting} // Nonaktifkan tombol saat proses penghapusan
                className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? ( // Tampilkan loader jika sedang menghapus
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
