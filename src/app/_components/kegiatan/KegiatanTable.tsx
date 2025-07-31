"use client";

import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
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
import { Loader2, PlusCircle, Trash2, Edit, Eye, Filter } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  deleteKegiatan,
  updateKegiatanStatus,
} from "@/app/_lib/actions/kegiatanActions";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import Link from "next/link";

import {
  KegiatanWithRelations,
  getAllJenisKegiatan,
} from "@/app/_lib/queries/kegiatanQueries";
import { useSession } from "next-auth/react";

// Import useQueryState DAN parsers dari 'nuqs'
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  parseAsBoolean,
} from "nuqs";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type MataKuliahOption = {
  id: number;
  judul: string;
  semester: number;
};

type JenisKegiatanOption = Awaited<
  ReturnType<typeof getAllJenisKegiatan>
>[number];

interface KegiatanTableProps {
  initialKegiatanList: KegiatanWithRelations[];
  initialPageCount: number;
  initialFilteredCount: number;
  allMataKuliah: MataKuliahOption[];
  allJenisKegiatan: JenisKegiatanOption[];
}

export default function KegiatanTable({
  initialKegiatanList,
  initialPageCount,
  initialFilteredCount,
  allMataKuliah,
  allJenisKegiatan,
}: KegiatanTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [kegiatanToDeleteId, setKegiatanToDeleteId] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // --- Gunakan useQueryState dengan parser yang memiliki opsi shallow: false ---
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false }) // Opsi shallow digabung di sini
  );
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(10).withOptions({ shallow: false }) // Opsi shallow digabung di sini
  );
  const [judulFilter, setJudulFilter] = useQueryState(
    "judul",
    parseAsString.withDefault("").withOptions({ shallow: false }) // Opsi shallow digabung di sini
  );
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringEnum(["DIAJUKAN", "DISETUJUI", "DITOLAK"])
      .withOptions({ clearOnDefault: true })
      .withOptions({ shallow: false }) // Opsi shallow digabung di sini
  );
  const [mataKuliahFilter, setMataKuliahFilter] = useQueryState(
    "mataKuliahId",
    parseAsString.withDefault("").withOptions({ shallow: false }) // Opsi shallow digabung di sini
  );
  const [semesterFilter, setSemesterFilter] = useQueryState(
    "semester",
    parseAsInteger
      .withOptions({ clearOnDefault: true })
      .withOptions({ shallow: false }) // Opsi shallow digabung di sini
  );
  const [jenisKegiatanFilter, setJenisKegiatanFilter] = useQueryState(
    "jenisKegiatanId",
    parseAsString.withDefault("").withOptions({ shallow: false }) // Opsi shallow digabung di sini
  );
  const [filterAllProgramStudi, setFilterAllProgramStudi] = useQueryState(
    "filterAllProgramStudi",
    parseAsBoolean.withDefault(false).withOptions({ shallow: false }) // Opsi shallow digabung di sini
  );

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
      router.refresh();
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

  const handleUpdateStatus = async (
    kegiatanId: string,
    newStatus: "DIAJUKAN" | "DISETUJUI" | "DITOLAK"
  ) => {
    let alasanDitolak: string | undefined = undefined;
    if (newStatus === "DITOLAK") {
      const promptResult = window.prompt("Masukkan alasan penolakan:");
      if (promptResult === null || promptResult === "") {
        toast.custom(() => (
          <CustomToast
            title="Aksi Dibatalkan"
            description="Penolakan kegiatan dibatalkan karena alasan tidak diisi."
            variant="info"
          />
        ));
        return;
      }
      alasanDitolak = promptResult;
    }

    const result = await updateKegiatanStatus({
      kegiatanId,
      status: newStatus,
      alasanDitolak,
    });
    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Status Diperbarui"
          description={`Status kegiatan berhasil diubah menjadi ${newStatus}.`}
          variant="success"
        />
      ));
      router.refresh();
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Memperbarui Status"
          description={
            result.message || "Terjadi kesalahan saat memperbarui status."
          }
          variant="destructive"
        />
      ));
    }
  };

  const session = useSession();
  const isDosen = session.data?.user.peran === "DOSEN";
  const isMahasiswa = session.data?.user.peran === "MAHASISWA";
  const isAdminOrSuperadmin =
    session.data?.user.peran === "ADMIN" ||
    session.data?.user.peran === "SUPERADMIN";

  const semesterOptions = Array.from({ length: 14 }, (_, i) => i + 1);

  const getFieldValue = (
    kegiatan: KegiatanWithRelations,
    templateKey: string
  ) => {
    const fieldValue = kegiatan.fieldValues.find(
      (fv) => fv.jenisKegiatanField.templateKey === templateKey
    );
    return fieldValue?.value || "-";
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setPage(newPage);
    });
  };

  const handleApplyFilters = () => {
    startTransition(() => {
      setPage(1);
    });
    setIsFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    startTransition(() => {
      setPage(null);
      setPerPage(null);
      setJudulFilter(null);
      setStatusFilter(null);
      setMataKuliahFilter(null);
      setSemesterFilter(null);
      setJenisKegiatanFilter(null);
      setFilterAllProgramStudi(null);
    });
    setIsFilterDialogOpen(false);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Daftar Kegiatan
        </CardTitle>
        <div className="flex items-center justify-between gap-4 pt-4 flex-wrap">
          <Dialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filter Kegiatan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-xl p-6">
              <DialogHeader>
                <DialogTitle>Filter Kegiatan</DialogTitle>
                <DialogDescription>
                  Pilih kriteria untuk memfilter daftar kegiatan.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Select
                  value={statusFilter === null ? "all" : statusFilter}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setStatusFilter(null);
                    } else if (
                      ["DIAJUKAN", "DISETUJUI", "DITOLAK"].includes(value)
                    ) {
                      setStatusFilter(
                        value as "DIAJUKAN" | "DISETUJUI" | "DITOLAK"
                      );
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="DIAJUKAN">Diajukan</SelectItem>
                    <SelectItem value="DISETUJUI">Disetujui</SelectItem>
                    <SelectItem value="DITOLAK">Ditolak</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={mataKuliahFilter || "all"}
                  onValueChange={(value) =>
                    setMataKuliahFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter Mata Kuliah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                    <SelectItem value="0">Tidak Ada Mata Kuliah</SelectItem>
                    {allMataKuliah.map((mk) => (
                      <SelectItem key={mk.id} value={mk.id.toString()}>
                        {mk.judul} (Sm. {mk.semester})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(isMahasiswa || isDosen || isAdminOrSuperadmin) && (
                  <Select
                    value={
                      semesterFilter === null
                        ? "all"
                        : semesterFilter.toString()
                    }
                    onValueChange={(value) =>
                      setSemesterFilter(
                        value === "all" ? null : parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Semester</SelectItem>
                      {semesterOptions.map((s) => (
                        <SelectItem key={s} value={s.toString()}>
                          Semester {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select
                  value={jenisKegiatanFilter || "all"}
                  onValueChange={(value) =>
                    setJenisKegiatanFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter Jenis Kegiatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis Kegiatan</SelectItem>
                    {allJenisKegiatan.map((jk) => (
                      <SelectItem key={jk.id} value={jk.id}>
                        {jk.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isDosen && (
                  <div className="flex shadow-sm border rounded-lg px-3 py-2 gap-3 items-center">
                    <Switch
                      id="filterAllProgramStudi"
                      checked={filterAllProgramStudi || false}
                      onCheckedChange={(checked) =>
                        setFilterAllProgramStudi(checked)
                      }
                    />
                    <Label className="text-sm" htmlFor="filterAllProgramStudi">
                      Tampilkan Semua Kegiatan Mahasiswa Program Studi Ini
                    </Label>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleResetFilters}>
                  Reset Filter
                </Button>
                {/* <Button onClick={handleApplyFilters} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Terapkan Filter
                </Button> */}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isMahasiswa && (
            <Link href="/admin/kegiatan/tambah-kegiatan">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kegiatan
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-4">
          Total Kegiatan: {initialFilteredCount}
        </p>

        {isPending && initialKegiatanList.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin" size={32} />
            <span className="ml-2">Memuat data...</span>
          </div>
        ) : initialKegiatanList.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Tidak ada kegiatan yang ditemukan.
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <Table className="min-w-full bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead className="">No</TableHead>
                  <TableHead className="">Jenis Kegiatan</TableHead>
                  <TableHead className="">Mata Kuliah</TableHead>
                  <TableHead className="">Pengaju</TableHead>
                  <TableHead className="">Status</TableHead>
                  <TableHead className=" text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialKegiatanList.map((kegiatan, index) => {
                  const isDosenPembimbing =
                    session.data?.user.id ===
                    kegiatan.logbook.mahasiswa?.pembimbing?.pengguna.id;

                  return (
                    <TableRow key={kegiatan.id}>
                      <TableCell>
                        {((page || 1) - 1) * (perPage || 10) + index + 1}
                      </TableCell>
                      <TableCell>{kegiatan.jenisKegiatan.nama}</TableCell>
                      <TableCell>
                        {kegiatan.MataKuliah?.judul
                          ? `${kegiatan.MataKuliah.judul} (Sm. ${kegiatan.MataKuliah.semester})`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {kegiatan.logbook.mahasiswa?.pengguna.nama || "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${
                            kegiatan.status === "DISETUJUI"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                          ${
                            kegiatan.status === "DIAJUKAN"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                          }
                          ${
                            kegiatan.status === "DITOLAK"
                              ? "bg-red-100 text-red-800"
                              : ""
                          }
                        `}
                        >
                          {kegiatan.status}
                        </span>
                      </TableCell>
                      <TableCell className="flex space-x-2 justify-center">
                        {(isMahasiswa || isAdminOrSuperadmin) && (
                          <>
                            <Link
                              href={`/admin/kegiatan/detail/${kegiatan.id}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="p-2"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {isMahasiswa && kegiatan.status === "DIAJUKAN" && (
                              <Link
                                href={`/admin/kegiatan/edit/${kegiatan.id}`}
                              >
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

                        {(isDosen || isAdminOrSuperadmin) && (
                          <>
                            {!(isMahasiswa || isAdminOrSuperadmin) && (
                              <Link
                                href={`/admin/kegiatan/detail/${kegiatan.id}`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="p-2"
                                >
                                  Detail
                                </Button>
                              </Link>
                            )}
                            {isDosenPembimbing && (
                              <>
                                <Button
                                  size="sm"
                                  className="p-2"
                                  disabled={kegiatan.status === "DISETUJUI"}
                                  onClick={() =>
                                    handleUpdateStatus(kegiatan.id, "DISETUJUI")
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={kegiatan.status === "DITOLAK"}
                                  className="p-2"
                                  onClick={() =>
                                    handleUpdateStatus(kegiatan.id, "DITOLAK")
                                  }
                                >
                                  Tolak
                                </Button>
                              </>
                            )}
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

        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, (page || 1) - 1))}
                className={
                  (page || 1) === 1
                    ? "pointer-events-none opacity-50"
                    : undefined
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
      </CardContent>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
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
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
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
    </Card>
  );
}
