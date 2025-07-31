"use client";

import { getNameInitials } from "@/service/getNameInitials";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, Loader, Settings, Trash, UserXIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getDetailPengguna } from "@/app/_lib/queries/penggunaQueries";

type Props = {
  dataPengguna: Awaited<ReturnType<typeof getDetailPengguna>>;
};

export default function MahasiswaBimbinganCard({ dataPengguna }: Props) {
  if (!dataPengguna) {
    return <h1>Pengguna tidak ditemukan</h1>;
  }

  const session = useSession();

  const canHapusBimbingan =
    dataPengguna.id === session.data?.user.id ||
    session.data?.user.peran === "ADMIN";

  console.log(canHapusBimbingan);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  function toggleOpen(id: string) {
    setOpen((prev) => !prev);
    setSelectedId(id);
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-5 w-full">
        <CardTitle>Daftar Mahasiswa Bimbingan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {dataPengguna.dosen?.mahasiswaBimbingan.map((mahasiswa) => (
            <div
              key={mahasiswa.pengguna.id}
              className=" justify-between flex gap-2 border-b items-center last:border-b-0 pb-2"
            >
              <div className="flex gap-2 items-center">
                <Avatar className="w-10 h-10 ">
                  <AvatarImage
                    src={`/image/profile-picture/${mahasiswa.pengguna.avatar}`}
                    alt="foto-profil"
                  />
                  <AvatarFallback>
                    {getNameInitials(mahasiswa.pengguna.nama)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="">{mahasiswa.pengguna.nama}</h1>
                  <h1 className="text-muted-foreground">
                    {mahasiswa.pengguna.username}
                  </h1>
                </div>
              </div>

              <div className="hidden md:block">
                <Button asChild variant={"secondary"}>
                  <Link
                    href={`/admin/pengguna/detail/${mahasiswa.pengguna.id}`}
                  >
                    <Eye />
                    Detail
                  </Link>
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="md:hidden block" asChild>
                  <Button>
                    <Settings />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {canHapusBimbingan && (
                    <DropdownMenuItem
                      onClick={() => toggleOpen(mahasiswa.pengguna.id)}
                    >
                      <Trash />
                      Hapus
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/pengguna/detail/${mahasiswa.pengguna.id}`}
                    >
                      <Eye />
                      Detail
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
