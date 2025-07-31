"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Eye,
  FilterX,
  Loader2,
  MoreHorizontal,
  SquareUserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePengguna } from "../../_lib/actions/penggunaActions";
import { toast } from "sonner";
import { useDataTable } from "@/hooks/use-data-table";
import { getPengguna } from "@/app/_lib/queries/penggunaQueries";
import { DataTable } from "@/components/datatable/data-table";
import { DataTableAdvancedToolbar } from "@/components/datatable/data-table-advanced-toolbar";
import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";

import { useSession } from "next-auth/react";
import { CustomToast } from "@/components/toast";

type TableType = Awaited<ReturnType<typeof getPengguna>>;

type ColumnType = TableType["data"][number];

interface TableProps {
  promises: Promise<[TableType]>;
}

export function AdminProdiTable({ promises }: TableProps) {
  const [{ data, pageCount }] = React.use(promises);
  const session = useSession();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const [nama, setNama] = useQueryState("nama", {
    defaultValue: "",
    shallow: false,
  });
  const [angkatan, setAngkatan] = useQueryState("angkatan", {
    defaultValue: "",
    shallow: false,
  });

  function handleResetFilter() {
    setNama("");
    setAngkatan("");
  }

  function toggleOpenDialog(id: string) {
    setSelectedId(id);
    setOpen((value) => !value);
  }

  const columns: ColumnDef<ColumnType>[] = [
    {
      accessorKey: "username",
      header: "NIM",
    },
    {
      accessorKey: "nama",
      header: "Nama",
    },
    {
      accessorKey: "programStudi.nama",
      header: "Program Studi",
    },
  ];

  const aksiAdmin = {
    id: "id",
    header: "Aksi",
    accessorKey: "id",
    cell: ({ row }: { row: any }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <Link href={`/admin/pengguna/${row.getValue("id")}`}>
              <DropdownMenuItem>Edit Mahasiswa</DropdownMenuItem>
            </Link>
            <Link href={`/admin/pengguna/detail/${row.getValue("id")}`}>
              <DropdownMenuItem>Detail Mahasiswa</DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => toggleOpenDialog(row.getValue("id"))}
            >
              Hapus Mahasiswa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };

  const aksiPublic = {
    id: "id",
    header: "Aksi",
    accessorKey: "id",
    cell: ({ row }: { row: any }) => {
      return (
        <Button asChild size={"sm"}>
          <Link href={`/admin/pengguna/detail/${row.getValue("id")}`}>
            <Eye />
            Detail
          </Link>
        </Button>
      );
    },
  };

  if (session.data?.user.peran === "ADMIN") {
    columns.push(aksiAdmin);
  } else {
    columns.push(aksiPublic);
  }

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pageCount,
    shallow: false,
    clearOnDefault: true,
    initialState: {
      pagination: {
        pageSize: 5,
        pageIndex: 0,
      },
    },
  });

  async function handleDelete() {
    setLoading(true);
    const request = await deletePengguna(selectedId);

    if (request.success) {
      toast.custom(() =>
        CustomToast({
          title: "Akun Dihapus",
          description: "Pengguna telah berhasil dihapus dari sistem.",
          variant: "success",
        })
      );

      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda Yakin Menghapus Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Tindakan ini akan menghapus
              akun secara permanen dan menghapus data Anda dari server kami.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Batalkan</AlertDialogCancel>
            <Button disabled={loading} onClick={handleDelete}>
              {loading ? <Loader2 className="animate-spin" /> : null}
              Yakin
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <div className="flex gap-2 items-center flex-col sm:flex-row">
            <Input
              placeholder="Cari nama . . ."
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />

            <Button onClick={handleResetFilter} variant={"outline"}>
              <FilterX />
              Reset Filter
            </Button>
          </div>
        </DataTableAdvancedToolbar>
      </DataTable>
    </div>
  );
}
