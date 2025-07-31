// src/app/admin/pengaturan/program-studi/[id]/_components/PenggunaProgramStudiOverview.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  UsersRound,
  ShieldUser,
  Eye,
  Frown,
  Search,
  Loader2,
  Filter, // Import Filter icon
  UserPlus, // Import UserPlus icon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import { useQueryState } from "nuqs";
import { parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs";
import {
  // Import Dialog components
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// Define roles for the filter dropdown
const roles = ["MAHASISWA", "DOSEN", "ADMIN"];

type PenggunaListResult = Awaited<
  ReturnType<
    typeof import("@/app/_lib/queries/penggunaQueries").getPenggunaByProgramStudi
  >
>;
type PenggunaItemType = PenggunaListResult["data"][number];

interface PenggunaProgramStudiOverviewProps {
  initialPenggunaList: PenggunaItemType[];
  programStudiDisplayName: string;
  programStudiId: string;
  currentSearchParams: Record<string, string | string[] | undefined>;
  // Tambahkan pageCount dan filteredCount jika ingin menggunakannya untuk pagination
  initialPageCount: number;
  // initialFilteredCount: number;
}

export default function PenggunaProgramStudiOverview({
  initialPenggunaList,
  programStudiDisplayName,
  programStudiId,

  initialPageCount,
  currentSearchParams,
}: // initialPageCount,
// initialFilteredCount,
PenggunaProgramStudiOverviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<PenggunaItemType[]>(initialPenggunaList);

  const [pageCount, setPageCount] = useState(initialPageCount);

  // State untuk kontrol Dialog Filter
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (newPage !== page) {
      setPage(newPage);
    }
  };

  // nuqs hooks untuk mengelola search params di URL
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(10)
  );
  const [nama, setNama] = useQueryState("nama", parseAsString.withDefault(""));
  const [username, setUsername] = useQueryState(
    "username",
    parseAsString.withDefault("")
  );
  const [angkatan, setAngkatan] = useQueryState(
    "angkatan",
    parseAsString.withDefault("")
  );
  const [peran, setPeran] = useQueryState(
    "peran",
    parseAsStringEnum(roles).withOptions({ clearOnDefault: true })
  );

  // State lokal untuk nilai input filter (tidak memicu re-fetch langsung)
  const [namaFilter, setNamaFilter] = useState<string>(nama || "");
  const [usernameFilter, setUsernameFilter] = useState<string>(username || "");
  const [angkatanFilter, setAngkatanFilter] = useState<string>(angkatan || "");
  const [peranFilter, setPeranFilter] = useState<string>(peran || "");

  // Update `data` dan sinkronkan filter lokal ketika `initialPenggunaList` props berubah
  useEffect(() => {
    setData(initialPenggunaList);
    // Sinkronkan state filter lokal dengan nuqs state yang diperbarui dari URL
    setNamaFilter(nama || "");
    setUsernameFilter(username || "");
    setAngkatanFilter(angkatan || "");
    setPeranFilter(peran || "");
  }, [initialPenggunaList, nama, username, angkatan, peran]);

  // Effect ini HANYA akan dipicu ketika ada perubahan pada `page` atau `perPage`
  // yang berasal dari pagination, atau saat `handleApplyFilters` dipanggil.
  // Ini mencegah re-fetch pada setiap keystroke.
  useEffect(() => {
    // startTransition digunakan untuk menunjukkan loading state
    startTransition(() => {
      // Router push dan refresh untuk memicu re-fetch data dari Server Component
      // nuqs hooks sudah mengelola URL, jadi cukup panggil router.refresh()
      router.refresh();
    });
  }, [page, perPage, nama, username, angkatan, peran, router]); // Dependensi pada nuqs states

  useEffect(() => {
    setPageCount(initialPageCount);
  }, [initialPageCount]);

  // Group users by role for organized display (uses `data` from state)
  const groupedUsers = useMemo(() => {
    const groups: {
      MAHASISWA: PenggunaItemType[];
      DOSEN: PenggunaItemType[];
      ADMIN: PenggunaItemType[];
      SUPERADMIN: PenggunaItemType[];
    } = {
      MAHASISWA: [],
      DOSEN: [],
      ADMIN: [],
      SUPERADMIN: [],
    };

    data.forEach((user) => {
      if (Object.keys(groups).includes(user.peran)) {
        groups[user.peran as keyof typeof groups].push(user);
      }
    });
    return groups;
  }, [data]);

  // Helper function to get the appropriate icon based on the user's role
  const getRoleIcon = (peran: string) => {
    switch (peran) {
      case "MAHASISWA":
        return <User className="h-5 w-5 text-blue-500" />;
      case "DOSEN":
        return <UsersRound className="h-5 w-5 text-green-500" />;
      case "ADMIN":
        return <ShieldUser className="h-5 w-5 text-indigo-500" />;
      case "SUPERADMIN":
        return <ShieldUser className="h-5 w-5 text-red-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const rolesToDisplay = ["MAHASISWA", "DOSEN", "ADMIN"];

  // Handler untuk tombol "Terapkan Filter" di dalam Dialog
  const handleApplyFilters = () => {
    setPage(1); // Reset halaman ke 1 saat filter baru diterapkan
    // Sekarang, update nuqs states dari local filter states
    // Ini akan memicu useEffect di atas (yang kemudian memicu router.refresh)
    startTransition(async () => {
      await Promise.all([
        setNama(namaFilter || null), // Set null jika string kosong
        setUsername(usernameFilter || null),
        setAngkatan(angkatanFilter || null),
        setPeran(peranFilter === "" ? null : (peranFilter as any)), // Set null jika string kosong
      ]);
      setIsFilterDialogOpen(false); // Tutup dialog filter
    });
  };

  // Handler untuk tombol "Reset Filter"
  const handleResetFilters = () => {
    setNamaFilter("");
    setUsernameFilter("");
    setAngkatanFilter("");
    setPeranFilter("");
    setPage(1); // Reset page to 1
    setPerPage(10); // Reset perPage

    // Clear all params from URL via nuqs setters (this will also trigger the useEffect)
    startTransition(async () => {
      await Promise.all([
        setNama(null),
        setUsername(null),
        setAngkatan(null),
        setPeran(null),
        setPage(1),
        setPerPage(10),
      ]);
      setIsFilterDialogOpen(false); // Tutup dialog filter
    });
  };

  // Placeholder for delete action (needs server action)
  const handleDeletePengguna = async (penggunaId: string) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus pengguna ini?"
    );
    if (confirmed) {
      toast.custom(() => (
        <CustomToast
          title="Hapus Pengguna"
          description={`Fungsi delete untuk pengguna ${penggunaId} akan diimplementasikan.`}
          variant="info"
        />
      ));
      router.refresh();
    }
  };

  return (
    <CardContent className="pt-0">
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 pt-4 mb-4">
        {/* Tombol Filter yang memicu Dialog */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-xl p-6">
            <DialogHeader>
              <DialogTitle>Filter Pengguna</DialogTitle>
              <DialogDescription>
                Pilih kriteria untuk memfilter daftar pengguna.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari Nama..."
                  value={namaFilter}
                  onChange={(e) => setNamaFilter(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari Username..."
                  value={usernameFilter}
                  onChange={(e) => setUsernameFilter(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <Input
                placeholder="Angkatan (cth: 2020)"
                value={angkatanFilter}
                onChange={(e) => setAngkatanFilter(e.target.value)}
                className="w-full"
              />
              <Select value={peranFilter} onValueChange={setPeranFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter Peran" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleResetFilters}>
                Reset Filter
              </Button>
              <Button onClick={handleApplyFilters} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Terapkan Filter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Link href={`/admin/pengguna/tambah-pengguna`}>
          <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center px-4 py-2">
            <UserPlus className="mr-2 h-4 w-4" /> Tambah Pengguna
          </Button>
        </Link>
      </div>

      {isPending ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2 text-gray-500">Memuat data pengguna...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center p-8 text-gray-500 rounded-lg bg-gray-50 border border-gray-200">
          <Frown className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">
            Tidak ada pengguna yang ditemukan dengan filter ini di{" "}
            <span className="font-semibold">{programStudiDisplayName}</span>.
          </p>
          <p className="text-sm">Coba sesuaikan filter Anda.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {rolesToDisplay.map((role) => {
            const usersInRole = groupedUsers[role as keyof typeof groupedUsers];
            if (usersInRole.length === 0) {
              return null;
            }
            return (
              <div
                key={role}
                className="rounded-lg border border-gray-200 shadow-sm p-4 bg-white"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  {getRoleIcon(role)}
                  <span>
                    {role} ({usersInRole.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usersInRole.map((pengguna) => (
                    <div
                      key={pengguna.id}
                      className="border border-gray-100 rounded-lg p-4 bg-white flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        {getRoleIcon(pengguna.peran)}
                        <div>
                          <p className="font-semibold text-lg text-gray-900">
                            {pengguna.nama}
                          </p>
                          <p className="text-sm text-gray-600">
                            @{pengguna.username}
                          </p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Link href={`/admin/pengguna/detail/${pengguna.id}`}>
                          <Button
                            variant="outline"
                            className="w-full text-primary border-primary hover:bg-primary/10 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-2" /> Lihat Detail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              className={
                page === 1 ? "pointer-events-none opacity-50" : undefined
              }
            />
          </PaginationItem>
          {Array.from({ length: pageCount }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={page === i + 1}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(Math.min(pageCount, page + 1))}
              className={
                page === pageCount
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </CardContent>
  );
}
