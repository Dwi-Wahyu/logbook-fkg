// src/app/_components/program-studi/EditJenisKegiatanForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react"; // Import ArrowLeft for "Kembali" button
import Link from "next/link"; // Import Link

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
import { CustomToast } from "@/components/toast";
import { Switch } from "@/components/ui/switch"; // Assuming you might use Switch for boolean toggles

import { updateJenisKegiatan } from "@/app/_lib/actions/programStudiActions";
import {
  TUpdateJenisKegiatan,
  updateJenisKegiatanSchema,
} from "@/schema/ProgramStudiSchema";
import { getJenisKegiatanById } from "@/app/_lib/queries/programStudiQueries"; // For initial data type

// Infer the initial data type from the query
type InitialJenisKegiatanData = Awaited<
  ReturnType<typeof getJenisKegiatanById>
>;

interface EditJenisKegiatanFormProps {
  initialData: InitialJenisKegiatanData;
}

export default function EditJenisKegiatanForm({
  initialData,
}: EditJenisKegiatanFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Safety check, although parent Server Component handles notFound()
  if (!initialData) {
    console.error("Initial data for EditJenisKegiatanForm is null.");
    return null;
  }

  const form = useForm<TUpdateJenisKegiatan>({
    resolver: zodResolver(updateJenisKegiatanSchema),
    defaultValues: {
      id: initialData.id,
      nama: initialData.nama,
      templateIdentifier: initialData.templateIdentifier || null,
      isMataKuliahRequired: initialData.isMataKuliahRequired,
    },
  });

  const onSubmit = async (values: TUpdateJenisKegiatan) => {
    setLoading(true);
    const result = await updateJenisKegiatan(values);

    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Jenis Kegiatan Diperbarui"
          description={
            result.message || "Data Jenis Kegiatan berhasil disimpan."
          }
          variant="success"
        />
      ));
      // Redirect back to the Program Studi edit page after successful update
      router.push(
        `/admin/pengaturan/program-studi/edit/${initialData.programStudiId}`
      );
      router.refresh(); // Refresh the parent page data
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Memperbarui Jenis Kegiatan"
          description={
            result.message ||
            "Terjadi kesalahan saat menyimpan data Jenis Kegiatan."
          }
          variant="destructive"
        />
      ));
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Jenis Kegiatan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: KASUS COASS"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="templateIdentifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kunci Template (Opsional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Akan digenerasi otomatis jika kosong"
                  {...field}
                  value={field.value ?? ""} // Ensure value is string or empty for input
                  onChange={(e) => field.onChange(e.target.value || null)} // Convert empty string to null
                  disabled={loading}
                />
              </FormControl>
              <FormDescription>
                Kunci unik untuk pemetaan ke bagian dokumen Word (e.g.,
                `kasusCoass`). Jika dikosongkan, akan digenerasi otomatis dari
                Nama Jenis Kegiatan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isMataKuliahRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Wajib Memilih Mata Kuliah</FormLabel>
                <FormDescription>
                  Centang jika jenis kegiatan ini harus terkait dengan Mata
                  Kuliah.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                  aria-label="Toggle Mata Kuliah Required"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()} // Go back to the previous page (Program Studi edit page)
            disabled={loading}
            className="px-6 py-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <Button type="submit" disabled={loading} className="px-6 py-2">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
