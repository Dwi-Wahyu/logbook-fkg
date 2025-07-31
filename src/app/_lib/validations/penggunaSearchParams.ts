import { Prisma } from "@/generated/prisma";
import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs/server";

export const penggunaSearchParams = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  nama: parseAsString.withDefault(""),
  username: parseAsString.withDefault(""),
  angkatan: parseAsString.withDefault(""),
  peran: parseAsStringEnum([
    "MAHASISWA",
    "DOSEN",
    "ADMIN",
    "SUPERADMIN",
  ]).withOptions({
    clearOnDefault: true,
  }),
  filterFlag: parseAsString.withDefault(""),
});

export type TPenggunaSearchParams = {
  page: number;
  perPage: number;
  nama: string;
  username: string;
  angkatan: string;
  peran: "MAHASISWA" | "DOSEN" | "ADMIN" | "SUPERADMIN" | null;
  filterFlag: string;
};

export type PenggunaWithRelations = Prisma.PenggunaGetPayload<{
  include: {
    mahasiswa: true;
    dosen: true;
    programStudi: {
      select: {
        id: true;
        nama: true;
        displayName: true;
      };
    };
  };
}>;
