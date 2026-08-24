import { http } from "./http";
import type { Category } from "../types/category";
import type { Product } from "../types/product";
import type { Paginated } from "../types/api";

export interface CategoryPageData {
  category: Category;
  items: readonly Product[];
  total: number;
  totalPages: number;
}

export interface CategoryQuery {
  slug: string;
  page: number;
  sort: string;
}

export async function getCategories(): Promise<Category[]> {
  const res = await http.get<Category[]>("/categories");
  if (res.ok) return res.data;
  return [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const res = await http.get<Category>(`/categories/${slug}`);
  if (res.ok) return res.data;
  return null;
}

export async function fetchCategory(
  query: CategoryQuery,
): Promise<CategoryPageData> {
  // Fetch category info and its products in one request
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort);

  const res = await http.get<
    { category: Category } & Paginated<Product>
  >(`/categories/${query.slug}/products?${params.toString()}`);

  if (res.ok && res.data?.category) {
    return {
      category: res.data.category,
      items: res.data.items ?? [],
      total: res.data.total ?? 0,
      totalPages: res.data.totalPages ?? 0,
    };
  }

  // Fallback: at least try to get the category info
  const catRes = await http.get<Category>(`/categories/${query.slug}`);
  if (catRes.ok) {
    return {
      category: catRes.data,
      items: [],
      total: 0,
      totalPages: 0,
    };
  }

  throw new Error("Category not found");
}
