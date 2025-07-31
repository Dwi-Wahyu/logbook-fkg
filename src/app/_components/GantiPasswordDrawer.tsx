"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Key, ShieldCheckIcon } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  updatePasswordSchema,
  TUpdatePasswordSchema,
} from "@/schema/pengguna/UpdatePasswordSchema";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  cekPasswordBenar,
  updatePassword,
} from "../_lib/actions/penggunaActions";
import { CustomToast } from "@/components/toast";

export default function GantiPasswordDrawer({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<TUpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      id,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: TUpdatePasswordSchema) {
    setLoading(true);
    try {
      // TODO: Implementasi logic update password
      // Contoh: await updatePassword(values);
      const passwordBenar = await cekPasswordBenar(
        values.id,
        values.oldPassword
      );

      console.log(passwordBenar);

      if (!passwordBenar) {
        form.setError("oldPassword", {
          message: "Password tidak valid.",
        });
        return;
      }

      const actions = await updatePassword(values);

      if (actions.success) {
        toast.custom(() => (
          <CustomToast
            title="Autentikasi Diperbarui"
            description="Verifikasi password baru Anda telah berhasil dilakukan. Keamanan akun terjaga."
            variant="success"
            icon={<ShieldCheckIcon width={50} height={50} />}
          />
        ));
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      toast.error("Gagal mengubah password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="oldPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password Lama</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Masukkan password lama"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password Baru</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Masukkan password baru"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konfirmasi Password Baru</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Konfirmasi password baru"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </Button>
      </form>
    </Form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size={"sm"}>
            <Key />
            Ubah Password
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
            <DialogDescription>
              Untuk keamanan akun Anda, pastikan password baru kuat dan berbeda
              dari password sebelumnya
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size={"sm"}>
          <Key />
          Ubah Password
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Ganti Password</DrawerTitle>
          <DrawerDescription>
            Untuk keamanan akun Anda, pastikan password baru kuat dan berbeda
            dari password sebelumnya
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{formContent}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Batal</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
