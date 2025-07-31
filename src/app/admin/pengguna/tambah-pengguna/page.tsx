import TambahPenggunaForm from "@/app/_components/pengguna/TambahPenggunaForm";
import { getAllProgramStudi } from "@/app/_lib/queries/programStudiQueries";

export default async function TambahPenggunaPage() {
  const allProgramStudi = await getAllProgramStudi();

  return <TambahPenggunaForm allProgramStudi={allProgramStudi} />;
}
