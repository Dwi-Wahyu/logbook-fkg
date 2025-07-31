"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  FileText,
  Hash,
  ToggleRight,
  CheckCircle2,
  XCircle,
  Clock,
  ListOrdered,
  BookOpen,
  Frown, // Import Frown for no data state
} from "lucide-react";
import { format } from "date-fns";

// Import tipe KegiatanWithRelations dari kegiatanQueries.ts
import { KegiatanWithRelations } from "@/app/_lib/queries/kegiatanQueries";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Tipe untuk data progres kegiatan yang dikelompokkan
type GroupedKegiatanProgress = {
  jenisKegiatanId: string;
  jenisKegiatanNama: string;
  kegiatan: KegiatanWithRelations[]; // Array of full Kegiatan objects
}[];

interface MahasiswaKegiatanProgressProps {
  kegiatanProgress: GroupedKegiatanProgress;
  mahasiswaNama: string;
}

export default function MahasiswaKegiatanProgress({
  kegiatanProgress,
  mahasiswaNama,
}: MahasiswaKegiatanProgressProps) {
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
          return format(date, "dd MMMM"); // Contoh: "12 Juni 2025"
        } catch {
          return String(value);
        }
      case "NUMBER":
        return Number(value).toLocaleString("id-ID");
      case "BOOLEAN":
        return value === "true" || value === true ? "Ya" : "Tidak";
      default: // TEXT, TEXTAREA
        return String(value);
    }
  };

  // Helper untuk mendapatkan nilai field kustom berdasarkan templateKey atau fieldName
  const getFormattedFieldValue = (
    kegiatan: KegiatanWithRelations,
    key: string
  ): string => {
    // Cari field definition yang cocok dengan templateKey di jenisKegiatan.fields
    let fieldValueEntry = kegiatan.fieldValues.find(
      (fv) => fv.jenisKegiatanField.templateKey === key
    );

    // Jika tidak ditemukan berdasarkan templateKey, coba cari berdasarkan fieldName
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
    <Card className="mt-5 shadow-lg rounded-xl">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Progress Kegiatan Mahasiswa
        </CardTitle>
        <CardDescription className="text-gray-600">
          Melihat seluruh kegiatan yang diajukan oleh {mahasiswaNama}, terurut
          dari terbaru.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {kegiatanProgress.length === 0 ? (
          <div className="text-center p-8 text-gray-500 rounded-lg bg-gray-50 border border-gray-200">
            <Frown className="h-10 w-10 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">
              Belum ada kegiatan yang diajukan oleh mahasiswa ini.
            </p>
          </div>
        ) : (
          kegiatanProgress.map((group) => (
            <div key={group.jenisKegiatanId} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <ListOrdered className="h-5 w-5 text-primary" />
                {group.jenisKegiatanNama} ({group.kegiatan.length} Kegiatan)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.kegiatan.map((kegiatanItem) => (
                  <Card
                    key={kegiatanItem.id}
                    className="shadow-sm rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="">
                      <CardDescription className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Diajukan:{" "}
                        {format(new Date(kegiatanItem.createdAt), "dd MMM")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div className="flex items-center justify-between text-gray-700">
                        <span>Status:</span>
                        <Badge
                          className={`${getStatusBadgeColorClass(
                            kegiatanItem.status
                          )} px-2 py-0.5 text-xs font-semibold`}
                        >
                          {kegiatanItem.status}
                        </Badge>
                      </div>
                      {kegiatanItem.MataKuliah && (
                        <div className="flex items-center justify-between text-gray-700">
                          <span>Mata Kuliah:</span>
                          <span className="font-medium">
                            {kegiatanItem.MataKuliah.judul} (Sm.{" "}
                            {kegiatanItem.MataKuliah.semester})
                          </span>
                        </div>
                      )}
                      {/* Tampilkan beberapa field kustom penting, atau link ke detail */}
                      {kegiatanItem.fieldValues.length > 0 && (
                        <div className="pt-2 border-t mt-2">
                          <p className="text-xs text-gray-600 font-semibold mb-1">
                            Detail Singkat:
                          </p>
                          {/* Contoh: Tampilkan 2-3 field pertama atau field tertentu */}
                          {kegiatanItem.fieldValues.slice(0, 3).map((fv) => (
                            <p
                              key={fv.id} // <-- PERBAIKAN DI SINI: Gunakan fv.id sebagai key
                              className="text-xs text-gray-700 truncate"
                            >
                              <span className="font-medium">
                                {fv.jenisKegiatanField.fieldName}:
                              </span>{" "}
                              {formatValueBasedOnType(
                                fv.value,
                                fv.jenisKegiatanField.fieldType
                              )}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="mt-3">
                        <Link
                          href={`/admin/kegiatan/detail/${kegiatanItem.id}`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-primary border-primary hover:bg-primary/10"
                          >
                            Lihat Detail
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Separator />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
