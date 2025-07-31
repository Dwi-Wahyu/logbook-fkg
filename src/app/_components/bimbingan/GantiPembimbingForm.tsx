// src/app/admin/mahasiswa/[id]/edit-pembimbing/_components/GantiPembimbingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription, // Added for descriptive text
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomToast } from "@/components/toast";
import { updatePembimbing } from "@/app/_lib/actions/bimbinganActions"; // Import server action and schema
import Link from "next/link"; // For the "Kembali" button
import {
  TUpdatePembimbingSchema,
  updatePembimbingSchema,
} from "@/schema/BimbinganSchema";
import { getAllDosen } from "@/app/_lib/queries/penggunaQueries";

type MahasiswaData = {
  id: string;
  namaMahasiswa: string;
  usernameMahasiswa: string;
  pembimbingId: string | null;
  pembimbingNama: string;
};

interface GantiPembimbingFormProps {
  mahasiswa: MahasiswaData;
  allDosen: Awaited<ReturnType<typeof getAllDosen>>;
}

export default function GantiPembimbingForm({
  mahasiswa,
  allDosen,
}: GantiPembimbingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<TUpdatePembimbingSchema>({
    resolver: zodResolver(updatePembimbingSchema),
    defaultValues: {
      mahasiswaId: mahasiswa.id,
      pembimbingId: mahasiswa.pembimbingId || "", // Default to empty string for "Tidak Ditentukan"
      alasan: "",
    },
  });

  console.log(allDosen);

  async function onSubmit(values: TUpdatePembimbingSchema) {
    setLoading(true);

    const result = await updatePembimbing(values);

    if (result?.success) {
      toast.custom(() => (
        <CustomToast
          title="Pembaruan Bimbingan Berhasil"
          description="Data pembimbing mahasiswa telah berhasil diperbarui."
          variant="success"
        />
      ));
      router.push(`/admin/mahasiswa/detail/${mahasiswa.id}`); // Redirect to student detail page
      router.refresh(); // Refresh data on the detail page
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Memperbarui Pembimbing"
          description={"Terjadi kesalahan yang tidak diketahui."}
          variant="destructive"
        />
      ));
    }

    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="alasan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Alasan Mengubah Pembimbing{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Misal: Perubahan topik penelitian, Dosen pensiun, dll."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pembimbingId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pembimbing</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Pembimbing" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allDosen.map((dosen) => (
                    <SelectItem key={dosen.id} value={dosen.id}>
                      {dosen.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-sm text-gray-500">
                Pilih DPJP utama untuk mahasiswa ini.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 border-t mt-6 -mx-6 px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="px-6 py-2"
          >
            Kembali
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
