// src/app/admin/pengaturan/mata-kuliah/edit/[id]/_components/EditMataKuliahForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CustomToast } from "@/components/toast";

import { editMataKuliah } from "@/app/_lib/actions/mataKuliahActions";
import { getMataKuliahById } from "@/app/_lib/queries/mataKuliahQueries"; // For initial data type
import { getAllProgramStudi } from "@/app/_lib/queries/programStudiQueries"; // For allProgramStudi type
import { useSession } from "next-auth/react";
import {
  editMataKuliahSchema,
  TEditMataKuliahSchema,
} from "@/schema/MataKuliahSchema";

// Infer types for initial data and program studi list
type InitialMataKuliahData = Awaited<ReturnType<typeof getMataKuliahById>>;
type AllProgramStudiData = Awaited<ReturnType<typeof getAllProgramStudi>>;

interface EditMataKuliahFormProps {
  initialData: InitialMataKuliahData;
  allProgramStudi: AllProgramStudiData;
}

export default function EditMataKuliahForm({
  initialData,
  allProgramStudi,
}: EditMataKuliahFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const session = useSession();

  // Handle case where initialData might be null (though server component handles notFound)
  if (!initialData) {
    console.error("No initial data provided for EditMataKuliahForm.");
    return null; // Or render an error state
  }

  const form = useForm<TEditMataKuliahSchema>({
    resolver: zodResolver(editMataKuliahSchema),
    defaultValues: {
      id: initialData.id,
      judul: initialData.judul,
      semester: initialData.semester,
      programStudiId: initialData.ProgramStudi?.id || "", // Default to empty string if no ProgramStudi
    },
  });

  const onSubmit = async (values: TEditMataKuliahSchema) => {
    setIsSubmitting(true);
    const result = await editMataKuliah(values); // Call server action
    setIsSubmitting(false);

    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Mata Kuliah Diperbarui"
          description="Data mata kuliah telah berhasil diperbarui."
          variant="success"
        />
      ));
      router.push("/admin/pengaturan/mata-kuliah"); // Redirect to list page
      router.refresh(); // Refresh list page data
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Memperbarui Mata Kuliah"
          description={"Terjadi kesalahan saat memperbarui mata kuliah."}
          variant="destructive"
        />
      ));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="judul"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Mata Kuliah</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tolong Ketik Judul Mata Kuliah"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semester</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ketik Semester"
                  {...field}
                  // Ensure value is always a string for input, convert number to string
                  value={field.value.toString()}
                  onChange={(e) => {
                    // Convert input string to number. Handle empty string as 0 or undefined for Zod.
                    field.onChange(parseInt(e.target.value) || 0);
                  }}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="programStudiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Studi</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value} // Use 'value' prop for controlled component
                disabled={
                  isSubmitting || session.data?.user.peran !== "SUPERADMIN"
                } // Only Superadmin can change PS
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Program Studi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allProgramStudi.map((ps) => (
                    <SelectItem key={ps.id} value={ps.id}>
                      {ps.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Link href="/admin/pengaturan/mata-kuliah">
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
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
