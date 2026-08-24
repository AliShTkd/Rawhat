// src/stores/cartStore.ts

import { createStore } from "solid-js/store";
import type { Cart, CartItem } from "../types/cart";
import type { ApiError } from "../types/api";

/** سبدِ خالیِ اولیه */
const emptyCart: Cart = {
  items: [],
  currency: "IRR",
  updatedAt: new Date(0).toISOString(),
};

interface CartState {
  cart: Cart;
  syncStatus: "idle" | "loading" | "success" | "error";
  syncError?: ApiError;
}

const [state, setState] = createStore<CartState>({
  cart: emptyCart,
  syncStatus: "idle",
  syncError: undefined,
});

// ── snapshot/restore for optimistic updates ──

export function snapshot(): Cart {
  return { ...state.cart };
}

export function restore(snap: Cart) {
  setState({ cart: snap });
}

// ── getters ──

export function getCartState() {
  return state;
}

// ── computed helpers ──

function computeSubtotal(): number {
  return state.cart.items.reduce(
    (sum, item) => sum + (item.unitPrice?.amount ?? 0) * item.quantity,
    0
  );
}

// ── actions (for services and components) ──

export const cartActions = {
  addItem(_input: any, item: CartItem) {
    setState("cart", "items", (prev) => {
      const existing = prev.find((it: any) => it.productId === item.productId);
      if (existing) {
        return prev.map((it: any) =>
          it.productId === item.productId
            ? { ...it, quantity: it.quantity + item.quantity }
            : it
        );
      }
      return [...prev, item];
    });
  },

  updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      cartActions.removeItem(itemId);
      return;
    }
    setState("cart", "items", (prev) =>
      prev.map((it: any) =>
        it.productId === itemId ? { ...it, quantity } : it
      )
    );
  },

  removeItem(itemId: string) {
    setState("cart", "items", (prev) =>
      prev.filter((it: any) => it.productId !== itemId)
    );
  },

  clear() {
    setState({ cart: emptyCart });
  },

  reconcile(serverCart: Cart) {
    setState({ cart: serverCart, syncStatus: "success" });
  },

  setSyncing() {
    setState("syncStatus", "loading");
  },

  setSyncError(error: ApiError) {
    setState({ syncStatus: "error", syncError: error });
  },

  // ── aliases used by cartService ──
  setCart(cart: Cart | undefined) {
    setState({ cart: cart ?? emptyCart, syncStatus: "success" });
  },

  setCartError(error: ApiError) {
    setState({ syncStatus: "error", syncError: error });
  },

  setCartLoading() {
    setState("syncStatus", "loading");
  },

  clearCart() {
    setState({ cart: emptyCart, syncStatus: "success" });
  },

  // ── optimistic methods used by cartService ──

  addItemOptimistic(productId: string, qty: number) {
    setState("cart", "items", (prev) => [
      ...prev,
      { productId, quantity: qty } as any,
    ]);
  },

  updateQtyOptimistic(productId: string, qty: number) {
    setState("cart", "items", (prev) =>
      prev.map((it: any) =>
        it.productId === productId ? { ...it, quantity: qty } : it
      )
    );
  },

  removeItemOptimistic(productId: string) {
    setState("cart", "items", (prev) =>
      prev.filter((it: any) => it.productId !== productId)
    );
  },
};

// ── convenience getter ──

export function useCartStore() {
  return {
    get cart() {
      return state.cart;
    },
    get sync() {
      return { status: state.syncStatus, data: state.cart, error: state.syncError };
    },
    get loading() {
      return state.syncStatus === "loading";
    },
    get items() {
      return state.cart.items;
    },
    get subtotal() {
      return computeSubtotal();
    },
    get discount() {
      return 0;
    },
    get shipping() {
      return 0;
    },
    get total() {
      return computeSubtotal();
    },
    clear: () => cartActions.clearCart(),
    addItem: (productId: string, qty = 1) =>
      cartActions.addItemOptimistic(productId, qty),
    updateQuantity: (productId: string, qty: number) =>
      cartActions.updateQuantity(productId, qty),
    removeItem: (productId: string) => cartActions.removeItem(productId),
  };
}

export { useCartStore as useCart };
