// src/stores/wishlistStore.ts

import { createStore } from "solid-js/store";
import type { ApiError } from "../types/api";
import { loadWishlist } from "../services/wishlistService";

interface WishlistItemData {
  productId: string;
  product?: { title: string; [key: string]: any };
  [key: string]: any;
}

interface WishlistState {
  ids: Set<string>;
  items: WishlistItemData[];
  loading: boolean;
  error?: ApiError;
}

const [state, setState] = createStore<WishlistState>({
  ids: new Set(),
  items: [],
  loading: false,
  error: undefined,
});

export const wishlistActions = {
  setLoading() {
    setState({ loading: true });
  },

  setItems(items: WishlistItemData[] | undefined) {
    const list = items ?? [];
    setState({
      ids: new Set(list.map((it) => it.productId)),
      items: list,
      loading: false,
      error: undefined,
    });
  },

  setError(error: ApiError) {
    setState({ loading: false, error });
  },

  addOptimistic(productId: string) {
    setState("ids", (prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
    setState("items", (prev) => [
      ...prev,
      { productId, product: { title: "" } },
    ]);
  },

  removeOptimistic(productId: string) {
    setState("ids", (prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    setState("items", (prev) =>
      prev.filter((it) => it.productId !== productId)
    );
  },

  clearAll() {
    setState({ ids: new Set(), items: [], loading: false, error: undefined });
  },
};

// ── helpers ──

export function isWishlisted(productId: string): boolean {
  return state.ids.has(productId);
}

export function getWishlistIds(): ReadonlySet<string> {
  return state.ids;
}

export function useWishlistStore() {
  return {
    get ready() {
      return !state.loading;
    },
    get ids() {
      return state.ids;
    },
    get loading() {
      return state.loading;
    },
    get error() {
      return state.error;
    },
    isWishlisted,
    count: () => state.ids.size,
    items: () => state.items,
    remove: (productId: string) => wishlistActions.removeOptimistic(productId),
    clear: () => wishlistActions.clearAll(),
    reload: () => {
      loadWishlist();
    },
  };
}

export function useWishlist() {
  return useWishlistStore();
}
