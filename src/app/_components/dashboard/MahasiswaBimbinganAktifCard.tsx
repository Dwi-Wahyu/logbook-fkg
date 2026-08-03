import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNameInitials } from "@/service/getNameInitials";
import { Flame, Users } from "lucide-react";
import Link from "next/link";

export type MahasiswaAktifItem = {
  id: string;
  nama: string;
  username: string;
  avatar: string | null;
  jumlahAktivitas: number;
};

export default function MahasiswaBimbinganAktifCard({
  mahasiswaList,
}: {
  mahasiswaList: MahasiswaAktifItem[];
}) {
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500 fill-orange-500/20" />
          Mahasiswa Bimbingan Paling Aktif
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mahasiswaList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Users className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">
              Belum ada mahasiswa bimbingan yang aktif.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mahasiswaList.map((mhs) => (
              <div
                key={mhs.id}
                className="flex items-center gap-3 pb-3 border-b last:border-b-0 last:pb-0"
              >
                <Avatar className="h-10 w-10 rounded-full border shrink-0">
                  <AvatarImage
                    src={
                      mhs.avatar
                        ? `/image/profile-picture/${mhs.avatar}`
                        : undefined
                    }
                    alt={mhs.nama}
                  />
                  <AvatarFallback className="rounded-full bg-primary/10 text-primary font-semibold text-xs">
                    {getNameInitials(mhs.nama)}
                  </AvatarFallback>
                </Avatar>
                <div className="grow min-w-0">
                  <Link
                    href={`/admin/pengguna/detail/${mhs.id}`}
                    className="font-semibold text-sm text-gray-900 hover:text-primary transition-colors truncate block"
                  >
                    {mhs.nama}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mhs.jumlahAktivitas} Aktivitas
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
