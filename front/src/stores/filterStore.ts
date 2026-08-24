// src/stores/filterStore.ts

import { createStore } from "solid-js/store";
import type { ProductQuery } from "./productStore";

export type SortOption = "newest" | "price_asc" | "price_desc" | "rating";

interface FilterState {
  categorySlug?: string;
  brandSlug?: string;
  search: string;
  sort: SortOption;
  page: number;
  minPrice?: number;
  maxPrice?: number;
}

const initialFilters: FilterState = {
  search: "",
  sort: "newest",
  page: 1,
};

const [state, setState] = createStore<FilterState>({ ...initialFilters });

export const filterActions = {
  setCategory(slug?: string) {
    setState({ categorySlug: slug, page: 1 });
  },
  setBrand(slug?: string) {
    setState({ brandSlug: slug, page: 1 });
  },
  setSearch(q: string) {
    setState({ search: q, page: 1 });
  },
  setSort(sort: SortOption) {
    setState({ sort, page: 1 });
  },
  setPriceRange(min?: number, max?: number) {
    setState({ minPrice: min, maxPrice: max, page: 1 });
  },
  setPage(page: number) {
    setState({ page });
  },
  hydrateFromQuery(params: URLSearchParams) {
    const num = (v: string | null) =>
      v !== null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined;
    setState({
      categorySlug: params.get("category") ?? undefined,
      brandSlug: params.get("brand") ?? undefined,
      search: params.get("q") ?? "",
      sort: (params.get("sort") as SortOption) || "newest",
      page: num(params.get("page")) ?? 1,
      minPrice: num(params.get("min")),
      maxPrice: num(params.get("max")),
    });
  },
  reset() {
    setState({ ...initialFilters });
  },
};

export function toQuery(): ProductQuery {
  return {
    categorySlug: state.categorySlug,
    brandSlug: state.brandSlug,
    search: state.search || undefined,
    sort: state.sort,
    page: state.page,
  };
}

export function toSearchParams(): URLSearchParams {
  const p = new URLSearchParams();
  if (state.categorySlug) p.set("category", state.categorySlug);
  if (state.brandSlug) p.set("brand", state.brandSlug);
  if (state.search) p.set("q", state.search);
  if (state.sort !== "newest") p.set("sort", state.sort);
  if (state.page > 1) p.set("page", String(state.page));
  if (state.minPrice !== undefined) p.set("min", String(state.minPrice));
  if (state.maxPrice !== undefined) p.set("max", String(state.maxPrice));
  return p;
}

export function hasActiveFilters(): boolean {
  return Boolean(
    state.categorySlug ||
    state.brandSlug ||
    state.search ||
    state.sort !== "newest" ||
    state.minPrice !== undefined ||
    state.maxPrice !== undefined,
  );
}

export function useFilterStore() {
  return {
    get categorySlug() { return state.categorySlug; },
    get brandSlug() { return state.brandSlug; },
    get search() { return state.search; },
    get sort() { return state.sort; },
    get page() { return state.page; },
    get minPrice() { return state.minPrice; },
    get maxPrice() { return state.maxPrice; },
    toQuery,
    toSearchParams,
    hasActiveFilters,
  };
}
