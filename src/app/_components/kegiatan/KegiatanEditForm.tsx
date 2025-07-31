// src/app/admin/kegiatan/edit/_components/KegiatanEditForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { CloudUpload, Loader2, X, Trash2, FileText } from "lucide-react";

import {
  editKegiatan,
  deleteLampiran,
} from "@/app/_lib/actions/kegiatanActions";
import { validLampiranExtensions } from "@/schema/kegiatan/TambahKegiatanSchema"; // Digunakan untuk validasi lampiran
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import {
  editKegiatanSchema,
  TEditKegiatan,
} from "@/schema/kegiatan/UpdateKegiatanSchema"; // Schema untuk edit kegiatan

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
  KegiatanWithRelations, // Tipe kegiatan lengkap dari queries
  getAllMataKuliah, // Untuk tipe allMataKuliah
} from "@/app/_lib/queries/kegiatanQueries";

// Inferensi tipe untuk MataKuliahOption
type MataKuliahOption = Awaited<ReturnType<typeof getAllMataKuliah>>[number];

// Tipe untuk fieldValues yang akan dikirim/dikelola
type FieldValuePayload = {
  jenisKegiatanFieldId: string;
  value: any; // Akan divalidasi dan diubah tipenya di backend
};

interface KegiatanEditFormProps {
  kegiatan: KegiatanWithRelations; // Terima kegiatan lengkap
  allMataKuliah: MataKuliahOption[];
}

