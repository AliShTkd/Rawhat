// src/stores/orderStore.ts

import { createStore } from "solid-js/store";
import type { Order, OrderSummary, OrderStatus } from "../types/order";
import type { Paginated, ApiError } from "../types/api";

export interface OrderQuery {
  status?: OrderStatus;
  page?: number;
}

interface OrderState {
  summaryById: Record<string, OrderSummary>;
  listOrder: string[];
  pagination?: { page: number; pageSize: number; total: number; hasMore: boolean };
  detailById: Record<string, Order>;
  listStatus: "idle" | "loading" | "success" | "error";
  detailStatus: Record<string, "idle" | "loading" | "success" | "error">;
  placing: boolean;
  placeError?: ApiError;
  error?: ApiError;
}

const [state, setState] = createStore<OrderState>({
  summaryById: {},
  listOrder: [],
  pagination: undefined,
  detailById: {},
  listStatus: "idle",
  detailStatus: {},
  placing: false,
  placeError: undefined,
  error: undefined,
});



export const orderActions = {
  setOrderPage(result: Paginated<OrderSummary>) {
    const summaryById = { ...state.summaryById };
    for (const o of result.items) summaryById[o.id] = o;
    const seen = new Set(state.listOrder);
    const merged = [...state.listOrder];
    for (const o of result.items) if (!seen.has(o.id)) merged.push(o.id);
    setState({
      summaryById,
      listOrder: merged,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        hasMore: result.page * result.pageSize < result.total,
      },
      listStatus: "success",
    });
  },

  setOrderDetail(order: Order) {
    const summary = state.summaryById[order.id];
    setState({
      detailById: { ...state.detailById, [order.id]: order },
      detailStatus: { ...state.detailStatus, [order.id]: "success" },
      summaryById: summary
        ? {
            ...state.summaryById,
            [order.id]: { ...summary, status: order.status, total: order.totals.total },
          }
        : state.summaryById,
    });
  },

  updateStatus(orderId: string, status: OrderStatus) {
    const summary = state.summaryById[orderId];
    const detail = state.detailById[orderId];
    setState({
      summaryById: summary
        ? { ...state.summaryById, [orderId]: { ...summary, status } }
        : state.summaryById,
      detailById: detail
        ? { ...state.detailById, [orderId]: { ...detail, status } }
        : state.detailById,
    });
  },

  prependNewOrder(order: Order) {
    const listOrder = state.listOrder.includes(order.id)
      ? state.listOrder
      : [order.id, ...state.listOrder];
    setState({
      listOrder,
      summaryById: {
        ...state.summaryById,
        [order.id]: {
          id: order.id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          total: order.totals.total,
          status: order.status,
          itemCount: order.items.length,
        },
      },
      detailById: { ...state.detailById, [order.id]: order },
    });
  },

  setListLoading() {
    setState("listStatus", "loading");
  },

  setDetailLoading(orderId: string) {
    setState("detailStatus", { [orderId]: "loading" });
  },

  setError(error: ApiError) {
    setState({ error });
  },

  setPlacing() {
    setState({ placing: true, placeError: undefined });
  },

  setPlaceError(error: ApiError) {
    setState({ placing: false, placeError: error });
  },
};

// ── aliases used by orderService ──

export function getPageOrders(_query: OrderQuery): OrderSummary[] | undefined {
  // For simplicity, return all cached orders
  return state.listOrder
    .map((id) => state.summaryById[id])
    .filter(Boolean) as OrderSummary[];
}

export function useOrderStore() {
  return {
    get summaryById() { return state.summaryById; },
    get detailById() { return state.detailById; },
    get listOrder() { return state.listOrder; },
    get pagination() { return state.pagination; },
    get listStatus() { return state.listStatus; },
    get detailStatus() { return state.detailStatus; },
    get placing() { return state.placing; },
    get placeError() { return state.placeError; },
    getPageOrders,
  };
}
