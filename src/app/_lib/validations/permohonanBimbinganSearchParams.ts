import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs/server";

export const permohonanBimbinganSearchParams = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(5),
  nama: parseAsString.withDefault(""),
  angkatan: parseAsString.withDefault(""),
});

export type TPermohonanBimbinganSearchParams = {
  page: number;
  perPage: number;
  nama: string;
  angkatan: string;
};
