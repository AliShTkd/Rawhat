import { http } from "./http";
import type { Product } from "../types/product";
import type { Paginated } from "../types/api";

export interface SearchQuery {
  q: string;
  page: number;
}

const emptyResult: Paginated<Product> = {
  items: [],
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
  hasMore: false,
};

export async function searchProducts(
  query: SearchQuery | false,
): Promise<Paginated<Product>> {
  if (!query) return emptyResult;
  const res = await http.get<Paginated<Product>>(
    `/products?q=${encodeURIComponent(query.q)}&page=${query.page}`,
  );
  if (res.ok) return res.data;
  return emptyResult;
}
