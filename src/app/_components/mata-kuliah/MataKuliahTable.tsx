"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Loader2, SquarePen, Trash } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/datatable/data-table";
import { DataTableAdvancedToolbar } from "@/components/datatable/data-table-advanced-toolbar";
import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";

import { useSession } from "next-auth/react";
import { CustomToast } from "@/components/toast";
import { getMataKuliah } from "@/app/_lib/queries/mataKuliahQueries";
import { deleteMataKuliah } from "@/app/_lib/actions/mataKuliahActions";
import Link from "next/link";

type TableType = Awaited<ReturnType<typeof getMataKuliah>>;

type ColumnType = TableType["data"][number];

interface TableProps {
  promises: Promise<[TableType]>;
}

export function MataKuliahTable({ promises }: TableProps) {
  const [{ data, pageCount }] = React.use(promises);
  const session = useSession();

  const [openHapusDialog, setOpenHapusDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(0);

  const [judul, setJudul] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
  });

  function toggleOpenDialog(id: number, action: string) {
    if (action == "delete") {
      setSelectedId(id);
      setOpenHapusDialog((value) => !value);
    } else {
    }
  }

  const columns: ColumnDef<ColumnType>[] = [
    {
      accessorKey: "judul",
      header: "Jenis",
    },
    {
      accessorKey: "semester",
      header: "Semester",
    },
  ];

  const aksiColumn = {
    id: "id",
    header: "Aksi",
    accessorKey: "id",
    cell: ({ row }: { row: any }) => {
      return (
        <>
          <Link
            href={`/admin/pengaturan/mata-kuliah/edit/${row.original.id}`}
            passHref
          >
            <Button size={"sm"}>
              <SquarePen />
              Edit
            </Button>
          </Link>
          <Button
            onClick={() => toggleOpenDialog(row.original.id, "delete")}
            size={"sm"}
            className="ml-2"
            variant={"destructive"}
          >
            <Trash />
            Hapus
          </Button>
        </>
      );
    },
  };

  if (session.data?.user.peran === "ADMIN") {
    columns.push(aksiColumn);
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
    const request = await deleteMataKuliah(selectedId);

    if (request.success) {
      toast.custom(() => (
        <CustomToast
          title="Proses Penghapusan Mata Kuliah Selesai"
          description="Mata kuliah telah berhasil dihapus dari database. Perubahan ini telah tersimpan secara permanen."
          variant="warning"
        />
      ));
      setLoading(false);
      setOpenHapusDialog(false);
    }
  }

  return (
    <div>
      <AlertDialog open={openHapusDialog} onOpenChange={setOpenHapusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Anda Yakin Menghapus Mata Kuliah?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Tindakan ini akan menghapus
              mata kuliah secara permanen. Anda harus mengubah mata kuliah
              kegiatan yang terhubung dengan yang akan anda hapus
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
              placeholder="Cari Mata Kuliah . . ."
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
          </div>
        </DataTableAdvancedToolbar>
      </DataTable>
    </div>
  );
}
