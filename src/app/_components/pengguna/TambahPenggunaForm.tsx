"use client";

import { tambahPengguna } from "@/app/_lib/actions/penggunaActions";
import {
  tambahPenggunaSchema,
  TTambahPenggunaSchema,
} from "@/schema/pengguna/TambahPenggunaSchema";
import { ResponseType } from "@/types/respon-type";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, Loader2, Plus, UserPlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { getAllProgramStudi } from "@/app/_lib/queries/programStudiQueries";
import UnauthorizedPage from "../UnauthorizedPage";

type AllProgramStudiReturnType = Awaited<ReturnType<typeof getAllProgramStudi>>;

type Props = {
  allProgramStudi: AllProgramStudiReturnType;
};

export default function TambahPenggunaForm({ allProgramStudi }: Props) {
  const [loading, setLoading] = useState(false);

  const session = useSession();

  let programStudiId = session.data?.user.programStudiId ?? "";

  if (session.data?.user.peran === "SUPERADMIN") {
    programStudiId = "";
  }

  if (session.data?.user.peran === "MAHASISWA") {
    return <UnauthorizedPage />;
  }

  const form = useForm<TTambahPenggunaSchema>({
    resolver: zodResolver(tambahPenggunaSchema),
    defaultValues: {
      nama: "",
      username: "",
      password: "",
      peran: undefined,
      programStudiId,
    },
  });

  async function onSubmit(values: TTambahPenggunaSchema) {
    setLoading(true);

    const { success, error } = await tambahPengguna(values);

    if (success) {
      toast.custom(() =>
        CustomToast({
          title: "Akun Baru Terdaftar",
          description:
            "Pengguna baru telah berhasil ditambahkan ke dalam sistem.",
          variant: "success",
        })
      );

      form.reset();
    } else {
      console.log(error);
    }

    setLoading(false);
  }

  const isSuperAdmin = session.data?.user.peran === "SUPERADMIN";

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Form Input Pengguna</CardTitle>
            <CardDescription>Tolong Masukkan Data Pengguna.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 mt-5">
            {form.formState.errors.root && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.root.message}
              </p>
            )}

            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Tolong Ketik Nama Lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Tolong Ketik Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tolong Ketik Password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="peran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peran</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOSEN">Dosen</SelectItem>
                        <SelectItem value="MAHASISWA">Mahasiswa</SelectItem>
                        {isSuperAdmin && (
                          <SelectItem value="ADMIN">Admin Prodi</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
                    disabled={session.data?.user.peran == "ADMIN"}
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
          </CardContent>
          <CardFooter className="flex mt-5 justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus />}
              Submit
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