export default function KegiatanEditForm({
  kegiatan,
  allMataKuliah,
}: KegiatanEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState(
    kegiatan.lampiran
  );

  const [isDeleteAttachmentDialogOpen, setIsDeleteAttachmentDialogOpen] =
    useState(false);
  const [attachmentToDeleteId, setAttachmentToDeleteId] = useState<
    string | null
  >(null);
  const [attachmentToDeleteName, setAttachmentToDeleteName] = useState<
    string | null
  >(null);

  // Inisialisasi defaultValues untuk form
  const form = useForm<TEditKegiatan>({
    resolver: zodResolver(editKegiatanSchema),
    defaultValues: {
      id: kegiatan.id,
      // mata_kuliahId akan null jika tidak ada, atau string ID
      mata_kuliahId: kegiatan.MataKuliah?.id?.toString() || null,
      status: kegiatan.status as
        | "DIAJUKAN"
        | "DISETUJUI"
        | "DITOLAK"
        | undefined,
      lampiran: [], // Untuk file baru
      // fieldValues akan diinisialisasi di useEffect, sehingga tidak perlu di sini
      fieldValues: [], // Default kosong, akan diisi di useEffect
    },
  });

  // Helper untuk menginisialisasi nilai field berdasarkan tipe
  function initializeFieldValue(value: any, fieldType: string): any {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    ) {
      // Jika nilai kosong, berikan default berdasarkan tipe
      switch (fieldType) {
        case "TEXT":
        case "TEXTAREA":
          return "";
        case "NUMBER":
          return null; // null untuk NUMBER kosong
        case "DATE":
          return undefined; // undefined untuk DATE kosong
        case "BOOLEAN":
          return false;
        default:
          return null;
      }
    }
    // Konversi ISO string Date kembali ke Date object jika diperlukan oleh input date,
    // tapi untuk input type="date" kita akan memformatnya ke "YYYY-MM-DD"
    if (fieldType === "DATE") {
      try {
        const dateObj = new Date(value);
        return isNaN(dateObj.getTime()) ? undefined : dateObj;
      } catch {
        return undefined;
      }
    }
    if (fieldType === "NUMBER") {
      const numValue = parseFloat(value);
      return isNaN(numValue) ? null : numValue;
    }
    if (fieldType === "BOOLEAN") {
      // Handle boolean value stored as "true"/"false" string or actual boolean
      return value === "true" || value === true;
    }
    return value; // Untuk TEXT, TEXTAREA, dan lainnya
  }

  // --- PERBAIKAN UTAMA DI SINI ---
  useEffect(() => {
    // Pastikan `kegiatan` dan `kegiatan.jenisKegiatan.fields` tersedia
    if (kegiatan && kegiatan.jenisKegiatan && kegiatan.jenisKegiatan.fields) {
      const initialFieldValuesForForm = kegiatan.jenisKegiatan.fields
        .map((fieldDef) => {
          // Cari nilai yang sudah ada untuk fieldDef ini di kegiatan.fieldValues
          const existingValueEntry = kegiatan.fieldValues.find(
            (fv) => fv.jenisKegiatanField.id === fieldDef.id
          );

          return {
            jenisKegiatanFieldId: fieldDef.id,
            // Inisialisasi nilai dengan yang sudah ada atau default, sesuai tipe
            value: initializeFieldValue(
              existingValueEntry?.value,
              fieldDef.fieldType
            ),
          };
        })
        .sort((a, b) => {
          // Urutkan fieldValues agar sesuai dengan order fieldDef
          const fieldDefA = kegiatan.jenisKegiatan.fields.find(
            (f) => f.id === a.jenisKegiatanFieldId
          );
          const fieldDefB = kegiatan.jenisKegiatan.fields.find(
            (f) => f.id === b.jenisKegiatanFieldId
          );
          return (fieldDefA?.order ?? 0) - (fieldDefB?.order ?? 0);
        });

      // Reset form dengan semua nilai yang diperbarui
      form.reset({
        id: kegiatan.id,
        mata_kuliahId: kegiatan.MataKuliah?.id?.toString() || null,
        status: kegiatan.status as
          | "DIAJUKAN"
          | "DISETUJUI"
          | "DITOLAK"
          | undefined,
        lampiran: [], // Lampiran baru selalu kosong saat reset
        fieldValues: initialFieldValuesForForm,
      });
    }
  }, [kegiatan, form]); // Efek akan berjalan ketika objek 'kegiatan' berubah atau form instance berubah

  const onSubmit = async (values: TEditKegiatan) => {
    setLoading(true);

    const actionResult = await editKegiatan(values);

    if (actionResult.success) {
      toast.custom(() => (
        <CustomToast
          title="Kegiatan Berhasil Diperbarui"
          description={
            actionResult.message || "Rincian kegiatan telah berhasil disimpan."
          }
          variant="success"
        />
      ));
      form.setValue("lampiran", []); // Clear new files from form state
      window.location.reload(); // Paksa hard reload
    } else {
      console.error(
        "Failed to update activity:",
        actionResult.message,
        actionResult.error
      );
      toast.custom(() => (
        <CustomToast
          title="Gagal Memperbarui Kegiatan"
          description={
            actionResult.message ||
            "Terjadi kesalahan yang tidak diketahui. Mohon coba lagi."
          }
          variant="destructive"
        />
      ));
      if (
        actionResult.validationErrors &&
        actionResult.validationErrors.length > 0
      ) {
        actionResult.validationErrors.forEach((err) => {
          // Set error pada field spesifik jika diinginkan
          // Pastikan path Zod cocok dengan name di formField. Contoh: 'fieldValues.0.value'
          form.setError(err.path as any, { message: err.message });
          console.warn(`Validation Error for ${err.path}: ${err.message}`);
        });
      }
    }
    setLoading(false);
  };

  const handleDeleteAttachmentClick = (
    lampiranId: string,
    lampiranName: string
  ) => {
    setAttachmentToDeleteId(lampiranId);
    setAttachmentToDeleteName(lampiranName);
    setIsDeleteAttachmentDialogOpen(true);
  };

  const handleConfirmDeleteAttachment = async () => {
    if (!attachmentToDeleteId) return;

    setLoading(true);
    const result = await deleteLampiran(attachmentToDeleteId);
    setLoading(false);

    if (result.success) {
      setExistingAttachments((prev) =>
        prev.filter((att) => att.id !== attachmentToDeleteId)
      );
      toast.custom(() => (
        <CustomToast
          title="Lampiran Dihapus"
          description={result.message || "Lampiran berhasil dihapus."}
          variant="success"
        />
      ));
      router.refresh();
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Menghapus Lampiran"
          description={
            result.message || "Terjadi kesalahan saat menghapus lampiran."
          }
          variant="destructive"
        />
      ));
    }
    setIsDeleteAttachmentDialogOpen(false);
    setAttachmentToDeleteId(null);
    setAttachmentToDeleteName(null);
  };

  function handleKembali() {
    router.back();
  }

  // Tipe untuk field definitions (dari jenisKegiatan.fields)
  type JenisKegiatanFieldDef = (typeof kegiatan.jenisKegiatan.fields)[number];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="w-full shadow-lg max-w-4xl mx-auto rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Edit Data Kegiatan
            </CardTitle>
            <CardDescription className="text-md text-gray-600">
              Perbarui informasi kegiatan ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {form.formState.errors.root && (
              <p className="text-red-600 text-sm font-medium p-3 bg-red-50 border border-red-200 rounded-md">
                {form.formState.errors.root.message}
              </p>
            )}

            {/* Display Jenis Kegiatan (Read-only) */}
            <FormItem>
              <FormLabel>Jenis Kegiatan</FormLabel>
              <FormControl>
                <Input
                  value={kegiatan.jenisKegiatan.nama}
                  disabled
                  className="bg-gray-100 border-gray-200"
                />
              </FormControl>
              <FormDescription>
                Jenis kegiatan ini tidak dapat diubah setelah dibuat.
              </FormDescription>
            </FormItem>

            {/* Field untuk Mata Kuliah (Kondisional) */}
            {kegiatan.jenisKegiatan.isMataKuliahRequired && (
              <FormField
                control={form.control}
                name="mata_kuliahId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mata Kuliah Terkait{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value === "0" ? null : value);
                        }}
                        value={field.value || "0"}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Mata Kuliah yang relevan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Pilih Mata Kuliah</SelectItem>
                          {allMataKuliah.length > 0 ? (
                            allMataKuliah.map((value) => (
                              <SelectItem
                                key={value.id}
                                value={value.id.toString()}
                              >
                                {value.judul} (Semester {value.semester})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-mata-kuliah" disabled>
                              Tidak ada mata kuliah tersedia
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Bagian Form Dinamis untuk fieldValues */}
            {kegiatan.jenisKegiatan.fields.length > 0 && (
              <div className="space-y-6 p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-700">
                  Detail Kegiatan
                </h3>
                {kegiatan.jenisKegiatan.fields.map(
                  (fieldDef: JenisKegiatanFieldDef, index) => (
                    <FormField
                      key={fieldDef.id} // Stable key
                      control={form.control}
                      // Menggunakan index dari map untuk path ke fieldValues
                      // Ini mengasumsikan initialFormFieldsValues (dari useEffect)
                      // sudah diurutkan dan memiliki indeks yang sama dengan fieldDef.
                      name={`fieldValues.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {fieldDef.fieldName}{" "}
                            {fieldDef.isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            {fieldDef.fieldType === "TEXT" ? (
                              <Input
                                placeholder={`Masukkan ${fieldDef.fieldName.toLowerCase()}`}
                                {...field}
                                value={field.value ?? ""}
                                disabled={loading}
                              />
                            ) : fieldDef.fieldType === "TEXTAREA" ? (
                              <Textarea
                                placeholder={`Masukkan ${fieldDef.fieldName.toLowerCase()}`}
                                {...field}
                                value={field.value ?? ""}
                                disabled={loading}
                              />
                            ) : fieldDef.fieldType === "NUMBER" ? (
                              <Input
                                type="number"
                                placeholder={`Masukkan ${fieldDef.fieldName.toLowerCase()}`}
                                {...field}
                                value={field.value === null ? "" : field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : parseFloat(e.target.value)
                                  )
                                }
                                disabled={loading}
                              />
                            ) : fieldDef.fieldType === "DATE" ? (
                              <Input
                                type="date"
                                placeholder={`Pilih tanggal ${fieldDef.fieldName.toLowerCase()}`}
                                {...field}
                                value={
                                  field.value
                                    ? new Date(field.value)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? new Date(e.target.value)
                                      : undefined
                                  )
                                }
                                disabled={loading}
                              />
                            ) : fieldDef.fieldType === "BOOLEAN" ? (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value === true}
                                  onCheckedChange={(checked) =>
                                    field.onChange(checked)
                                  }
                                  disabled={loading}
                                />
                                <Label>{fieldDef.fieldName}</Label>
                              </div>
                            ) : (
                              <Input
                                placeholder={`Tipe input '${fieldDef.fieldType}' tidak didukung`}
                                disabled
                                value={field.value ?? ""}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                )}
              </div>
            )}
            {kegiatan.jenisKegiatan.fields.length === 0 && (
              <p className="text-gray-500 text-sm p-4 border rounded-md bg-gray-50">
                Tidak ada field kustom yang ditentukan untuk Jenis Kegiatan ini.
              </p>
            )}

            {/* Lampiran yang Sudah Ada */}
            {existingAttachments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Lampiran Terunggah
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {existingAttachments.map((lampiran) => (
                    <div
                      key={lampiran.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
                    >
                      <a
                        href={lampiran.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 flex-1 text-sm font-medium text-blue-600 hover:underline truncate"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span>{lampiran.namaFile}</span>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 hover:bg-red-100 ml-2"
                        onClick={() =>
                          handleDeleteAttachmentClick(
                            lampiran.id,
                            lampiran.namaFile
                          )
                        }
                        type="button"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unggah Lampiran Baru */}
            <FormField
              control={form.control}
              name="lampiran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unggah Lampiran Baru</FormLabel>
                  <FormControl>
                    <FileUpload
                      onValueChange={(files) => {
                        field.onChange(files);
                      }}
                      accept={validLampiranExtensions
                        .map((ext) => {
                          switch (ext) {
                            case "png":
                              return "image/png";
                            case "jpeg":
                            case "jpg":
                              return "image/jpeg";
                            case "pdf":
                              return "application/pdf";
                            case "doc":
                              return "application/msword";
                            case "docx":
                              return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                            default:
                              return "";
                          }
                        })
                        .join(",")}
                      maxFiles={3}
                      maxSize={50 * 1024 * 1024}
                      multiple
                      disabled={loading}
                    >
                      <FileUploadDropzone className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-600 hover:border-primary transition-colors">
                        <CloudUpload className="size-8 text-primary mb-2" />
                        <p className="font-semibold mb-1">
                          Seret & Lepas file di sini atau
                        </p>
                        <FileUploadTrigger asChild>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-primary hover:text-primary"
                          >
                            Pilih File dari Komputer Anda
                          </Button>
                        </FileUploadTrigger>
                        <p className="text-xs mt-2">
                          Ukuran maksimal: 50MB per file. Jenis file yang
                          didukung: PNG, JPEG, JPG, PDF, DOC, DOCX. (Maks. 3
                          file)
                        </p>
                      </FileUploadDropzone>
                      <FileUploadList className="mt-4 space-y-2">
                        {field.value?.map((file, index) => (
                          <FileUploadItem
                            key={index}
                            value={file}
                            className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
                          >
                            <FileUploadItemPreview className="size-8 rounded-full" />
                            <FileUploadItemMetadata className="flex-1 ml-3 text-sm" />
                            <FileUploadItemDelete asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-red-500 hover:bg-red-100"
                              >
                                <X className="size-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </FileUploadItemDelete>
                          </FileUploadItem>
                        ))}
                      </FileUploadList>
                    </FileUpload>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t pt-4">
            <Button
              onClick={handleKembali}
              type="button"
              variant="outline"
              className="px-6 py-2"
              disabled={loading}
            >
              Kembali
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
      {/* AlertDialog for delete attachment confirmation */}
      <AlertDialog
        open={isDeleteAttachmentDialogOpen}
        onOpenChange={setIsDeleteAttachmentDialogOpen}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Lampiran Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus lampiran "
              <span className="font-semibold">{attachmentToDeleteName}</span>"
              ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteAttachment}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
