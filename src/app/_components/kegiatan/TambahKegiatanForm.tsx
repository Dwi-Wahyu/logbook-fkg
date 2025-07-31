// src/app/_components/kegiatan/TambahKegiatanForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  tambahKegiatanSchema,
  TTambahKegiatan,
  validLampiranExtensions,
} from "@/schema/kegiatan/TambahKegiatanSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  tambahKegiatan,
  // fetchJenisKegiatanFieldsAction, // TIDAK LAGI DIPERLUKAN
} from "@/app/_lib/actions/kegiatanActions";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { CustomToast } from "@/components/toast";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  getAllJenisKegiatan,
  getAllMataKuliah,
} from "@/app/_lib/queries/kegiatanQueries";

type MataKuliahOption = Awaited<ReturnType<typeof getAllMataKuliah>>[number];
type JenisKegiatanOption = Awaited<
  ReturnType<typeof getAllJenisKegiatan>
>[number];
type JenisKegiatanField = JenisKegiatanOption["fields"][number];

export default function TambahKegiatanForm({
  allMataKuliah,
  allJenisKegiatan,
  pengajuId,
}: {
  allMataKuliah: MataKuliahOption[];
  allJenisKegiatan: JenisKegiatanOption[];
  pengajuId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedJenisKegiatanId, setSelectedJenisKegiatanId] = useState<
    string | null
  >(null);
  const [selectedJenisKegiatanData, setSelectedJenisKegiatanData] =
    useState<JenisKegiatanOption | null>(null);
  const [loadingFields, setLoadingFields] = useState(false); // Tetap gunakan loadingFields untuk indikator
  const router = useRouter();

  const form = useForm<TTambahKegiatan>({
    resolver: zodResolver(tambahKegiatanSchema),
    defaultValues: {
      mata_kuliahId: null,
      pengajuId,
      jenisKegiatanId: "",
      lampiran: [],
      status: "DIAJUKAN",
      fieldValues: [],
    },
  });

  // Effect untuk mengelola field kustom dan mata kuliah berdasarkan Jenis Kegiatan yang dipilih
  useEffect(() => {
    async function updateFormFieldsAndMataKuliah() {
      if (selectedJenisKegiatanId && selectedJenisKegiatanId !== "") {
        setLoadingFields(true); // Mulai loading

        const jenisKegiatan = allJenisKegiatan.find(
          (jk) => jk.id === selectedJenisKegiatanId
        );

        setSelectedJenisKegiatanData(jenisKegiatan || null);

        if (jenisKegiatan) {
          const fields = jenisKegiatan.fields; // Ambil fields langsung dari objek jenisKegiatan

          const newFieldValues: { jenisKegiatanFieldId: string; value: any }[] =
            [];
          fields.forEach((fieldDef) => {
            newFieldValues.push({
              jenisKegiatanFieldId: fieldDef.id,
              value:
                fieldDef.fieldType === "TEXT" ||
                fieldDef.fieldType === "TEXTAREA"
                  ? ""
                  : fieldDef.fieldType === "NUMBER"
                  ? null
                  : fieldDef.fieldType === "DATE"
                  ? undefined
                  : fieldDef.fieldType === "BOOLEAN"
                  ? false
                  : null,
            });
          });
          form.setValue("fieldValues", newFieldValues);

          // Kelola Mata Kuliah field
          if (!jenisKegiatan.isMataKuliahRequired) {
            form.setValue("mata_kuliahId", null); // Set ke null jika tidak wajib
          } else {
            // Jika wajib dan belum ada nilai terpilih, atur default ke "0" (placeholder)
            if (form.getValues("mata_kuliahId") === null) {
              form.setValue("mata_kuliahId", "0");
            }
          }
        } else {
          // Reset jika jenis kegiatan tidak ditemukan
          setSelectedJenisKegiatanData(null);
          form.setValue("fieldValues", []);
          form.setValue("mata_kuliahId", null);
        }
        setLoadingFields(false); // Selesai loading
      } else {
        // Reset jika tidak ada jenis kegiatan yang dipilih
        setSelectedJenisKegiatanData(null);
        form.setValue("fieldValues", []);
        form.setValue("mata_kuliahId", null);
        setLoadingFields(false); // Pastikan loading state direset
      }
    }
    updateFormFieldsAndMataKuliah();
  }, [selectedJenisKegiatanId, allJenisKegiatan, form]);

  async function onSubmit(values: TTambahKegiatan) {
    setLoading(true);

    const actionResult = await tambahKegiatan(values);

    if (actionResult.success) {
      toast.custom(() => (
        <CustomToast
          title="Kegiatan Berhasil Ditambahkan"
          description={
            actionResult.message ||
            "Rincian kegiatan Anda telah berhasil dicatat dalam sistem."
          }
          variant="success"
        />
      ));
      form.reset({
        mata_kuliahId: null,
        pengajuId: pengajuId,
        jenisKegiatanId: "",
        lampiran: [],
        status: "DIAJUKAN",
        fieldValues: [],
      });
      setSelectedJenisKegiatanId(null);
      setSelectedJenisKegiatanData(null);
      router.push("/admin/kegiatan");
      router.refresh();
    } else {
      console.error(
        "Failed to add activity:",
        actionResult.message,
        actionResult.error
      );
      toast.custom(() => (
        <CustomToast
          title="Gagal Menambahkan Kegiatan"
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
          console.warn(`Validation Error for ${err.path}: ${err.message}`);
        });
      }
    }
    setLoading(false);
  }

  function handleKembali() {
    router.back();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="w-full shadow-lg rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-800">
              Formulir Pengajuan Kegiatan
            </CardTitle>
            <CardDescription className="text-md text-gray-600">
              Isi detail kegiatan yang akan Anda ajukan. Pastikan semua
              informasi terisi dengan benar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {form.formState.errors.root && (
              <p className="text-red-600 text-sm font-medium p-3 bg-red-50 border border-red-200 rounded-md">
                {form.formState.errors.root.message}
              </p>
            )}

            {/* Field untuk memilih Jenis Kegiatan */}
            <FormField
              control={form.control}
              name="jenisKegiatanId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Jenis Kegiatan <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedJenisKegiatanId(value); // Pemicu useEffect
                      }}
                      value={field.value || ""} // Gunakan value prop dan pastikan string kosong untuk default
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Jenis Kegiatan" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Opsi placeholder */}
                        {allJenisKegiatan.length > 0 ? (
                          allJenisKegiatan.map((jk) => (
                            <SelectItem key={jk.id} value={jk.id}>
                              {jk.nama}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-jenis-kegiatan" disabled>
                            Tidak ada jenis kegiatan tersedia
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field untuk Mata Kuliah (Kondisional berdasarkan Jenis Kegiatan) */}
            {selectedJenisKegiatanData?.isMataKuliahRequired && (
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
                          field.onChange(value === "0" ? null : value); // Convert "0" to null
                        }}
                        value={field.value || "0"} // Display "0" if value is null
                        disabled={loading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Mata Kuliah yang relevan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Pilih Mata Kuliah</SelectItem>{" "}
                          {/* Opsi placeholder */}
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
            {selectedJenisKegiatanData &&
              selectedJenisKegiatanData.fields.length > 0 && (
                <div className="space-y-6 p-4 border rounded-md bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Detail Kegiatan
                  </h3>
                  {loadingFields ? (
                    <div className="flex justify-center items-center h-20">
                      <Loader2 className="animate-spin mr-2" /> Memuat detail
                      form...
                    </div>
                  ) : (
                    selectedJenisKegiatanData.fields.map(
                      (
                        fieldDef,
                        index // Use index for formField name if fieldValues is array
                      ) => (
                        <FormField
                          key={fieldDef.id} // Gunakan ID fieldDef sebagai key
                          control={form.control}
                          // Akses value di dalam fieldValues array
                          name={`fieldValues.${index}.value`} // Gunakan index, bukan fieldDef.fieldName
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
                                    value={
                                      field.value === null ? "" : field.value
                                    }
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
                    )
                  )}
                </div>
              )}

            <FormField
              control={form.control}
              name="lampiran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lampiran Pendukung</FormLabel>
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
                                <span className="sr-only">Hapus Lampiran</span>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
                </>
              ) : (
                "Ajukan Kegiatan"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
