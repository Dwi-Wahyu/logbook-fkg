"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseAsString, useQueryState } from "nuqs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  buatPengajuanBimbingan, // Import the server action
} from "@/app/_lib/actions/bimbinganActions"; // Import schema and action
import {
  getDataPembimbing,
  getSejarahPengajuan,
} from "@/app/_lib/queries/bimbinganQueries"; // Import queries
import DataPembimbingAnda from "./DataPembimbingAnda"; // Assuming this is another client component
import { Fragment, useMemo, useState } from "react";
import { CircleAlert, Loader2 } from "lucide-react"; // Use Loader2 for spinning loader
import { useMediaQuery } from "@/hooks/use-media-query"; // Assuming you have this hook
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomToast } from "@/components/toast";
import {
  pengajuanBimbinganSchema,
  TPengajuanBimbinganForm,
} from "@/schema/BimbinganSchema";
import { useRouter } from "next/navigation";

export type TDataPembimbing = Awaited<ReturnType<typeof getDataPembimbing>>;
export type TSejarahPengajuan = Awaited<ReturnType<typeof getSejarahPengajuan>>;

export default function PengajuanBimbinganForm({
  penggunaId,
  namaPengaju,
  dosenId,
  dataPembimbing,
  sejarahPengajuan,
  daftarDosen,
}: {
  namaPengaju: string;
  penggunaId: string;
  dosenId: string | null;
  dataPembimbing: TDataPembimbing;
  sejarahPengajuan: TSejarahPengajuan;
  daftarDosen: { id: string; nama: string }[];
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // useQueryState is typically used for client-side URL state management.
  // Since we're fetching default values from server props, you might not strictly need
  // useQueryState here unless you want to sync this specific select with the URL on client-side changes.
  const [idPembimbing, setIdPembimbing] = useQueryState(
    "dosenId",
    parseAsString.withDefault(dosenId ?? "") // Use "" for default to match SelectItem value=""
  );

  // Memoize `canCreatePengajuan` to avoid recalculations if dependencies don't change
  const canCreatePengajuan = useMemo(() => {
    // If student already has a supervisor, they cannot create a new application
    if (dataPembimbing?.mahasiswa?.pembimbing) {
      // Changed from mahasiswa?.pembimbing
      return false;
    }

    // Check if there's any pending application (status "TERKIRIM")
    const hasPendingApplication = sejarahPengajuan.some(
      (entry) => entry.status === "TERKIRIM"
    );

    return !hasPendingApplication;
  }, [dataPembimbing, sejarahPengajuan]); // Dependencies for memoization

  const form = useForm<TPengajuanBimbinganForm>({
    resolver: zodResolver(pengajuanBimbinganSchema),
    defaultValues: {
      idPembimbing: idPembimbing === "" ? "" : idPembimbing, // Initialize with query state or default ""
      idPengaju: penggunaId,
      kalimatPermohonan: "",
    },
  });

  async function onSubmit(data: TPengajuanBimbinganForm) {
    try {
      setLoading(true);

      const query = await buatPengajuanBimbingan(data); // Call the server action

      if (query.success) {
        toast.custom(() => (
          <CustomToast
            title="Pengajuan Terkirim"
            description="Permohonan Anda telah berhasil dikirim dan sedang diproses."
            variant="success"
          />
        ));
        // Reset form after successful submission
        form.reset({
          idPembimbing: "", // Reset select to placeholder
          idPengaju: penggunaId,
          kalimatPermohonan: "",
        });
        // You might want to refresh the page or update the state that contains `sejarahPengajuan`
        // to reflect the new application immediately without a full page reload.
        // For simplicity, `router.refresh()` can force a server component re-fetch.
        router.refresh(); // Refresh the current page to re-fetch data (sejarahPengajuan, dataPembimbing)
      } else {
        toast.custom(() => (
          <CustomToast
            title="Pengajuan Gagal"
            description={"Terjadi kesalahan saat mengirim pengajuan."}
            variant="destructive"
          />
        ));
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.custom(() => (
        <CustomToast
          title="Terjadi Kesalahan Tak Terduga"
          description="Mohon coba lagi. Jika masalah berlanjut, hubungi admin."
          variant="destructive"
        />
      ));
    } finally {
      setLoading(false);
    }
  }

  function handleChangePembimbing(id: string) {
    setIdPembimbing(id);
    form.setValue("idPembimbing", id);
  }

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold">
            Form Pengajuan Bimbingan
          </CardTitle>
          <CardDescription className="text-gray-600">
            Ajukan permohonan bimbingan kepada dosen pilihan Anda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!canCreatePengajuan && (
            <Alert variant="destructive" className="mb-6 rounded-md">
              <CircleAlert className="h-5 w-5" />
              <AlertTitle className="font-bold text-lg">Perhatian!</AlertTitle>
              <AlertDescription className="text-base">
                Anda tidak dapat membuat pengajuan bimbingan baru saat ini. Ini
                mungkin karena Anda sudah memiliki pembimbing atau ada
                permohonan yang masih dalam status 'TERKIRIM'.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="idPembimbing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pilih DPJP
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      disabled={!canCreatePengajuan || loading} // Disable if cannot create or loading
                      onValueChange={(value) => handleChangePembimbing(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih DPJP" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Option for no selection (if needed, but usually not for required fields) */}
                        {/* <SelectItem value="">-- Pilih Dosen --</SelectItem> */}
                        {daftarDosen.map((dosen) => (
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

              <FormField
                control={form.control}
                name="kalimatPermohonan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kalimat Permohonan (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={!canCreatePengajuan || loading} // Disable if cannot create or loading
                        placeholder="Tuliskan permohonan bimbingan Anda, misalnya judul awal, atau tujuan bimbingan..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4 border-t -mx-6 px-6 pb-6">
                {sejarahPengajuan.length > 0 && (
                  <Fragment>
                    {isDesktop ? (
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="px-6 py-2">
                            Sejarah Pengajuan
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">
                              Sejarah Pengajuan Bimbingan
                            </DialogTitle>
                            <DialogDescription>
                              Riwayat permohonan bimbingan Anda.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col gap-4">
                            {sejarahPengajuan.map((sejarah) => (
                              <div
                                key={sejarah.id}
                                className="border p-4 rounded-md shadow-sm bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                              >
                                <div className="flex-1 mb-2 sm:mb-0">
                                  <h1 className="text-base font-semibold text-gray-800">
                                    Dosen:{" "}
                                    {sejarah.dosen?.pengguna.nama ||
                                      "Tidak Ditemukan"}
                                  </h1>
                                  {sejarah.pesan && (
                                    <p className="text-sm text-gray-700 mt-1">
                                      Pesan: &quot;{sejarah.pesan}&quot;
                                    </p>
                                  )}
                                  {sejarah.alasanDitolak &&
                                    sejarah.status === "DITOLAK" && (
                                      <p className="text-sm text-red-700 mt-1">
                                        Alasan Ditolak: &quot;
                                        {sejarah.alasanDitolak}&quot;
                                      </p>
                                    )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Diajukan:{" "}
                                    {format(
                                      new Date(sejarah.createdAt),
                                      "dd MMMM yyyy HH:mm"
                                    )}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {sejarah.status === "DITOLAK" && (
                                    <Badge
                                      variant="destructive"
                                      className="font-semibold text-sm px-3 py-1"
                                    >
                                      {sejarah.status}
                                    </Badge>
                                  )}
                                  {sejarah.status === "DISETUJUI" && (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-3 py-1">
                                      {sejarah.status}
                                    </Badge>
                                  )}
                                  {sejarah.status === "TERKIRIM" && (
                                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-sm px-3 py-1">
                                      {sejarah.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerTrigger asChild>
                          <Button variant="outline" className="px-6 py-2">
                            Sejarah Pengajuan
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent className="max-h-[80vh]">
                          <DrawerHeader className="text-left">
                            <DrawerTitle className="text-2xl font-bold">
                              Sejarah Pengajuan Bimbingan
                            </DrawerTitle>
                            <DrawerDescription>
                              Riwayat permohonan bimbingan Anda.
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="p-4 pt-0 flex flex-col gap-4 overflow-y-auto">
                            {sejarahPengajuan.map((sejarah) => (
                              <div
                                key={sejarah.id}
                                className="border p-4 rounded-md shadow-sm bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                              >
                                <div className="flex-1 mb-2 sm:mb-0">
                                  <h1 className="text-base font-semibold text-gray-800">
                                    Dosen:{" "}
                                    {sejarah.dosen?.pengguna.nama ||
                                      "Tidak Ditemukan"}
                                  </h1>
                                  {sejarah.pesan && (
                                    <p className="text-sm text-gray-700 mt-1">
                                      Pesan: &quot;{sejarah.pesan}&quot;
                                    </p>
                                  )}
                                  {sejarah.alasanDitolak &&
                                    sejarah.status === "DITOLAK" && (
                                      <p className="text-sm text-red-700 mt-1">
                                        Alasan Ditolak: &quot;
                                        {sejarah.alasanDitolak}&quot;
                                      </p>
                                    )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Diajukan:{" "}
                                    {format(
                                      new Date(sejarah.createdAt),
                                      "dd MMMM yyyy HH:mm"
                                    )}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {sejarah.status === "DITOLAK" && (
                                    <Badge
                                      variant="destructive"
                                      className="font-semibold text-sm px-3 py-1"
                                    >
                                      {sejarah.status}
                                    </Badge>
                                  )}
                                  {sejarah.status === "DISETUJUI" && (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-3 py-1">
                                      {sejarah.status}
                                    </Badge>
                                  )}
                                  {sejarah.status === "TERKIRIM" && (
                                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-sm px-3 py-1">
                                      {sejarah.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Tutup</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    )}
                  </Fragment>
                )}

                {canCreatePengajuan && (
                  <Button
                    disabled={loading}
                    type="submit"
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim Pengajuan
                      </>
                    ) : (
                      "Ajukan Bimbingan"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="flex md:flex-row flex-col">
        <DataPembimbingAnda dataPembimbing={dataPembimbing} />
      </div>
    </div>
  );
}
