import { Suspense } from "react";
import { MahasiswaTable } from "@/app/_components/pengguna/MahasiswaTable";
import { SearchParams } from "nuqs/server";
import { DatatableSkeleton } from "@/components/datatable/datatable-skeleton";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { getPengguna } from "@/app/_lib/queries/penggunaQueries";
import { penggunaSearchParams } from "@/app/_lib/validations/penggunaSearchParams";
import { auth } from "@/config/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function DaftarPengguna(props: IndexPageProps) {
  const session = await auth();

  const searchParams = await props.searchParams;
  const search = penggunaSearchParams.parse(searchParams);

  const updatedSearch = {
    ...search,
    peran: "MAHASISWA" as const,
  };

  const promises = Promise.all([getPengguna(updatedSearch)]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-lg ">Daftar Mahasiswa</h1>

          {(session?.user.peran === "ADMIN" ||
            session?.user.peran === "SUPERADMIN") && (
            <Link href="/admin/pengguna/tambah-pengguna">
              <Button>
                <UserPlus />
                Tambah Akun Mahasiswa
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Suspense fallback={<DatatableSkeleton />}>
          <MahasiswaTable promises={promises} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
