// src/stores/productStore.ts

import { createStore } from "solid-js/store";
import type { Product, ProductDetail } from "../types/product";
import type { Paginated, ApiError } from "../types/api";

export interface ProductQuery {
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
  page?: number;
}

interface CachedPage {
  ids: string[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface ProductState {
  byId: Record<string, Product>;
  detailById: Record<string, ProductDetail>;
  pages: Record<string, CachedPage>;
  listStatus: Record<string, "idle" | "loading" | "success" | "error">;
  detailStatus: Record<string, "idle" | "loading" | "success" | "error">;
  error?: ApiError;
}

const [state, setState] = createStore<ProductState>({
  byId: {},
  detailById: {},
  pages: {},
  listStatus: {},
  detailStatus: {},
  error: undefined,
});

export function queryKey(q: ProductQuery): string {
  return JSON.stringify({
    c: q.categorySlug ?? "",
    b: q.brandSlug ?? "",
    s: q.search ?? "",
    o: q.sort ?? "newest",
    p: q.page ?? 1,
  });
}

// ── actions ──

export const productActions = {
  setPage(query: ProductQuery, result: Paginated<Product>) {
    const key = queryKey(query);
    const newById = { ...state.byId };
    for (const p of result.items) newById[p.id] = p;
    const cachedPage: CachedPage = {
      ids: result.items.map((p) => p.id),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
      hasMore: result.page * result.pageSize < result.total,
    };
    setState({
      byId: newById,
      pages: { ...state.pages, [key]: cachedPage },
      listStatus: { ...state.listStatus, [key]: "success" },
    });
  },

  setDetail(detail: ProductDetail) {
    setState({
      detailById: { ...state.detailById, [detail.id]: detail },
      byId: { ...state.byId, [detail.id]: detail as any },
      detailStatus: { ...state.detailStatus, [detail.id]: "success" },
    });
  },

  setListLoading(query: ProductQuery) {
    setState("listStatus", { [queryKey(query)]: "loading" });
  },

  setDetailLoading(productId: string) {
    setState("detailStatus", { [productId]: "loading" });
  },

  setError(error: ApiError) {
    setState({ error });
  },
};

// ── selectors ──

export function getPageProducts(query: ProductQuery): Product[] | undefined {
  const cached = state.pages[queryKey(query)];
  if (!cached) return undefined;
  return cached.ids.map((id) => state.byId[id]).filter(Boolean) as Product[];
}

export function useProductStore() {
  return {
    get byId() {
      return state.byId;
    },
    get detailById() {
      return state.detailById;
    },
    get pages() {
      return state.pages;
    },
    get listStatus() {
      return state.listStatus;
    },
    get detailStatus() {
      return state.detailStatus;
    },
    get error() {
      return state.error;
    },
    getPageProducts,
  };
}
