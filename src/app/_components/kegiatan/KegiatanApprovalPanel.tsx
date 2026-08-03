"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNameInitials } from "@/service/getNameInitials";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar, Clock, ShieldCheck, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ApprovalWithPengguna = {
  id: string;
  kegiatanId: string;
  penggunaId: string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  pengguna: {
    id: string;
    nama: string;
    avatar: string | null;
    peran: string;
  };
};

export default function KegiatanApprovalPanel({
  kegiatanId,
}: {
  kegiatanId: string;
}) {
  const [approvals, setApprovals] = useState<ApprovalWithPengguna[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedApproval, setSelectedApproval] =
    useState<ApprovalWithPengguna | null>(null);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/approvals/${kegiatanId}`);
      if (res.ok) {
        const json = await res.json();
        setApprovals(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (kegiatanId) {
      fetchApprovals();
    }

    const handleApprovalUpdate = () => {
      if (kegiatanId) {
        fetchApprovals();
      }
    };

    window.addEventListener("approval-updated", handleApprovalUpdate);
    return () => {
      window.removeEventListener("approval-updated", handleApprovalUpdate);
    };
  }, [kegiatanId]);

  return (
    <>
      <Card className="w-full lg:w-80 shrink-0 h-fit shadow-md rounded-xl border border-gray-200">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Approval
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Persetujuan kegiatan oleh DPJP. Klik untuk melihat detail
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
              Memuat riwayat approval...
            </div>
          ) : approvals.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5">
              <Clock className="h-8 w-8 text-gray-300" />
              <span>Belum ada riwayat approval.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {approvals.map((item) => {
                const isApproved = item.status === "DISETUJUI";
                const isRejected = item.status === "DITOLAK";

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedApproval(item)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-200/80 bg-white hover:bg-gray-50/80 transition-all cursor-pointer shadow-sm hover:shadow-md group"
                  >
                    <Avatar className="h-10 w-10 rounded-full border shrink-0">
                      <AvatarImage
                        src={
                          item.pengguna.avatar
                            ? `/image/profile-picture/${item.pengguna.avatar}`
                            : undefined
                        }
                        alt={item.pengguna.nama}
                      />
                      <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                        {getNameInitials(item.pengguna.nama)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grow min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-semibold text-xs text-gray-900 truncate group-hover:text-primary transition-colors">
                          {item.pengguna.nama}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 font-extrabold uppercase shrink-0 rounded-full ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : isRejected
                                ? "bg-red-50 text-red-700 border-red-300"
                                : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400 shrink-0" />
                        {format(
                          new Date(item.updatedAt || item.createdAt),
                          "dd MMM yyyy, HH:mm",
                          { locale: idLocale },
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Detail Persetujuan Dosen */}
      <Dialog
        open={!!selectedApproval}
        onOpenChange={(open) => !open && setSelectedApproval(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <UserCheck className="h-5 w-5 text-primary" />
              Detail Persetujuan Dosen
            </DialogTitle>
          </DialogHeader>

          {selectedApproval && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <Avatar className="h-12 w-12 rounded-full border shrink-0">
                  <AvatarImage
                    src={
                      selectedApproval.pengguna.avatar
                        ? `/image/profile-picture/${selectedApproval.pengguna.avatar}`
                        : undefined
                    }
                    alt={selectedApproval.pengguna.nama}
                  />
                  <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                    {getNameInitials(selectedApproval.pengguna.nama)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {selectedApproval.pengguna.nama}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Peran: {selectedApproval.pengguna.peran}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-1">
                    Status Persetujuan
                  </span>
                  <Badge
                    className={`font-bold px-2.5 py-0.5 ${
                      selectedApproval.status === "DISETUJUI"
                        ? "bg-emerald-600 text-white"
                        : selectedApproval.status === "DITOLAK"
                          ? "bg-red-600 text-white"
                          : "bg-amber-600 text-white"
                    }`}
                  >
                    {selectedApproval.status}
                  </Badge>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-1">
                    Waktu Approval
                  </span>
                  <span className="font-semibold text-gray-800">
                    {format(
                      new Date(
                        selectedApproval.updatedAt ||
                          selectedApproval.createdAt,
                      ),
                      "dd MMMM yyyy, HH:mm",
                      { locale: idLocale },
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
