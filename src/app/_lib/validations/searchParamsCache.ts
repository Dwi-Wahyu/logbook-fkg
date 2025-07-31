import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  createLoader,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
});
