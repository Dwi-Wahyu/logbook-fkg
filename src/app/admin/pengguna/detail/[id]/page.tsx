// src/app/(dashboard)/profil/page.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Fragment, Suspense } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getNameInitials } from "@/service/getNameInitials";
import { Separator } from "@/components/ui/separator";
import {
  CircleDashed,
  Contact,
  ContactRound,
  User as UserIcon,
} from "lucide-react"; // Renamed User to UserIcon to avoid conflict with Pengguna type
import MahasiswaBimbinganCard from "@/app/_components/pengguna/MahasiswaBimbinganCard";
import { format } from "date-fns";
import PembimbingCard from "@/app/_components/pengguna/PembimbingCard"; // Changed to client component import
import { auth } from "@/config/auth";
import {
  getAllDosen,
  getDetailPengguna,
  getKegiatanProgressByMahasiswaId,
} from "@/app/_lib/queries/penggunaQueries";
import MahasiswaKegiatanProgress from "@/app/_components/pengguna/MahasiswaKegiatanProgress";
import JenisKegiatanTable from "@/app/_components/pengguna/JenisKegiatanPenggunaTable";
import { getProgramStudiById } from "@/app/_lib/queries/programStudiQueries";

export default async function DetailPengguna({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // Fetch data secara paralel
  const [dataPengguna, allDosen] = await Promise.all([
    getDetailPengguna(id),
    getAllDosen(), // Fetch all dosen for the supervisor selection
  ]);

  if (!dataPengguna) {
    return <h1>Pengguna tidak ditemukan</h1>;
  }

  const isDosen = dataPengguna.peran === "DOSEN";
  const isMahasiswa = dataPengguna.peran === "MAHASISWA";

  const isViewerDPJP =
    session?.user.id === dataPengguna.mahasiswa?.pembimbing?.pengguna.id;

  let kegiatanProgress: Awaited<
    ReturnType<typeof getKegiatanProgressByMahasiswaId>
  > = [];
  if (isMahasiswa && isViewerDPJP && dataPengguna.mahasiswa?.id) {
    kegiatanProgress = await getKegiatanProgressByMahasiswaId(
      dataPengguna.mahasiswa.id
    );
  }

  const programStudiData = await getProgramStudiById(
    dataPengguna.programStudiId
  );

  return (
    <Suspense fallback={<Skeleton className="w-full h-40" />}>
      <Card className="mb-5 shadow-lg rounded-xl">
        {" "}
        {/* Added shadow and rounded corners */}
        <CardHeader className="flex flex-col sm:flex-row items-center gap-5 w-full">
          <Avatar className="w-20 h-20 rounded-lg">
            <AvatarImage
              src={`/image/profile-picture/${dataPengguna.avatar}`}
              alt="foto-profil"
            />
            <AvatarFallback className="rounded-lg">
              {getNameInitials(dataPengguna.nama)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1 text-center sm:text-left">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {dataPengguna?.nama}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {dataPengguna?.username}
            </CardDescription>
            <Badge
              variant={"secondary"}
              className="mt-2 text-sm px-3 py-1 rounded-full w-fit mx-auto sm:mx-0"
            >
              {dataPengguna?.peran == "DOSEN" ? (
                <Contact className="h-4 w-4 mr-1" />
              ) : (
                <ContactRound className="h-4 w-4 mr-1" />
              )}
              {dataPengguna?.peran}
            </Badge>
          </div>
        </CardHeader>
        {/* <CardContent className="flex flex-col gap-4">
          <CardTitle className="text-xl font-semibold border-b pb-2">
            Informasi Pengguna
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h1 className="font-semibold text-gray-700">Program Studi</h1>
              <p className="text-muted-foreground">
                {dataPengguna.programStudi.displayName}
              </p>
            </div>

            <div>
              <h1 className="font-semibold text-gray-700">Username</h1>
              <p className="text-muted-foreground">
                {dataPengguna.username ?? "-"}
              </p>
            </div>

            <div>
              <h1 className="font-semibold text-gray-700">Email</h1>
              <p className="text-muted-foreground">
                {dataPengguna.mahasiswa?.email ?? "-"}
              </p>
            </div>

            <div>
              <h1 className="font-semibold text-gray-700">Nomor Telpon</h1>
              <p className="text-muted-foreground">
                {dataPengguna.mahasiswa?.nomorTelpon ?? "-"}
              </p>
            </div>

            <div>
              <h1 className="font-semibold text-gray-700">Alamat</h1>
              <p className="text-muted-foreground">
                {dataPengguna.mahasiswa?.alamat ?? "-"}
              </p>
            </div>

            <div>
              <h1 className="font-semibold text-gray-700">
                Tempat Tanggal Lahir
              </h1>
              <p className="text-muted-foreground">
                {dataPengguna.mahasiswa?.tempatTanggalLahir ?? "-"}
              </p>
            </div>
          </div>

          {isMahasiswa && (
            <Fragment>
              <h3 className="text-lg font-semibold border-b pb-2 mt-4">
                Informasi Akademik
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h1 className="font-semibold text-gray-700">
                    Mulai Masuk Pendidikan
                  </h1>
                  <p className="text-muted-foreground">
                    {dataPengguna.mahasiswa?.mulaiMasukPendidikan
                      ? format(
                          new Date(dataPengguna.mahasiswa.mulaiMasukPendidikan),
                          "dd MMMM🧍"
                        )
                      : "-"}
                  </p>
                </div>

                <div>
                  <h1 className="font-semibold text-gray-700">Tahun Lulus</h1>
                  <p className="text-muted-foreground ">
                    {dataPengguna.mahasiswa?.tahunLulus ?? "-"}
                  </p>
                </div>
              </div>
            </Fragment>
          )}
        </CardContent> */}
      </Card>

      {isDosen && <MahasiswaBimbinganCard dataPengguna={dataPengguna} />}

      {/* Pass allDosen to PembimbingCard for the selection dropdown */}
      <PembimbingCard dataPengguna={dataPengguna} allDosen={allDosen} />

      {isMahasiswa && (
        <Card>
          <CardContent>
            <div className="flex mb-4 gap-2 items-center">
              <CircleDashed className="h-5 w-5" />

              <CardTitle>Progress Kegiatan Mahasiswa</CardTitle>
            </div>

            <JenisKegiatanTable
              initialJenisKegiatanList={programStudiData?.jenisKegiatan ?? []}
              idPengguna={dataPengguna.id}
            />
          </CardContent>
        </Card>
      )}
    </Suspense>
  );
}
