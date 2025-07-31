"use client";

import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { CloudUpload, ImageUp, SquarePen, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import {
  gantiProfilSchema,
  TGantiProfilSchema,
} from "@/schema/GantiProfilSchema";
import { gantiFotoProfil } from "../_lib/actions/penggunaActions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  onSuccess?: () => void;
}

function ProfileForm({ onSuccess }: ProfileFormProps) {
  const session = useSession();
  const router = useRouter();

  const form = useForm<TGantiProfilSchema>({
    resolver: zodResolver(gantiProfilSchema),
    defaultValues: {
      files: [],
    },
  });

  form.setValue("id", session.data?.user.id ?? "");

  if (!session.data) {
    router.push("/");
    return;
  }

  const onSubmit = React.useCallback((data: TGantiProfilSchema) => {
    const promise = gantiFotoProfil(data);

    toast.promise(promise, {
      loading: "Loading...",
      success: (data) => {
        if (data.success) {
          form.reset();
          onSuccess?.();
          session.data.user.avatar = data.avatar as string;
          return "Foto Profil berhasil diganti";
        }
      },
      error: "Error",
    });
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-4 pb-0 md:p-0"
      >
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onValueChange={field.onChange}
                  accept="image/*"
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024}
                  onFileReject={(_, message) => {
                    form.setError("files", {
                      message,
                    });
                  }}
                >
                  <FileUploadDropzone className="flex-row flex-wrap border-dotted text-center">
                    <CloudUpload className="size-4" />
                    Drag and drop or
                    <FileUploadTrigger asChild>
                      <Button variant="link" size="sm" className="p-0">
                        choose files
                      </Button>
                    </FileUploadTrigger>
                    to upload
                  </FileUploadDropzone>
                  <FileUploadList>
                    {field.value.map((file, index) => (
                      <FileUploadItem key={index} value={file}>
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                          >
                            <X />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </FileUpload>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex justify-center">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className=" w-full md:w-fit mt-4"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function GantiProfilDrawer() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size={"sm"} variant={"secondary"}>
            <ImageUp />
            Ganti Foto Profil
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ganti Foto Profil</DialogTitle>
            <DialogDescription>
              Pilih file dengan ekstensi PNG, JPG atau JPEG. Ukuran maksimum
              gambar adalah 10MB
            </DialogDescription>
          </DialogHeader>
          <ProfileForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size={"sm"} variant={"secondary"}>
          <ImageUp />
          Ganti Foto Profil
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Ganti Foto Profil</DrawerTitle>
          <DrawerDescription>
            Pilih File dengan ekstensi PNG, JPG atau JPEG. Ukuran maksimum
            gambar adalah 10MB
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm onSuccess={() => setOpen(false)} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
