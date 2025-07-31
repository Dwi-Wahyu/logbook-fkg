// src/app/admin/pengaturan/program-studi/[id]/_components/PenggunaProgramStudiTable.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
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
import { Loader2, UserPlus, Eye, Edit, Trash2, Search } from "lucide-react"; // Added Search icon

import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs";
import { PenggunaWithRelations } from "@/app/_lib/validations/penggunaSearchParams";

// Define roles for the filter dropdown
const roles = ["MAHASISWA", "DOSEN", "ADMIN", "SUPERADMIN"];

interface PenggunaProgramStudiTableProps {
  initialPenggunaList: PenggunaWithRelations[];
  initialPageCount: number;
  initialFilteredCount: number;
  currentSearchParams: Record<string, string | string[] | undefined>; // Raw search params from server
  programStudiId: string; // ID Program Studi dari URL
  programStudiDisplayName: string;
}

export default function PenggunaProgramStudiTable({
  initialPenggunaList,
  initialPageCount,
  initialFilteredCount,
  currentSearchParams,
  programStudiId, // Digunakan untuk link tambah pengguna
  programStudiDisplayName,
}: PenggunaProgramStudiTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] =
    useState<PenggunaWithRelations[]>(initialPenggunaList);
  const [pageCount, setPageCount] = useState(initialPageCount);
  const [filteredCount, setFilteredCount] = useState(initialFilteredCount);

  // nuqs hooks for managing search params in the URL
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

  // Synchronize internal state with initial props when they change (e.g., after server re-fetch)
  useEffect(() => {
    setData(initialPenggunaList);
    setPageCount(initialPageCount);
    setFilteredCount(initialFilteredCount);
    // Note: useQueryState setters manage URL, no need to manually set states like `setPage(parseInt(currentSearchParams.page?.toString() || "1"))`
    // unless you want to override the URL state from props, which is usually handled by nuqs on initial render.
  }, [initialPenggunaList, initialPageCount, initialFilteredCount]);

  // Effect to trigger router refresh when nuqs query states change
  // This will cause the parent Server Component to re-render with new search params
  useEffect(() => {
    // Only push if not initial render and if query states actually changed from last pushed URL
    // `nuqs` handles the URL update, we just need to trigger the data re-fetch on the server
    startTransition(() => {
      // Construct the URL based on current nuqs state values
      const params = new URLSearchParams();
      if (page) params.set("page", page.toString());
      if (perPage) params.set("perPage", perPage.toString());
      if (nama) params.set("nama", nama);
      if (username) params.set("username", username);
      if (angkatan) params.set("angkatan", angkatan);
      if (peran) params.set("peran", peran);

      // Ensure programStudiId is always part of the path, not query
      const basePath = `/admin/pengaturan/program-studi/${programStudiId}`;
      const newUrl = `${basePath}?${params.toString()}`;

      router.push(newUrl);
    });
  }, [page, perPage, nama, username, angkatan, peran, router, programStudiId]);

  const handleApplyFilters = () => {
    setPage(1); // Reset page to 1 on new filter application
    // The useEffect above will handle the router.push and re-fetch
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // The useEffect above will handle the router.push and re-fetch
  };

  const handleDeletePengguna = async (penggunaId: string) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus pengguna ini?"
    ); // Replace with custom modal
    if (confirmed) {
      // Implement delete action here (e.g., call a server action `deletePengguna(penggunaId)`)
      toast.custom(() => (
        <CustomToast
          title="Hapus Pengguna"
          description={`Fungsi delete untuk pengguna ${penggunaId} akan diimplementasikan.`}
          variant="info"
        />
      ));
      router.refresh(); // Refresh to reflect changes
    }
  };

  return (
    <CardContent className="pt-0">
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 pt-4 mb-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari Nama..."
              value={nama ?? ""}
              onChange={(e) => setNama(e.target.value || null)}
              className="pl-9 w-full"
            />
          </div>
          <div className="relative w-full sm:w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari Username..."
              value={username ?? ""}
              onChange={(e) => setUsername(e.target.value || null)}
              className="pl-9 w-full"
            />
          </div>
          <Input
            placeholder="Angkatan (contoh: 2020)"
            value={angkatan ?? ""}
            onChange={(e) => setAngkatan(e.target.value || null)}
            className="w-full sm:w-[150px]"
          />
          <Select
            value={peran ?? ""}
            onValueChange={(val) => setPeran(val === "" ? null : (val as any))}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Peran</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleApplyFilters}
            disabled={isPending}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Terapkan Filter
          </Button>
        </div>
        <Link
          href={`/admin/pengaturan/pengguna/tambah?programStudiId=${programStudiId}`}
        >
          {" "}
          {/* Pass programStudiId */}
          <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white transition-colors">
            <UserPlus className="mr-2 h-4 w-4" /> Tambah Pengguna
          </Button>
        </Link>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Total Pengguna di {programStudiDisplayName}:{" "}
        <span className="font-semibold">{filteredCount}</span>
      </p>
      {isPending && data.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2 text-gray-500">Memuat data...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center p-8 text-gray-500 rounded-md bg-gray-50 border border-gray-200">
          <p>Tidak ada pengguna yang ditemukan di program studi ini.</p>
        </div>
      ) : (
        <div className="relative w-full overflow-auto rounded-lg border border-gray-200 shadow-sm">
          <Table className="min-w-full bg-white">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-[50px] font-bold text-gray-700">
                  No
                </TableHead>
                <TableHead className="font-bold text-gray-700">Nama</TableHead>
                <TableHead className="font-bold text-gray-700">
                  Username
                </TableHead>
                <TableHead className="font-bold text-gray-700">Peran</TableHead>
                <TableHead className="font-bold text-gray-700">
                  Angkatan
                </TableHead>
                <TableHead className="text-center font-bold text-gray-700">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((pengguna, index) => (
                <TableRow
                  key={pengguna.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-800">
                    {(page - 1) * perPage + index + 1}
                  </TableCell>
                  <TableCell className="text-gray-800">
                    {pengguna.nama}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {pengguna.username}
                  </TableCell>
                  <TableCell>
                    <Badge className="font-semibold text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {" "}
                      {/* Changed badge color */}
                      {pengguna.peran}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {pengguna.mahasiswa?.angkatan || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        href={`/admin/pengaturan/pengguna/detail/${pengguna.id}`}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="p-2 rounded-md border-primary text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Lihat Detail</span>
                        </Button>
                      </Link>
                      <Link
                        href={`/admin/pengaturan/pengguna/edit/${pengguna.id}`}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="p-2 rounded-md border-indigo-500 text-indigo-500 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Pengguna</span>
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="p-2 rounded-md hover:bg-red-600 transition-colors"
                        onClick={() => handleDeletePengguna(pengguna.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Hapus Pengguna</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
