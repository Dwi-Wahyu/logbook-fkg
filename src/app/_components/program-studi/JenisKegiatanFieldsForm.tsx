// src/app/_components/program-studi/JenisKegiatanFieldsForm.tsx
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  PlusCircle,
  Trash2,
  Edit2,
  Save,
  X,
  Info,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  addJenisKegiatanField,
  updateJenisKegiatanField,
  deleteJenisKegiatanField,
} from "@/app/_lib/actions/programStudiActions";
import { CustomToast } from "@/components/toast";
// Import JenisKegiatanWithFields untuk tipe initialFields
import { JenisKegiatanWithFields } from "@/app/_lib/queries/programStudiQueries";
import {
  TAddJenisKegiatanField,
  TUpdateJenisKegiatanField,
  addJenisKegiatanFieldSchema, // Impor skema jika Anda ingin menggunakannya untuk tipe payload
  updateJenisKegiatanFieldSchema, // Impor skema jika Anda ingin menggunakannya untuk tipe payload
} from "@/schema/ProgramStudiSchema"; // Import schema for Zod validation and types
import { getJenisKegiatanById } from "@/app/_lib/queries/programStudiQueries";
import { z } from "zod";

const fieldTypes = ["TEXT", "NUMBER", "DATE", "BOOLEAN", "TEXTAREA"];

// Mendapatkan tipe dari SATU ELEMEN dalam array 'fields' dari JenisKegiatanWithFields
type JenisKegiatanFieldType = JenisKegiatanWithFields["fields"][number];

const formSchema = z.object({
  fields: z.array(
    z.object({
      id: z.string().optional(),
      fieldName: z.string().min(1, "Nama Field is required."),
      fieldType: z.enum(["TEXT", "NUMBER", "DATE", "BOOLEAN", "TEXTAREA"]),
      isRequired: z.boolean(),
      order: z.number().int().min(0, "Order must be non-negative."),
      // templateKey tidak perlu di sini, akan digenerasi/dipertahankan di action
      isNew: z.boolean().optional(),
      isEdited: z.boolean().optional(),
    })
  ),
});

type TJenisKegiatanFieldsForm = z.infer<typeof formSchema>;

interface JenisKegiatanFieldsFormProps {
  jenisKegiatanId: string; // ID Jenis Kegiatan
  initialFields: JenisKegiatanFieldType[];
  jenisKegiatanNama: string; // Nama Jenis Kegiatan untuk display
}

