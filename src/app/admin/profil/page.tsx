"use server";

import GantiPasswordDrawer from "@/app/_components/GantiPasswordDrawer";
import { GantiProfilDrawer } from "@/app/_components/GantiProfilDrawer";
import ProfilEditFormMahasiswa from "@/app/_components/ProfilEditFormMahasiswa";
import UnauthorizedPage from "@/app/_components/UnauthorizedPage";
import { getProfilPengguna } from "@/app/_lib/queries/penggunaQueries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/config/auth";
import { getNameInitials } from "@/service/getNameInitials";
import { Contact, ContactRound, Key } from "lucide-react";
import { Suspense } from "react";

export default async function Profil() {
  const session = await auth();

  if (!session) {
    return <UnauthorizedPage />;
  }

  const profilPengguna = await getProfilPengguna(session?.user.id);

  if (!profilPengguna) {
    return (
      <div>
        <h1>Profil Pengguna Tidak Ditemukan</h1>
      </div>
    );
  }

  return (
    <Suspense fallback={<Skeleton className="w-full h-40" />}>
      <Card className="">
        <CardHeader className="flex flex-col sm:flex-row justify-between w-full items-center">
          <div className="flex justify-center md:justify-start items-center gap-3 w-full">
            <Avatar className="w-20 h-20 ">
              <AvatarImage
                src={`/image/profile-picture/${profilPengguna.avatar}`}
                alt="foto-profil"
              />
              <AvatarFallback>
                {getNameInitials(profilPengguna.nama)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-1">
              <CardTitle>{profilPengguna?.nama}</CardTitle>
              <CardDescription>{profilPengguna?.username}</CardDescription>
              <Badge variant={"secondary"} className="mt-1">
                {profilPengguna?.peran == "DOSEN" ? (
                  <Contact />
                ) : (
                  <ContactRound />
                )}

                {profilPengguna?.peran}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 mt-3 sm:mt-0">
            <GantiProfilDrawer />

            <GantiPasswordDrawer id={session.user.id} />
          </div>
        </CardHeader>
        {profilPengguna?.peran === "MAHASISWA" && (
          <CardContent className="flex flex-col gap-4">
            <Separator />

            <h1 className="mt-1 font-semibold  text-lg">Informasi Pengguna</h1>
            <ProfilEditFormMahasiswa
              id={session.user.id}
              initialData={profilPengguna}
            />
          </CardContent>
        )}
      </Card>
    </Suspense>
  );
}
