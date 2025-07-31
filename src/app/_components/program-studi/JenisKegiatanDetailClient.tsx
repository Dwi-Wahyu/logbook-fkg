// src/app/_components/program-studi/JenisKegiatanDetailClient.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Card is imported by parent, only need content/header/title
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  CheckCircle2, // For true/required
  XCircle, // For false/not required
  FileText, // For text field type
  Hash, // For number field type
  Calendar, // For date field type
  ToggleRight, // For boolean field type
  Key,
  ChevronsLeftRightEllipsis,
  LayoutGrid,
  Frown,
  FileType, // For template key
} from "lucide-react";

// Import JenisKegiatanWithFields untuk tipe data yang diterima
import { JenisKegiatanWithFields } from "@/app/_lib/queries/programStudiQueries";

// Infer type for a single field in fields array
type JenisKegiatanFieldType = JenisKegiatanWithFields["fields"][number];

interface JenisKegiatanDetailClientProps {
  jenisKegiatan: JenisKegiatanWithFields;
}

export default function JenisKegiatanDetailClient({
  jenisKegiatan,
}: JenisKegiatanDetailClientProps) {
  const router = useRouter();

  // Helper untuk mendapatkan ikon berdasarkan fieldType
  const getFieldTypeIcon = (fieldType: string) => {
    switch (fieldType) {
      case "TEXT":
        return <FileText className="h-4 w-4 mr-2 text-blue-500" />;
      case "NUMBER":
        return <Hash className="h-4 w-4 mr-2 text-green-500" />;
      case "DATE":
        return <Calendar className="h-4 w-4 mr-2 text-purple-500" />;
      case "BOOLEAN":
        return <ToggleRight className="h-4 w-4 mr-2 text-orange-500" />;
      case "TEXTAREA":
        return <FileType className="h-4 w-4 mr-2 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="px-4 py-2 flex items-center"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detail Utama Jenis Kegiatan */}
        <div className="space-y-2 p-4 border rounded-md shadow-sm bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">
            Informasi Umum
          </h3>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Nama Jenis Kegiatan
            </p>
            <p className="text-gray-900 font-bold text-lg">
              {jenisKegiatan.nama}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Program Studi</p>
            <p className="text-gray-900 text-base">
              {jenisKegiatan.programStudi?.displayName || "Tidak Diketahui"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Mata Kuliah Wajib
            </p>
            <Badge
              className={`px-3 py-1 rounded-full font-semibold text-sm inline-flex items-center space-x-1 ${
                jenisKegiatan.isMataKuliahRequired
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {jenisKegiatan.isMataKuliahRequired ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>{jenisKegiatan.isMataKuliahRequired ? "Ya" : "Tidak"}</span>
            </Badge>
          </div>
        </div>

        {/* Statistik Field Kustom */}
        <div className="space-y-2 p-4 border rounded-md shadow-sm bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">
            Statistik Field
          </h3>
          <div>
            <p className="text-sm font-medium text-gray-700">Total Field</p>
            <p className="text-gray-900 font-bold text-lg">
              {jenisKegiatan.fields.length}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Field Wajib</p>
            <p className="text-gray-900 text-base">
              {jenisKegiatan.fields.filter((f) => f.isRequired).length}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Field Opsional</p>
            <p className="text-gray-900 text-base">
              {jenisKegiatan.fields.filter((f) => !f.isRequired).length}
            </p>
          </div>
          {/* Tambahkan statistik lain jika perlu, misal jumlah per fieldType */}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Daftar Field Kustom */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <span>Daftar Field ({jenisKegiatan.fields.length})</span>
        </h2>
        {jenisKegiatan.fields.length === 0 ? (
          <div className="text-center p-6 text-gray-500 rounded-md bg-gray-50 border border-gray-200">
            <Frown className="h-8 w-8 mx-auto mb-3 text-gray-400" />
            <p>Tidak ada field yang ditentukan untuk jenis kegiatan ini.</p>
            <p className="text-sm">
              Silakan tambahkan field melalui halaman edit jenis kegiatan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jenisKegiatan.fields.map((field) => (
              <div
                key={field.id}
                className="border p-4 rounded-md shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center">
                    {getFieldTypeIcon(field.fieldType)} {field.fieldName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Tipe:{" "}
                    <Badge
                      variant="secondary"
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {field.fieldType}
                    </Badge>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Urutan: <span className="font-medium">{field.order}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    Wajib Diisi:
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        field.isRequired
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {field.isRequired ? "Ya" : "Tidak"}
                    </span>
                  </p>
                </div>
                {/* Anda bisa menambahkan tombol edit/hapus field individual di sini jika perlu */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
