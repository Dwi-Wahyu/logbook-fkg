// src/app/admin/kegiatan/detail/_components/KegiatanDetailClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Download,
  User,
  BookOpen,
  MapPin,
  Calendar,
  FileText,
  XCircle,
  CheckCircle,
  CircleX,
  ShieldCheckIcon,
  Info,
  Loader2,
  Hash, // For number field type
  ToggleRight, // For boolean field type
  Key, // For template key
  MessageSquare,
  Paperclip, // For notes/comments
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import {
  updateKegiatanStatus,
  addCatatanKegiatan,
} from "@/app/_lib/actions/kegiatanActions";

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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNameInitials } from "@/service/getNameInitials";

// Import type for KegiatanWithRelations from queries
import {
  KegiatanWithRelations,
  FieldValueWithDefinition,
} from "@/app/_lib/queries/kegiatanQueries";
import CatatanList from "../CatatanList";
import AddCatatanForm from "../AddCatatanForm";

// Import komponen catatan

interface KegiatanDetailClientProps {
  kegiatan: KegiatanWithRelations;
}

export default function KegiatanDetailClient({
  kegiatan,
}: KegiatanDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isConfirmingApprove, setIsConfirmingApprove] = useState(false);
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

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

  const getFormattedFieldValue = (key: string): string => {
    let fieldValueEntry = kegiatan.fieldValues.find(
      (fv) => fv.jenisKegiatanField.templateKey === key
    );
    if (!fieldValueEntry) {
      fieldValueEntry = kegiatan.fieldValues.find(
        (fv) =>
          fv.jenisKegiatanField.fieldName?.toLowerCase() === key.toLowerCase()
      );
    }
    if (
      !fieldValueEntry ||
      fieldValueEntry.value === null ||
      fieldValueEntry.value === undefined ||
      String(fieldValueEntry.value).trim() === ""
    ) {
      return "-";
    }
    return formatValueBasedOnType(
      fieldValueEntry.value,
      fieldValueEntry.jenisKegiatanField.fieldType
    );
  };

  const judulKegiatan =
    getFormattedFieldValue("judul") ||
    kegiatan.jenisKegiatan.nama ||
    "Judul Tidak Tersedia";
  const lokasiKegiatan =
    getFormattedFieldValue("lokasi") || "Lokasi Tidak Tersedia";

  const isMahasiswaPengaju =
    session?.user.id === kegiatan.logbook.mahasiswa?.pengguna.id;
  const isDosenPembimbing =
    session?.user.id === kegiatan.logbook.mahasiswa?.pembimbing?.pengguna.id;
  const isAdminOrSuperadmin =
    session?.user.peran === "ADMIN" || session?.user.peran === "SUPERADMIN";

  const canEditKegiatan = isMahasiswaPengaju && kegiatan.status === "DIAJUKAN";
  // Hanya Dosen/Admin yang bisa menanggapi atau menambahkan catatan
  const canTanggapiAtauCatat = isDosenPembimbing || isAdminOrSuperadmin;

  const handleUpdateStatus = async (
    newStatus: "DISETUJUI" | "DITOLAK",
    alasanDitolak?: string
  ) => {
    setLoadingAction(true);
    const result = await updateKegiatanStatus({
      kegiatanId: kegiatan.id,
      status: newStatus,
      alasanDitolak: newStatus === "DITOLAK" ? alasanDitolak : undefined,
    });

    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title={`Kegiatan Berhasil ${
            newStatus === "DISETUJUI" ? "Disetujui" : "Ditolak"
          }`}
          description={`Status kegiatan berhasil diubah menjadi ${newStatus}.`}
          variant="success"
          icon={
            newStatus === "DISETUJUI" ? (
              <CheckCircle width={50} height={50} />
            ) : (
              <CircleX width={50} height={50} />
            )
          }
        />
      ));
      router.refresh();
    } else {
      toast.custom(() => (
        <CustomToast
          title={`Gagal ${
            newStatus === "DISETUJUI" ? "Menyetujui" : "Menolak"
          } Kegiatan`}
          description={
            result.message || "Terjadi kesalahan saat memperbarui status."
          }
          variant="destructive"
          icon={<XCircle width={50} height={50} />}
        />
      ));
    }
    setLoadingAction(false);
  };

  const handleApprove = () => {
    setIsConfirmingApprove(true);
  };
  const handleReject = () => {
    setIsConfirmingReject(true);
  };
  const handleConfirmApprove = () => {
    handleUpdateStatus("DISETUJUI");
    setIsConfirmingApprove(false);
  };
  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.custom(() => (
        <CustomToast
          title="Alasan Diperlukan"
          description="Alasan penolakan tidak boleh kosong."
          variant="info"
          icon={<Info width={50} height={50} />}
        />
      ));
      return;
    }
    handleUpdateStatus("DITOLAK", rejectionReason);
    setIsConfirmingReject(false);
    setRejectionReason("");
  };

  return (
    <Card className="w-full shadow-lg max-w-4xl mx-auto rounded-xl">
      <CardHeader className=" border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="text-sm px-4 py-2 flex items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-md"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Button>

          <div className="flex items-center space-x-2">
            {/* Edit button for student pengaju (if status is DIAJUKAN) */}
            {canEditKegiatan && (
              <Link href={`/admin/kegiatan/edit/${kegiatan.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 flex items-center border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors rounded-md"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit Kegiatan
                </Button>
              </Link>
            )}

            {/* Response buttons for Dosen Pembimbing or Admin/Superadmin */}
            {canTanggapiAtauCatat && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={loadingAction || kegiatan.status === "DISETUJUI"}
                  className="px-4 py-2 flex items-center bg-green-600 hover:bg-green-700 text-white transition-colors rounded-md"
                >
                  {loadingAction ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Setujui
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={loadingAction || kegiatan.status === "DITOLAK"}
                  variant="destructive"
                  className="px-4 py-2 flex items-center transition-colors rounded-md"
                >
                  {loadingAction ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CircleX className="h-4 w-4 mr-1" />
                  )}
                  Tolak
                </Button>
              </>
            )}
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
          {judulKegiatan}
        </CardTitle>
        <CardDescription className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-1" /> {lokasiKegiatan}
        </CardDescription>
        <div className="mt-4 flex items-center space-x-3">
          <Badge
            className={`${getStatusBadgeColorClass(
              kegiatan.status
            )} border px-3 py-1 text-sm font-semibold`}
          >
            Status: {kegiatan.status}
          </Badge>
          {/* <span className="text-sm text-gray-500 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Dibuat:{" "}
            {new Date(kegiatan.createdAt).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span> */}
          {kegiatan.status === "DITOLAK" && kegiatan.alasanDitolak && (
            <Badge
              variant="destructive"
              className="flex items-center text-sm font-semibold px-3 py-1"
            >
              <XCircle className="h-4 w-4 mr-1" /> Alasan Ditolak:{" "}
              {kegiatan.alasanDitolak}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className=" pt-0 space-y-6">
        {/* Informasi Utama Kegiatan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-700">Jenis Kegiatan</h3>
            <p className="text-gray-900 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
              {kegiatan.jenisKegiatan.nama}
            </p>
          </div>
          {/* Tampilkan Mata Kuliah hanya jika isMataKuliahRequired true dan ada MataKuliah */}
          {kegiatan.jenisKegiatan.isMataKuliahRequired &&
            kegiatan.MataKuliah && (
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-700">
                  Mata Kuliah Terkait
                </h3>
                <p className="text-gray-900 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                  {kegiatan.MataKuliah.judul} (Semester{" "}
                  {kegiatan.MataKuliah.semester})
                </p>
              </div>
            )}
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-700">Diajukan Oleh</h3>
            <p className="text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-2 text-green-500" />
              {kegiatan.logbook.mahasiswa?.pengguna.nama || "-"} (NIM:{" "}
              {kegiatan.logbook.mahasiswa?.pengguna.username || "-"})
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-gray-700">
              Dosen Penanggung Jawab
            </h3>
            <p className="text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-2 text-indigo-500" />
              {kegiatan.logbook.mahasiswa?.pembimbing?.pengguna.nama ||
                "Belum Ditentukan"}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Detail Dinamis dari fieldValues */}
        {kegiatan.fieldValues.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Detail Kegiatan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Urutkan fieldValues berdasarkan order dari jenisKegiatanField-nya */}
              {kegiatan.fieldValues
                .sort(
                  (a, b) =>
                    a.jenisKegiatanField.order - b.jenisKegiatanField.order
                )
                .map((fieldValueEntry) => (
                  <div
                    key={fieldValueEntry.jenisKegiatanField.id}
                    className="space-y-1 p-3 border rounded-md bg-white shadow-sm"
                  >
                    <h3 className="font-semibold text-gray-700 flex items-center">
                      {fieldValueEntry.jenisKegiatanField.fieldType ===
                        "TEXT" && (
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      )}
                      {fieldValueEntry.jenisKegiatanField.fieldType ===
                        "NUMBER" && (
                        <Hash className="h-4 w-4 mr-2 text-green-500" />
                      )}
                      {fieldValueEntry.jenisKegiatanField.fieldType ===
                        "DATE" && (
                        <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      )}
                      {fieldValueEntry.jenisKegiatanField.fieldType ===
                        "BOOLEAN" && (
                        <ToggleRight className="h-4 w-4 mr-2 text-orange-500" />
                      )}
                      {fieldValueEntry.jenisKegiatanField.fieldType ===
                        "TEXTAREA" && (
                        <FileText className="h-4 w-4 mr-2 text-yellow-500" />
                      )}
                      {fieldValueEntry.jenisKegiatanField.fieldName}
                    </h3>
                    <p className="text-gray-900 break-words text-sm">
                      {formatValueBasedOnType(
                        fieldValueEntry.value,
                        fieldValueEntry.jenisKegiatanField.fieldType
                      )}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm p-4 border rounded-md bg-gray-50">
            Tidak ada field kustom yang ditentukan untuk jenis kegiatan ini.
          </p>
        )}

        <Separator className="my-6" />

        <div>
          {/* Lampiran */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-primary" />
              Lampiran ({kegiatan.lampiran.length})
            </h2>
          </div>
          {kegiatan.lampiran.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {kegiatan.lampiran.map((lampiran) => (
                <a
                  key={lampiran.id}
                  href={lampiran.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 transition-colors bg-white shadow-sm"
                >
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                    {lampiran.namaFile}
                  </span>
                  <Download className="h-4 w-4 text-gray-500 flex-shrink-0" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Tidak ada lampiran untuk kegiatan ini.
            </p>
          )}
        </div>

        <Separator className="my-6" />

        {/* Catatan/Komentar */}
        <div className="space-y-4">
          <CatatanList catatan={kegiatan.Catatan} />{" "}
          {/* Gunakan komponen CatatanList */}
          {/* Form untuk Menambah Catatan Baru (Hanya untuk Dosen/Admin) */}
          <AddCatatanForm
            kegiatanId={kegiatan.id}
            canAddNote={canTanggapiAtauCatat}
          />
        </div>
      </CardContent>

      {/* AlertDialog for Approve Confirmation */}
      <AlertDialog
        open={isConfirmingApprove}
        onOpenChange={setIsConfirmingApprove}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">
              Setujui Kegiatan Ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              Anda akan menyetujui kegiatan{" "}
              <span className="font-semibold">{judulKegiatan}</span> yang
              diajukan oleh{" "}
              <span className="font-semibold">
                {kegiatan.logbook.mahasiswa?.pengguna.nama || "-"}
              </span>
              . Tindakan ini akan mengubah status menjadi "DISETUJUI".
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
                onClick={handleConfirmApprove}
                disabled={loadingAction}
                className="px-5 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
              >
                {loadingAction ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Ya, Setujui
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog for Reject Confirmation with Reason Input */}
      <Dialog open={isConfirmingReject} onOpenChange={setIsConfirmingReject}>
        <DialogContent className="sm:max-w-[425px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Tolak Kegiatan Ini?
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              Anda akan menolak kegiatan{" "}
              <span className="font-semibold">{judulKegiatan}</span>. Mohon
              berikan alasan penolakan.
            </DialogDescription>
          </DialogHeader>
          <div className="pb-3 pt-1">
            <Label
              htmlFor="rejectionReason"
              className="text-right mb-2 text-gray-700"
            >
              Alasan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejectionReason"
              placeholder="Misal: Data tidak lengkap, format salah, dll."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="col-span-3 min-h-[80px]"
              disabled={loadingAction}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmingReject(false)}
              className="px-5 py-2 rounded-md"
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmReject}
              disabled={loadingAction || !rejectionReason.trim()}
              variant="destructive"
              className="px-5 py-2 rounded-md"
            >
              {loadingAction ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CircleX className="mr-2 h-4 w-4" />
              )}
              Ya, Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
