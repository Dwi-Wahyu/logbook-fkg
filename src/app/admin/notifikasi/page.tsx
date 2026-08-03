import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { findAllNotifikasi } from "@/app/_lib/actions/notifikasiAction";
import NotifikasiPageClient from "@/app/_components/notifikasi/NotifikasiPageClient";
import { SearchParams } from "nuqs/server";

interface NotifikasiPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function NotifikasiPage({
  searchParams: searchParamsPromise,
}: NotifikasiPageProps) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/");
  }

  const rawSearchParams = await searchParamsPromise;
  const page = Number(rawSearchParams.page) || 1;
  const limit = Number(rawSearchParams.limit) || 10;

  const result = await findAllNotifikasi({
    penggunaId: session.user.id,
    page,
    limit,
  });

  return (
    <NotifikasiPageClient
      initialNotifikasiList={result.data || []}
      totalCount={result.totalCount || 0}
      pageCount={result.pageCount || 1}
    />
  );
}
