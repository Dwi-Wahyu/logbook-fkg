// app/admin/mata-kuliah/tambah/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tambahMataKuliahSchema,
  TTambahMataKuliahSchema,
} from "@/schema/MataKuliahSchema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; // Assuming you use sonner for toasts
import { CustomToast } from "@/components/toast"; // Your custom toast component

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllProgramStudi } from "@/app/_lib/queries/programStudiQueries";
import { tambahMataKuliah } from "@/app/_lib/actions/mataKuliahActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";

type ProgramStudi = Awaited<ReturnType<typeof getAllProgramStudi>>;

export default function TambahMataKuliahForm({
  allProgramStudi,
}: {
  allProgramStudi: ProgramStudi;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const session = useSession();

  let programStudiId = session.data?.user.programStudiId ?? "";

  const form = useForm<TTambahMataKuliahSchema>({
    resolver: zodResolver(tambahMataKuliahSchema),
    defaultValues: {
      judul: "",
      semester: 1,
      programStudiId,
    },
  });

  const onSubmit = async (values: TTambahMataKuliahSchema) => {
    setIsSubmitting(true);
    const result = await tambahMataKuliah(values);
    setIsSubmitting(false);

    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Mata Kuliah Terdaftar"
          description="Data mata kuliah baru telah berhasil dimasukkan ke dalam sistem kurikulum."
          variant="success"
        />
      ));
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Menambahkan Mata Kuliah"
          description={
            "Terdapat judul mata kuliah yang sama pada semester tersebut."
          }
          variant="destructive"
        />
      ));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Mata Kuliah Baru</CardTitle>
        <CardDescription>
          Formulir ini memungkinkan Anda untuk menginput data mata kuliah baru
          ke dalam sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
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
                    defaultValue={field.value}
                    disabled={session.data?.user.programStudiId !== ""}
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
                <Button variant="outline">Batal</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading .
                    . .
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
