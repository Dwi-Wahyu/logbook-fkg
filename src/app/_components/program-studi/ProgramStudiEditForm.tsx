// src/app/_components/program-studi/ProgramStudiEditForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { updateProgramStudi } from "@/app/_lib/actions/programStudiActions";
import { CustomToast } from "@/components/toast";
// Import ProgramStudiWithJenisKegiatan untuk tipe penuh hasil query
import { ProgramStudiWithJenisKegiatan } from "@/app/_lib/queries/programStudiQueries";
import {
  TUpdateProgramStudi,
  updateProgramStudiSchema,
} from "@/schema/ProgramStudiSchema";

// Tipe data awal untuk form ini, Omit properti 'jenisKegiatan'
type InitialProgramStudiData = Omit<
  ProgramStudiWithJenisKegiatan,
  "jenisKegiatan"
>;

interface ProgramStudiEditFormProps {
  initialData: InitialProgramStudiData;
}

export default function ProgramStudiEditForm({
  initialData,
}: ProgramStudiEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Safety check, although parent Server Component should handle notFound()
  if (!initialData) {
    console.error("Initial data for ProgramStudiEditForm is null.");
    return null;
  }

  const form = useForm<TUpdateProgramStudi>({
    resolver: zodResolver(updateProgramStudiSchema),
    defaultValues: {
      id: initialData.id,
      nama: initialData.nama,
      displayName: initialData.displayName,
      templateSingleFieldForDate:
        initialData.templateSingleFieldForDate ?? true,
    },
  });

  const onSubmit = async (values: TUpdateProgramStudi) => {
    setLoading(true);
    const result = await updateProgramStudi(values);

    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Program Studi Diperbarui"
          description={
            result.message || "Data Program Studi berhasil disimpan."
          }
          variant="success"
        />
      ));
      router.refresh();
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Memperbarui Program Studi"
          description={
            result.message || "Terjadi kesalahan saat menyimpan data."
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
              <FormLabel>Nama Program Studi (Internal)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nama singkat atau kode Program Studi"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormDescription>
                Nama ini biasanya digunakan untuk identifikasi internal (misal:
                "PPDGS Ilmu Penyakit Mulut").
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Tampilan (Public)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nama lengkap Program Studi"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormDescription>
                Nama ini akan ditampilkan kepada pengguna (misal: "PROGRAM
                PENDIDIKAN DOKTER GIGI SPESIALIS ILMU PENYAKIT MULUT").
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="templateSingleFieldForDate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Template Tanggal Tunggal</FormLabel>
                <FormDescription>
                  Gunakan satu field tanggal saja untuk semua kegiatan program
                  studi ini.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                  aria-label="Toggle single date field template"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
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
