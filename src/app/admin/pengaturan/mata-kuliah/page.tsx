import { Suspense } from "react";
import { SearchParams } from "nuqs/server";
import { DatatableSkeleton } from "@/components/datatable/datatable-skeleton";
import { auth } from "@/config/auth";
import { defaultTableSearchParams } from "@/app/_lib/validations/defaultTableSearchParams";
import { MataKuliahTable } from "@/app/_components/mata-kuliah/MataKuliahTable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getMataKuliah } from "@/app/_lib/queries/mataKuliahQueries";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function MataKuliah(props: IndexPageProps) {
  const session = await auth();

  const searchParams = await props.searchParams;
  const search = defaultTableSearchParams.parse(searchParams);

  const promises = Promise.all([getMataKuliah(search)]);

  const isAdmin = session?.user.peran === "ADMIN";
  const isSuperAdmin = session?.user.peran === "SUPERADMIN";

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-lg ">Daftar Mata Kuliah</h1>

          {(isAdmin || isSuperAdmin) && (
            <Button asChild>
              <Link href="/admin/pengaturan/mata-kuliah/tambah-mata-kuliah">
                Tambah Mata Kuliah
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<DatatableSkeleton />}>
          <MataKuliahTable promises={promises} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
