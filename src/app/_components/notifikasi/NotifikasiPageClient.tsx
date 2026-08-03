"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Bell, Trash2, Loader2 } from "lucide-react";
import { hapusNotifikasi } from "@/app/_lib/actions/notifikasiAction";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import { useQueryState, parseAsInteger } from "nuqs";

type NotifikasiItem = {
  id: string;
  judul: string;
  pesan: string;
  isRead: boolean;
  createdAt: Date;
};

interface NotifikasiPageClientProps {
  initialNotifikasiList: NotifikasiItem[];
  totalCount: number;
  pageCount: number;
}

export default function NotifikasiPageClient({
  initialNotifikasiList,
  totalCount,
  pageCount,
}: NotifikasiPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10).withOptions({ shallow: false })
  );

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setPage(newPage);
    });
  };

  const handleLimitChange = (newLimit: string) => {
    startTransition(() => {
      setLimit(parseInt(newLimit));
      setPage(1);
    });
  };

  const handleHapus = async (id: string) => {
    const res = await hapusNotifikasi(id);
    if (res.success) {
      toast.custom(() => (
        <CustomToast
          title="Notifikasi Dihapus"
          description="Notifikasi berhasil dihapus."
          variant="success"
        />
      ));
      router.refresh();
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Menghapus"
          description="Terjadi kesalahan saat menghapus notifikasi."
          variant="destructive"
        />
      ));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl border border-gray-200">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Bell className="h-7 w-7 text-primary" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Daftar Notifikasi
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  Total {totalCount} notifikasi ditemukan
                </CardDescription>
              </div>
            </div>

            {/* Limit Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Tampilkan per halaman:
              </span>
              <Select
                value={String(limit || 10)}
                onValueChange={handleLimitChange}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isPending ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-primary" size={32} />
              <span className="ml-2 text-sm text-muted-foreground">
                Memuat data...
              </span>
            </div>
          ) : initialNotifikasiList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-40" />
              <h3 className="text-lg font-semibold text-gray-800">
                Belum Ada Notifikasi
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Anda belum memiliki notifikasi saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {initialNotifikasiList.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1 grow">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-gray-900">
                        {notif.judul}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notif.pesan}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleHapus(notif.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    title="Hapus notifikasi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pageCount > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, (page || 1) - 1))
                    }
                    className={
                      (page || 1) === 1
                        ? "pointer-events-none opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: pageCount }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={(page || 1) === i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(Math.min(pageCount, (page || 1) + 1))
                    }
                    className={
                      (page || 1) === pageCount
                        ? "pointer-events-none opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
