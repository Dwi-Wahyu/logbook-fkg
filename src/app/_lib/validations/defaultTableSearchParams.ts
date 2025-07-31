import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs/server";

export const defaultTableSearchParams = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(5),
  search: parseAsString.withDefault(""),
});

export type TDefaultTableSearchParams = {
  page: number;
  perPage: number;
  search: string;
};
