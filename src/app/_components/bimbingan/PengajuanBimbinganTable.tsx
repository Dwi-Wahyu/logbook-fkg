"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { FilterX, Loader2 } from "lucide-react";

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
import { getPermohonanBimbingan } from "@/app/_lib/queries/bimbinganQueries";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import UnauthorizedPage from "../UnauthorizedPage";
import { CustomToast } from "@/components/toast";
import { tanggapiPermohonan } from "@/app/_lib/actions/bimbinganActions";

type TableType = Awaited<ReturnType<typeof getPermohonanBimbingan>>;

type ColumnType = TableType["data"][number];

interface TableProps {
  promises: Promise<[TableType]>;
}

export function PengajuanBimbinganTable({ promises }: TableProps) {
  const [{ data, pageCount }] = React.use(promises);

  const session = useSession();

  if (!session) {
    return <UnauthorizedPage />;
  }

  const [openTerima, setOpenTerima] = useState(false);
  const [openTolak, setOpenTolak] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [alasanDitolak, setAlasanDitolak] = useState("");

  const [nama, setNama] = useQueryState("nama", {
    defaultValue: "",
    shallow: false,
  });

  function handleResetFilter() {
    setNama("");
  }

  function toggleOpenDialog(id: string, aksi: string) {
    setSelectedId(id);

    if (aksi === "TERIMA") {
      setOpenTerima((value) => !value);
    } else {
      setOpenTolak((value) => !value);
    }
  }

  const columns: ColumnDef<ColumnType>[] = [
    {
      accessorKey: "mahasiswa.pengguna.nama",
      header: "Mahasiswa",
    },
    {
      accessorKey: "pesan",
      header: "Kalimat Permohonan",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const mahasiswaAdaPembimbing = false;

        if (mahasiswaAdaPembimbing) {
          return <Badge variant={"destructive"}>Tidak Valid</Badge>;
        }

        switch (row.original.status) {
          case "DISETUJUI":
            return <Badge variant={"outline"}>Disetujui</Badge>;
          case "DITOLAK":
            return <Badge variant={"destructive"}>Ditolak</Badge>;
          case "TERKIRIM":
            return <Badge variant={"secondary"}>Terkirim</Badge>;
        }
      },
    },
    {
      id: "id",
      header: "Aksi",
      accessorKey: "id",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              disabled={row.original.status !== "TERKIRIM"}
              onClick={() => toggleOpenDialog(row.original.id, "TERIMA")}
              size={"sm"}
            >
              Terima
            </Button>
            <Button
              disabled={row.original.status !== "TERKIRIM"}
              onClick={() => toggleOpenDialog(row.original.id, "TOLAK")}
              variant={"destructive"}
              size={"sm"}
            >
              Tolak
            </Button>
          </div>
        );
      },
    },
  ];

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

  async function handleTerima() {
    setLoading(true);

    const request = await tanggapiPermohonan(selectedId, "DISETUJUI", "");

    if (request.success) {
      toast.custom(() => (
        <CustomToast
          title="Persetujuan Berhasil"
          description="Permohonan telah disetujui dan status terkini telah diperbarui."
          variant="success"
        />
      ));

      setLoading(false);
      setOpenTerima(false);
    }
  }

  async function handleTolak() {
    setLoading(true);
    const request = await tanggapiPermohonan(
      selectedId,
      "DITOLAK",
      alasanDitolak
    );

    if (request.success) {
      toast.warning("Penolakan Tercatat", {
        description:
          "Permohonan telah ditolak dan pihak terkait telah diberitahu.",
      });

      setLoading(false);
      setOpenTolak(false);
    }
  }

  return (
    <div>
      <AlertDialog open={openTerima} onOpenChange={setOpenTerima}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Anda Yakin Menyetuji Permohonan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Mahasiswa akan menjadi
              bimbingan anda
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Batalkan</AlertDialogCancel>
            <Button disabled={loading} onClick={handleTerima}>
              {loading ? <Loader2 className="animate-spin" /> : null}
              Yakin
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openTolak} onOpenChange={setOpenTolak}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda Yakin Menolak Permohonan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tolong sertakan alasan permohonan ditolak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={alasanDitolak}
            placeholder="Alasan Ditolak"
            onChange={(event) => setAlasanDitolak(event.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Batalkan</AlertDialogCancel>
            <Button disabled={loading} onClick={handleTolak}>
              {loading ? <Loader2 className="animate-spin" /> : null}
              Yakin
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Cari nama mahasiswa . . ."
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>
        </DataTableAdvancedToolbar>
      </DataTable>
    </div>
  );
}
