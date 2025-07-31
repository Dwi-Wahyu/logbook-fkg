// src/app/_components/pengguna/PembimbingCard.tsx
"use client"; // Make this a Client Component

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, // Import CardDescription for dialog
} from "@/components/ui/card";
import {
  getAllDosen,
  getDetailPengguna,
} from "@/app/_lib/queries/penggunaQueries"; // For initial data type, but not called directly here
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus, Edit, UserCheck, UserX } from "lucide-react"; // Icons
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";

// Import actions and queries
import { updatePembimbing } from "@/app/_lib/actions/bimbinganActions";
import {
  TUpdatePembimbingSchema,
  updatePembimbingSchema,
} from "@/schema/BimbinganSchema";
import PembimbingHero from "../PembimbingHero";
import { useSession } from "next-auth/react";

// Define props type more explicitly to avoid direct Awaited<ReturnType> here for clarity
// The `page.tsx` will pass the resolved data.
type PenggunaDetailType = Awaited<ReturnType<typeof getDetailPengguna>>;
type DosenListType = Awaited<ReturnType<typeof getAllDosen>>;

type Props = {
  dataPengguna: PenggunaDetailType;
  allDosen: DosenListType; // Pass allDosen as a prop from the parent Server Component
};

export default function PembimbingCard({ dataPengguna, allDosen }: Props) {
  const session = useSession();

  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Determine if the student already has a supervisor
  const hasPembimbing = !!dataPengguna?.mahasiswa?.pembimbing;

  const isViewerAdmin =
    session?.data?.user.peran === "ADMIN" ||
    session?.data?.user.peran === "SUPERADMIN";

  // Initialize form with existing data
  const form = useForm<TUpdatePembimbingSchema>({
    resolver: zodResolver(updatePembimbingSchema),
    defaultValues: {
      mahasiswaId: dataPengguna?.id || "",
      pembimbingId: dataPengguna?.mahasiswa?.pembimbingId || null, // null for empty selection
      alasan: "", // Alasan kosong di awal
    },
  });

  const onSubmit = async (values: TUpdatePembimbingSchema) => {
    setLoading(true);
    const result = await updatePembimbing(values); // Call the server action

    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Pembimbing Diperbarui"
          description={"Data DPJP telah berhasil disimpan."}
          variant="success"
          icon={<UserCheck width={50} height={50} />} // Custom success icon
        />
      ));
      setOpenDialog(false); // Close dialog on success
      router.refresh(); // Re-fetch data on the detail page to reflect changes
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Memperbarui Pembimbing"
          description={"Terjadi kesalahan saat memperbarui pembimbing."}
          variant="destructive"
          icon={<UserX width={50} height={50} />} // Custom error icon
        />
      ));
    }
    setLoading(false);
  };

  if (!dataPengguna || dataPengguna.peran !== "MAHASISWA") {
    return null; // Only render for Mahasiswa users
  }

  return (
    <Card className="shadow-lg mb-5 rounded-xl">
      <CardHeader className="">
        <CardTitle className="font-bold text-gray-900">
          DPJP Mahasiswa
        </CardTitle>
      </CardHeader>

      <CardContent>
        <PembimbingHero
          avatar={dataPengguna?.mahasiswa?.pembimbing?.pengguna.avatar ?? ""}
          nama={
            dataPengguna?.mahasiswa?.pembimbing?.pengguna.nama ??
            "Belum Ditentukan"
          }
          username={
            dataPengguna?.mahasiswa?.pembimbing?.pengguna.username ?? "-"
          }
          programStudi={
            dataPengguna?.mahasiswa?.pembimbing?.pengguna.programStudi
              ?.displayName ?? "-"
          }
        />
        <div className="flex justify-end pt-5">
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              {isViewerAdmin && (
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md rounded-lg flex items-center px-6 py-3">
                  {hasPembimbing ? (
                    <>
                      <Edit className="h-5 w-5" /> Ubah DPJP
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" /> Pilih Pembimbing
                      Mahasiswa
                    </>
                  )}
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-xl p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-bold">
                  {hasPembimbing ? "Ubah DPJP" : "Pilih DPJP"}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Untuk mahasiswa:{" "}
                  <span className="font-semibold text-primary">
                    {dataPengguna.nama}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="alasan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Alasan {hasPembimbing ? "Mengubah" : "Memilih"}{" "}
                          Pembimbing <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tulis alasan perubahan/pemilihan pembimbing"
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
                    name="pembimbingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          DPJP <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === "" ? null : value)
                          } // Convert "" to null
                          value={field.value ?? ""} // Convert null to "" for select display
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pilih DPJP" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Option for clearing */}
                            {allDosen.map((dosen) => (
                              <SelectItem key={dosen.id} value={dosen.id}>
                                {dosen.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                      disabled={loading}
                      className="px-6 py-2"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
