// src/app/_components/program-studi/JenisKegiatanManagement.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  PlusCircle,
  Edit,
  Trash2,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CustomToast } from "@/components/toast";
import {
  ProgramStudiWithJenisKegiatan, // Untuk tipe initial list
  JenisKegiatanWithFields, // Untuk tipe jenis kegiatan individual
} from "@/app/_lib/queries/programStudiQueries";
import {
  addJenisKegiatan,
  updateJenisKegiatan,
  deleteJenisKegiatan,
} from "@/app/_lib/actions/programStudiActions";
import {
  TAddJenisKegiatan,
  TUpdateJenisKegiatan,
  addJenisKegiatanSchema,
  updateJenisKegiatanSchema,
} from "@/schema/ProgramStudiSchema";

// Tipe data untuk props
interface JenisKegiatanManagementProps {
  programStudiId: string;
  initialJenisKegiatanList: ProgramStudiWithJenisKegiatan["jenisKegiatan"];
}

export default function JenisKegiatanManagement({
  programStudiId,
  initialJenisKegiatanList,
}: JenisKegiatanManagementProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJenisKegiatan, setSelectedJenisKegiatan] =
    useState<JenisKegiatanWithFields | null>(null);

  // Form untuk menambah Jenis Kegiatan baru
  const addForm = useForm<TAddJenisKegiatan>({
    resolver: zodResolver(addJenisKegiatanSchema),
    defaultValues: {
      programStudiId: programStudiId,
      nama: "",
      isMataKuliahRequired: true,
    },
  });

  // Form untuk mengedit Jenis Kegiatan
  const editForm = useForm<TUpdateJenisKegiatan>({
    resolver: zodResolver(updateJenisKegiatanSchema),
    defaultValues: {
      id: selectedJenisKegiatan?.id || "",
      nama: selectedJenisKegiatan?.nama || "",
      templateIdentifier: selectedJenisKegiatan?.templateIdentifier || null,
      isMataKuliahRequired: selectedJenisKegiatan?.isMataKuliahRequired ?? true,
    },
  });

  // Update edit form default values when selectedJenisKegiatan changes
  useEffect(() => {
    if (selectedJenisKegiatan) {
      editForm.reset({
        id: selectedJenisKegiatan.id,
        nama: selectedJenisKegiatan.nama,
        templateIdentifier: selectedJenisKegiatan.templateIdentifier || null,
        isMataKuliahRequired:
          selectedJenisKegiatan.isMataKuliahRequired ?? true,
      });
    }
  }, [selectedJenisKegiatan, editForm]);

  // --- Handlers untuk Aksi Jenis Kegiatan ---

  const handleAddJenisKegiatan = async (values: TAddJenisKegiatan) => {
    setLoading(true);
    const result = await addJenisKegiatan(values);
    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Jenis Kegiatan Ditambahkan"
          description={
            result.message || "Jenis Kegiatan baru berhasil ditambahkan."
          }
          variant="success"
        />
      ));
      setAddDialogOpen(false);
      addForm.reset();
      router.refresh();
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Menambah Jenis Kegiatan"
          description={
            result.message || "Terjadi kesalahan saat menambah jenis kegiatan."
          }
          variant="destructive"
        />
      ));
    }
    setLoading(false);
  };

  const handleUpdateJenisKegiatan = async (values: TUpdateJenisKegiatan) => {
    setLoading(true);
    const result = await updateJenisKegiatan(values);
    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Jenis Kegiatan Diperbarui"
          description={result.message || "Jenis Kegiatan berhasil diperbarui."}
          variant="success"
        />
      ));
      setEditDialogOpen(false);
      router.refresh();
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Memperbarui Jenis Kegiatan"
          description={
            result.message ||
            "Terjadi kesalahan saat memperbarui jenis kegiatan."
          }
          variant="destructive"
        />
      ));
    }
    setLoading(false);
  };

  const handleDeleteJenisKegiatanClick = (
    jenisKegiatan: JenisKegiatanWithFields
  ) => {
    setSelectedJenisKegiatan(jenisKegiatan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteJenisKegiatan = async () => {
    if (!selectedJenisKegiatan) return;
    setLoading(true);
    const result = await deleteJenisKegiatan({
      id: selectedJenisKegiatan.id,
      programStudiId: programStudiId,
    });
    if (result.success) {
      toast.custom(() => (
        <CustomToast
          title="Jenis Kegiatan Dihapus"
          description={result.message || "Jenis Kegiatan berhasil dihapus."}
          variant="success"
        />
      ));
      setDeleteDialogOpen(false);
      setSelectedJenisKegiatan(null);
      router.refresh();
    } else {
      toast.custom(() => (
        <CustomToast
          title="Gagal Menghapus Jenis Kegiatan"
          description={
            result.message || "Terjadi kesalahan saat menghapus jenis kegiatan."
          }
          variant="destructive"
        />
      ));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Tombol Tambah Jenis Kegiatan */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center px-4 rounded-md">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Jenis Kegiatan
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">
              Tambah Jenis Kegiatan Baru
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Definisikan jenis kegiatan baru untuk Program Studi ini.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddJenisKegiatan)}
              className="space-y-4"
            >
              <FormField
                control={addForm.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Jenis Kegiatan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: LOGSHEET PARTISIPASI PENELITIAN DAN PENGABDIAN MASYARAKAT"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="isMataKuliahRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Wajib Memilih Mata Kuliah</FormLabel>
                      <FormDescription>
                        Centang jika jenis kegiatan ini harus terkait dengan
                        Mata Kuliah.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {/* templateIdentifier tidak diinput di sini, akan digenerasi di action */}
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  Tambah
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Tabel Daftar Jenis Kegiatan */}
      {initialJenisKegiatanList.length === 0 ? (
        <div className="text-center p-8 text-gray-500 rounded-lg bg-gray-50 border border-gray-200">
          <LayoutGrid className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">
            Belum ada Jenis Kegiatan yang ditambahkan.
          </p>
          <p className="text-sm">
            Silakan tambahkan jenis kegiatan baru di atas.
          </p>
        </div>
      ) : (
        <div className="relative w-full overflow-auto rounded-lg border border-gray-200 shadow-sm">
          <Table className="min-w-full bg-white">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-[50px] font-bold text-gray-700">
                  No
                </TableHead>
                <TableHead className="font-bold text-gray-700">
                  Nama Jenis Kegiatan
                </TableHead>
                <TableHead className="font-bold text-gray-700 text-center">
                  Wajib Memilih Mata Kuliah
                </TableHead>
                <TableHead className="font-bold text-gray-700 text-center">
                  Jumlah Field
                </TableHead>
                <TableHead className="text-center font-bold text-gray-700">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialJenisKegiatanList.map((jenisKegiatan, index) => (
                <TableRow
                  key={jenisKegiatan.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-800">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-gray-800">
                    {jenisKegiatan.nama}
                  </TableCell>
                  <TableCell className="text-center">
                    {jenisKegiatan.isMataKuliahRequired ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center text-gray-600">
                    {jenisKegiatan.fields.length}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      {/* Tombol Edit Jenis Kegiatan */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="p-2 rounded-md border-indigo-500 text-indigo-500 hover:bg-indigo-50 transition-colors"
                        onClick={() => {
                          setSelectedJenisKegiatan(jenisKegiatan);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Jenis Kegiatan</span>
                      </Button>
                      {/* Tombol Kelola Field (akan mengarahkan ke halaman/dialog baru) */}
                      <Link
                        href={`/admin/pengaturan/jenis-kegiatan/detail/${jenisKegiatan.id}`}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="p-2 rounded-md border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <LayoutGrid className="h-4 w-4" />
                          <span className="sr-only">Kelola Field</span>
                        </Button>
                      </Link>
                      {/* Tombol Hapus Jenis Kegiatan */}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="p-2 rounded-md hover:bg-red-600 transition-colors"
                        onClick={() =>
                          handleDeleteJenisKegiatanClick(jenisKegiatan)
                        }
                        disabled={loading}
                      >
                        {loading &&
                        selectedJenisKegiatan?.id === jenisKegiatan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Hapus Jenis Kegiatan</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog Edit Jenis Kegiatan */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">
              Edit Jenis Kegiatan
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Ubah detail Jenis Kegiatan "
              <span className="font-semibold">
                {selectedJenisKegiatan?.nama}
              </span>
              ".
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdateJenisKegiatan)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Jenis Kegiatan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama jenis kegiatan"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="templateIdentifier"
                disabled={true}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="hidden">
                      Kunci Template (Opsional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Akan digenerasi otomatis jika kosong"
                        className="hidden"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isMataKuliahRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Wajib Memilih Mata Kuliah</FormLabel>
                      <FormDescription>
                        Centang jika jenis kegiatan ini harus terkait dengan
                        Mata Kuliah.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Delete Jenis Kegiatan */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jenis Kegiatan Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus jenis kegiatan "
              <span className="font-semibold">
                {selectedJenisKegiatan?.nama}
              </span>
              "? Ini juga akan menghapus semua field yang terkait. Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteJenisKegiatan}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
