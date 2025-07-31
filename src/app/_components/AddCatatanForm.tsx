// src/app/admin/kegiatan/detail/_components/AddCatatanForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // Import z

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";

import { addCatatanKegiatan } from "@/app/_lib/actions/kegiatanActions"; // Import server action
import { CustomToast } from "@/components/toast";
import { useSession } from "next-auth/react"; // Untuk mendapatkan ID pengguna yang sedang login

// Zod Schema untuk form catatan baru
const catatanSchema = z.object({
  konten: z.string().min(1, "Catatan tidak boleh kosong."),
});
type TCatatanForm = z.infer<typeof catatanSchema>;

interface AddCatatanFormProps {
  kegiatanId: string;
  canAddNote: boolean; // Flag apakah user boleh menambah catatan
}

export default function AddCatatanForm({
  kegiatanId,
  canAddNote,
}: AddCatatanFormProps) {
  const router = useRouter();
  const { data: session } = useSession(); // Dapatkan sesi pengguna
  const [isAddingNote, setIsAddingNote] = useState(false);

  const form = useForm<TCatatanForm>({
    resolver: zodResolver(catatanSchema),
    defaultValues: {
      konten: "",
    },
  });

  const handleAddCatatan = async (values: TCatatanForm) => {
    if (!session?.user?.id) {
      toast.custom(() => (
        <CustomToast
          title="Error"
          description="Anda harus login untuk menambah catatan."
          variant="destructive"
        />
      ));
      return;
    }
    setIsAddingNote(true);
    const result = await addCatatanKegiatan({
      kegiatanId: kegiatanId,
      penggunaId: session.user.id, // ID pengguna yang sedang login
      konten: values.konten,
    });

    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Catatan Ditambahkan"
          description={result.message || "Catatan berhasil ditambahkan."}
          variant="success"
        />
      ));
      form.reset(); // Reset form catatan
      router.refresh(); // Re-fetch data untuk menampilkan catatan baru
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Menambah Catatan"
          description={
            result.message || "Terjadi kesalahan saat menambah catatan."
          }
          variant="destructive"
        />
      ));
    }
    setIsAddingNote(false);
  };

  if (!canAddNote) {
    return null; // Jangan render form jika user tidak punya izin
  }

  return (
    <div className="mt-6 p-4 border rounded-md bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Tambah Catatan Baru
      </h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleAddCatatan)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="konten"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Tulis catatan atau komentar Anda di sini..."
                    className="min-h-[80px]"
                    disabled={isAddingNote}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isAddingNote} className="px-4 py-2">
              {isAddingNote ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" /> Tambah Catatan
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
