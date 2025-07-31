"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  editPenggunaSchema,
  TEditPenggunaSchema,
} from "@/schema/pengguna/EditPenggunaSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, KeySquare, Loader2 } from "lucide-react";
import { useState } from "react";
import { editPengguna } from "@/app/_lib/actions/penggunaActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type TEditPenggunaFormProps = {
  id: string;
  username: string;
  nama: string;
};

type FormFields = keyof TEditPenggunaSchema;

export function EditPenggunaForm({
  id,
  nama,
  username,
}: TEditPenggunaFormProps) {
  const form = useForm<TEditPenggunaSchema>({
    resolver: zodResolver(editPenggunaSchema),
    defaultValues: {
      nama: nama,
      username: username,
    },
  });

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // TODO: handle error ketika unique constraint failed
  async function onSubmit(payload: TEditPenggunaSchema) {
    setLoading(true);

    try {
      const { success, errorCode, field, error, validationErrors } =
        await editPengguna(id, payload);

      if (success) {
        toast.success("Pengguna Diperbarui", {
          description: "Perubahan data pengguna telah berhasil disimpan.",
          action: {
            label: "Pratinjau",
            onClick: () => router.push("/admin/pengguna/detail/" + id),
          },
        });
      } else if (errorCode === "P2002") {
        form.setError(field as FormFields, {
          message: `${field} tidak tersedia`,
        });
      } else {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Form Edit Pengguna</CardTitle>
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
          </CardContent>
          <CardFooter className="flex mt-5 justify-between">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => router.back()}
            >
              <ChevronLeft /> Kembali
            </Button>

            {/* TODO: Buat fungsi ganti password */}
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button">
                    <KeySquare />
                    Ganti Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Tolong Masukkan Password Baru
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Label htmlFor="password">Password Baru</Label>
                    <Input id="password" />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Edit />}
                Submit
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