export default function JenisKegiatanFieldsForm({
  jenisKegiatanId,
  initialFields,
  jenisKegiatanNama,
}: JenisKegiatanFieldsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);

  const form = useForm<TJenisKegiatanFieldsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fields: initialFields.map((field) => ({
        ...field,
        isRequired: field.isRequired ?? false,
        fieldType: field.fieldType as
          | "TEXT"
          | "NUMBER"
          | "DATE"
          | "BOOLEAN"
          | "TEXTAREA"
          | undefined,
        isNew: false,
        isEdited: false,
      })),
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "fields",
    keyName: "uniqueId", // Gunakan uniqueId agar React mengenali setiap item
  });

  const hasChanges = form.formState.isDirty;

  const handleAddField = () => {
    append({
      fieldName: "",
      fieldType: "TEXT",
      isRequired: false,
      order:
        fields.length > 0
          ? Math.max(...fields.map((f) => f.order ?? 0)) + 1
          : 0,
      isNew: true,
      isEdited: true,
    });
  };

  const handleRemoveField = (index: number) => {
    const field = form.getValues(`fields.${index}`);
    if (field.id) {
      setFieldToDelete({ id: field.id, name: field.fieldName });
      setDeleteConfirmOpen(true);
    } else {
      remove(index);
    }
  };

  const confirmDeleteField = async () => {
    if (!fieldToDelete) return;
    setLoading(true);
    const result = await deleteJenisKegiatanField({
      // Panggil deleteJenisKegiatanField
      id: fieldToDelete.id,
      jenisKegiatanId: jenisKegiatanId, // Gunakan jenisKegiatanId
    });

    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Field Dihapus"
          description={`Field "${fieldToDelete.name}" berhasil dihapus.`}
          variant="success"
        />
      ));

      window.location.reload();
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Menghapus Field"
          description={
            result.message || "Terjadi kesalahan saat menghapus field."
          }
          variant="destructive"
        />
      ));
    }
    setLoading(false);
    setDeleteConfirmOpen(false);
    setFieldToDelete(null);
  };

  const onSubmit = async (values: TJenisKegiatanFieldsForm) => {
    setLoading(true);
    let successCount = 0;
    let errorMessages: string[] = [];

    const fieldsToProcess = values.fields.filter((f) => f.isNew || f.isEdited);

    for (const field of fieldsToProcess) {
      if (!field.fieldName.trim()) {
        errorMessages.push(
          `Nama Field tidak boleh kosong untuk field baru atau yang diubah.`
        );
        continue;
      }
      if (field.isNew) {
        const payload: TAddJenisKegiatanField = {
          // Tipe payload add
          jenisKegiatanId: jenisKegiatanId,
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
          order: field.order,
        };
        const result = await addJenisKegiatanField(payload); // Panggil addJenisKegiatanField
        if (result.success) {
          successCount++;
        } else {
          errorMessages.push(
            `Gagal menambah field '${field.fieldName}': ${result.message}`
          );
        }
      } else if (field.isEdited && field.id) {
        const payload: TUpdateJenisKegiatanField = {
          // Tipe payload update
          id: field.id,
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
          order: field.order,
        };
        const result = await updateJenisKegiatanField(payload); // Panggil updateJenisKegiatanField
        if (result.success) {
          successCount++;
        } else {
          errorMessages.push(
            `Gagal memperbarui field '${field.fieldName}': ${result.message}`
          );
        }
      }
    }

    if (successCount > 0) {
      toast.custom(() => (
        <CustomToast
          title="Field Disimpan"
          description={`${successCount} field berhasil disimpan/diperbarui.`}
          variant="success"
        />
      ));
      router.refresh();
    }

    if (errorMessages.length > 0) {
      toast.custom(() => (
        <CustomToast
          title="Ada Kesalahan Saat Menyimpan Field"
          description={errorMessages.join("\n")}
          variant="destructive"
        />
      ));
    }

    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 rounded-lg shadow-sm mb-6">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="font-semibold">
            Informasi Penting: Memahami Istilah "Field"
          </AlertTitle>
          <AlertDescription className="text-sm">
            Dalam konteks sistem ini, istilah "Field" merujuk pada setiap kolom
            data atau isian spesifik yang perlu mahasiswa lengkapi ketika
            mengajukan kegiatan. Setiap field memiliki nama, tipe data, dan
            aturan pengisiannya sendiri.
          </AlertDescription>
        </Alert>

        {/* ALERT untuk Ketentuan Mengisi Field */}
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 rounded-lg shadow-sm mb-6">
          {" "}
          {/* Added mb-6 */}
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="font-semibold">
            Ketentuan Pengisian Field
          </AlertTitle>
          <AlertDescription className="text-sm">
            Pastikan Anda memahami aturan penulisan Nama Field agar data logbook
            dapat tergenerasi dengan benar.
            <Dialog open={rulesDialogOpen} onOpenChange={setRulesDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="link"
                  className="p-0 text-blue-700 hover:text-blue-900 h-auto text-sm"
                >
                  Baca Selengkapnya
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Aturan Pengisian Field
                  </DialogTitle>
                  <DialogDescription className="text-gray-700">
                    Penting untuk mengikuti ketentuan ini agar data dapat
                    diproses dan ditampilkan dengan benar pada dokumen logbook.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 text-gray-800">
                  <p>
                    1. <span className="font-semibold">Nama Field</span>: Ini
                    adalah label yang akan dilihat pada form input mahasiswa.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li>
                      Gunakan nama yang jelas dan deskriptif (contoh: "Nama
                      Pasien", "Hari/Tanggal Kunjungan").
                    </li>
                    <li>
                      Boleh mengandung spasi tapi jangan gunakan karakter khusus
                      seperti (. , * \ dan yang lainnya).
                    </li>
                    <li>
                      Contoh yang <span className="font-semibold">baik</span>:
                      "Nama Pasien", "No. Rekam Medis", "Diagnosa Utama".
                    </li>
                  </ul>
                  <Separator />
                  <p>
                    2. <span className="font-semibold">Urutan </span>:
                    Menentukan urutan field pada form input.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>
                      Isi dengan angka, semakin kecil angkanya, semakin atas
                      posisinya.
                    </li>
                  </ul>
                  <Separator />
                  <p>
                    3. <span className="font-semibold">Wajib Diisi</span>:
                    Menentukan apakah field ini harus diisi oleh mahasiswa.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Centang jika field ini mutlak diperlukan.</li>
                  </ul>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRulesDialogOpen(false)}
                  >
                    Tutup
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.uniqueId}
              className="border p-4 rounded-md shadow-sm bg-gray-50 relative"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:bg-red-100 rounded-full"
                onClick={() => handleRemoveField(index)}
                disabled={loading}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Hapus Field</span>
              </Button>

              <FormField
                control={form.control}
                name={`fields.${index}.fieldName`}
                render={({ field: nameField }) => (
                  <FormItem className="mb-3">
                    <FormLabel>Nama Field</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Judul Kegiatan"
                        {...nameField}
                        disabled={loading}
                        onBlur={() => {
                          update(index, {
                            ...field,
                            fieldName: form.getValues(
                              `fields.${index}.fieldName`
                            ),
                            isEdited: true,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`fields.${index}.fieldType`}
                  render={({ field: typeField }) => (
                    <FormItem>
                      <FormLabel>Tipe Field</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          typeField.onChange(val);
                          update(index, {
                            ...field,
                            fieldType: val as any,
                            isEdited: true,
                          });
                        }}
                        value={typeField.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Tipe Field" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`fields.${index}.order`}
                  render={({ field: orderField }) => (
                    <FormItem>
                      <FormLabel>Urutan</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...orderField}
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            orderField.onChange(val);
                            update(index, {
                              ...field,
                              order: val,
                              isEdited: true,
                            });
                          }}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`fields.${index}.isRequired`}
                render={({ field: requiredField }) => (
                  <FormItem className="flex flex-row items-start space-x-1 space-y-0 p-4 bg-white rounded-md border mt-4">
                    <FormControl>
                      <Checkbox
                        checked={requiredField.value}
                        onCheckedChange={(checked) => {
                          requiredField.onChange(checked);
                          update(index, {
                            ...field,
                            isRequired: !!checked,
                            isEdited: true,
                          });
                        }}
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Wajib Diisi</FormLabel>
                      <FormDescription>
                        Jika dicentang, field ini wajib diisi oleh mahasiswa.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={handleAddField}
          variant="outline"
          className="mt-4 flex items-center px-4 py-2"
          disabled={loading}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Field Baru
        </Button>

        <Separator className="my-6" />

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={loading || !hasChanges}
            className="px-6 py-2"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan
                Semua Perubahan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Simpan Semua Perubahan
              </>
            )}
          </Button>
        </div>
      </form>

      {/* AlertDialog for Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Field Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus field "
              <span className="font-semibold">{fieldToDelete?.name}</span>" ini?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteField}
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
