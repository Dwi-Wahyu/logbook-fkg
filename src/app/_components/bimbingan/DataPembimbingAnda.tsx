import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

import { TDataPembimbing } from "./PengajuanBimbinganForm"; // Pastikan path ini benar
import { getNameInitials } from "@/service/getNameInitials";
import { UserX } from "lucide-react";

export default function DataPembimbingAnda({
  dataPembimbing,
}: {
  dataPembimbing: TDataPembimbing;
}) {
  const isMobile = useIsMobile();

  return (
    <React.Fragment>
      {isMobile ? (
        <Separator className="mb-6" orientation="horizontal" />
      ) : (
        <Separator className="mr-5" orientation="vertical" />
      )}
      <Card className="w-full h-fit shadow-md">
        {" "}
        {/* Tambah shadow */}
        <CardContent className="p-6">
          {dataPembimbing?.mahasiswa?.pembimbing ? (
            <div className="flex flex-col items-center gap-6 p-4">
              {" "}
              {/* Atur flex, gap, dan padding */}
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                DPJP Anda Saat Ini
              </h1>{" "}
              {/* Judul lebih besar dan bold */}
              <div className="flex flex-col items-center gap-4">
                {" "}
                {/* Pembungkus untuk avatar dan info, di-center */}
                <Avatar className="h-24 w-24 rounded-full border-4 border-primary shadow-lg">
                  {" "}
                  {/* Avatar lebih besar, border tebal, shadow */}
                  <AvatarImage
                    src={`/image/profile-picture/${dataPembimbing?.mahasiswa.pembimbing?.pengguna.avatar}`}
                    alt="Foto Profil Pembimbing"
                  />
                  <AvatarFallback className="rounded-full text-2xl bg-blue-100 text-primary font-semibold">
                    {" "}
                    {/* Warna fallback lebih cerah */}
                    {getNameInitials(
                      dataPembimbing?.mahasiswa.pembimbing?.pengguna.nama ??
                        "NN"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  {" "}
                  {/* Teks di-center */}
                  <CardTitle className="text-2xl font-bold text-gray-900 leading-tight">
                    {" "}
                    {/* Judul lebih besar, bold, leading ketat */}
                    {dataPembimbing?.mahasiswa.pembimbing?.pengguna.nama}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 mt-1">
                    {" "}
                    {/* Deskripsi username */}
                    {dataPembimbing?.mahasiswa.pembimbing?.pengguna.username}
                  </CardDescription>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              {" "}
              {/* Tambah border dashed dan background */}
              <UserX className="h-20 w-20 mb-4 text-gray-400" />
              <CardTitle className="text-xl font-semibold mb-2 text-gray-700">
                {" "}
                {/* Warna teks lebih gelap */}
                Pembimbing Belum Ditentukan
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Anda belum memiliki DPJP yang ditugaskan. Silakan hubungi admin
                program studi Anda untuk informasi lebih lanjut.
              </CardDescription>
            </div>
          )}
        </CardContent>
      </Card>
    </React.Fragment>
  );
}
