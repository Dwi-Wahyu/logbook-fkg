import TambahMataKuliahForm from "@/app/_components/mata-kuliah/TambahMataKuliahForm";
import { getAllProgramStudi } from "@/app/_lib/queries/programStudiQueries";
import { prisma } from "@/lib/prisma";

export default async function TambahMataKuliahPage() {
  const allProgramStudi = await getAllProgramStudi();

  return <TambahMataKuliahForm allProgramStudi={allProgramStudi} />;
}
