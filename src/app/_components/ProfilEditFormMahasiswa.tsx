// src/app/(dashboard)/profil/edit-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, FilePenLine, Loader2, Save } from "lucide-react"; // Use Loader2
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import {
  editProfilPenggunaSchema,
  TEditProfilPengguna,
} from "@/schema/EditProfilSchema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNameInitials } from "@/service/getNameInitials";
import { editProfilPengguna } from "../_lib/actions/penggunaActions";
import { getProfilPengguna } from "../_lib/queries/penggunaQueries";
import { CustomToast } from "@/components/toast";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type ProfilPengguna = Awaited<ReturnType<typeof getProfilPengguna>>;

export default function ProfilEditFormMahasiswa({
  id,
  initialData,
}: {
  id: string;
  initialData: ProfilPengguna;
}) {
  const [editForm, setEditForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const session = useSession();

  const form = useForm<TEditProfilPengguna>({
    resolver: zodResolver(editProfilPenggunaSchema),
    defaultValues: {
      semester: initialData?.mahasiswa?.semester ?? undefined,
      judulDisertasi: initialData?.mahasiswa?.judulDisertasi || "",
      email: initialData?.mahasiswa?.email || "",
      nomorTelpon: initialData?.mahasiswa?.nomorTelpon || "",
      angkatan: initialData?.mahasiswa?.angkatan || "",
      tahunLulus: initialData?.mahasiswa?.tahunLulus || "",
      mulaiMasukPendidikan:
        initialData?.mahasiswa?.mulaiMasukPendidikan ?? undefined,
      tempatTanggalLahir: initialData?.mahasiswa?.tempatTanggalLahir || "",
      alamat: initialData?.mahasiswa?.alamat || "",
      alamatKeluarga: initialData?.mahasiswa?.alamatKeluarga || "",
      pekerjaan: initialData?.mahasiswa?.pekerjaan || "",
    },
  });

  const showAlert = useMemo(() => {
    const dataLengkap =
      initialData?.mahasiswa?.semester !== null &&
      initialData?.mahasiswa?.semester !== undefined &&
      initialData?.mahasiswa?.judulDisertasi !== null &&
      initialData?.mahasiswa?.judulDisertasi !== undefined &&
      initialData?.mahasiswa?.email !== null &&
      initialData?.mahasiswa?.email !== undefined &&
      initialData?.mahasiswa?.nomorTelpon !== null &&
      initialData?.mahasiswa?.nomorTelpon !== undefined &&
      initialData?.mahasiswa?.alamat !== null &&
      initialData?.mahasiswa?.alamat !== undefined &&
      initialData?.mahasiswa?.alamatKeluarga !== null &&
      initialData?.mahasiswa?.alamatKeluarga !== undefined &&
      initialData?.mahasiswa?.tahunLulus !== null &&
      initialData?.mahasiswa?.tahunLulus !== undefined &&
      initialData?.mahasiswa?.pekerjaan !== null &&
      initialData?.mahasiswa?.pekerjaan !== undefined &&
      initialData?.mahasiswa?.mulaiMasukPendidikan !== null &&
      initialData?.mahasiswa?.mulaiMasukPendidikan !== undefined;

    return !dataLengkap;
  }, [initialData]);

  const onSubmit = async (payload: TEditProfilPengguna) => {
    try {
      setLoading(true);

      const promise = await editProfilPengguna(id, payload);

      if (promise.success) {
        toast.custom(() => (
          <CustomToast
            title="Profil Terupdate"
            description="Silahkan login ulang agar perubahan bisa diterapkan dengan baik oleh sistem"
            variant="success"
          />
        ));
        setEditForm(false);

        await fetch("/api/auth/refresh", { method: "POST" });
      } else {
        toast.custom(() => (
          <CustomToast
            title="Gagal Memperbarui Profil"
            description={"Terjadi kesalahan yang tidak diketahui."}
            variant="destructive"
          />
        ));
      }
    } catch (error) {
      console.error("Error submitting profile edit:", error);
      toast.custom(() => (
        <CustomToast
          title="Gagal memperbarui profil"
          description="Terjadi kesalahan tak terduga. Mohon coba lagi."
          variant="destructive"
        />
      ));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAlert) {
      setEditForm(true);
    }
  }, [showAlert]);

  return (
    <Form {...form}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border items-center p-4 flex gap-4 bg-white shadow-sm">
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarImage
              src={`/image/profile-picture/${initialData?.mahasiswa?.pembimbing?.pengguna.avatar}`}
              alt="foto-profil"
            />
            <AvatarFallback className="rounded-lg">
              {getNameInitials(
                initialData?.mahasiswa?.pembimbing?.pengguna.nama ?? "? ?"
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-gray-800">Pembimbing</h1>
            <h1 className="text-sm text-gray-600">
              {initialData?.mahasiswa?.pembimbing?.pengguna.nama ??
                "Belum menetapkan pembimbing"}
            </h1>
          </div>
        </div>
      </div>

      {showAlert && (
        <Alert variant={"destructive"} className="mb-6 rounded-md">
          <AlertTitle className="font-bold text-lg">Perhatian!</AlertTitle>
          <AlertDescription className="text-base">
            Beberapa data profil Anda belum lengkap. Mohon lengkapi untuk
            memastikan informasi Anda akurat.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section: Data Dasar */}
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
          Data Dasar
        </h2>
        <div className="space-y-4">
          <Label
            htmlFor="program_studi"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Program Studi
          </Label>
          <Input
            id="program_studi"
            defaultValue={session.data?.user.programStudi}
            disabled
            className="bg-gray-100 border-gray-200"
          />

          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => {
              // Destructuring value and onChange to handle them explicitly
              const { onChange, value, ...restField } = field;

              return (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={!editForm}
                      placeholder="Contoh: 1, 3, atau 5"
                      onChange={(e) => {
                        const parsedValue =
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value);
                        onChange(parsedValue); // Call react-hook-form's onChange
                      }}
                      // Explicitly set value prop, converting null/undefined to "" for HTML input
                      value={value ?? ""}
                      {...restField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="judulDisertasi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Disertasi</FormLabel>
                <FormControl>
                  <Input
                    disabled={!editForm}
                    placeholder="Contoh: 'Peran Mikrobioma Oral dalam Perkembangan Karies Gigi pada Anak dengan Diabetes Melitus Tipe 1: Studi Molekuler dan Klinis'"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={!editForm}
                    placeholder="Email aktif"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nomorTelpon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input
                    disabled={!editForm}
                    placeholder="Nomor telepon aktif"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section: Data Akademik */}
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4 mt-8">
          Data Akademik
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="angkatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Angkatan</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!editForm}
                      placeholder="Tahun angkatan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tahunLulus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun Lulus Magister/Spesialis</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!editForm}
                      placeholder="Tahun lulus magister/spesialis"
                      maxLength={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="mulaiMasukPendidikan"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Mulai Masuk Pendidikan Doktor FKG Unhas</FormLabel>
                <Popover>
                  <PopoverTrigger disabled={!editForm} asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd MMMM🧍")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section: Data Pribadi */}
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4 mt-8">
          Data Pribadi
        </h2>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="tempatTanggalLahir"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempat/Tanggal Lahir</FormLabel>
                <FormControl>
                  <Input
                    disabled={!editForm}
                    placeholder="Contoh: Makassar, 1 Januari 1990"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alamat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat Sekarang</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={!editForm}
                    placeholder="Alamat lengkap saat ini"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alamatKeluarga"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat Keluarga</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Alamat keluarga/orang tua"
                    disabled={!editForm}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pekerjaan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pekerjaan</FormLabel>
                <FormControl>
                  <Input
                    disabled={!editForm}
                    placeholder="Pekerjaan saat ini"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row justify-end gap-4 pt-6 border-t mt-8">
          <Button
            onClick={() => setEditForm(false)}
            disabled={!editForm || loading}
            type="button"
            variant="outline"
            className="px-6 py-2"
          >
            Batal
          </Button>
          {!editForm ? (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setEditForm(true);
              }}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <FilePenLine className="mr-2 h-4 w-4" />
              Edit Data
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
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
          )}
        </div>
      </form>
    </Form>
  );
}
