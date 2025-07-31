import { Fragment, Suspense } from "react";
import { SearchParams } from "nuqs/server";
import { DatatableSkeleton } from "@/components/datatable/datatable-skeleton";
import { auth } from "@/config/auth";
import { getPermohonanBimbingan } from "@/app/_lib/queries/bimbinganQueries";
import { permohonanBimbinganSearchParams } from "@/app/_lib/validations/permohonanBimbinganSearchParams";
import { PengajuanBimbinganTable } from "@/app/_components/bimbingan/PengajuanBimbinganTable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function PermohonanBimbingan(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = permohonanBimbinganSearchParams.parse(searchParams);

  const promises = Promise.all([getPermohonanBimbingan(search)]);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h1 className="font-semibold text-lg ">Daftar Permohonan Bimbingan</h1>
      </CardHeader>

      <CardContent>
        <Suspense fallback={<DatatableSkeleton />}>
          <PengajuanBimbinganTable promises={promises} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
