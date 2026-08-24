export { loadOrders, loadOrderDetail, checkout, fetchOrders, fetchOrderById } from "../services/orderService";

import { checkout } from "../services/orderService";
import type { CheckoutPayload } from "../types/order";
import type { PlaceOrderResult } from "../types/checkout";

export async function placeOrder(payload: CheckoutPayload): Promise<PlaceOrderResult | null> {
  const orderId = await checkout(payload);
  if (!orderId) return null;
  return { orderId };
}
