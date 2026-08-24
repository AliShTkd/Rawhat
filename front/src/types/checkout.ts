import type { Address } from "./user";

export interface CheckoutForm {
  shippingAddressId: string;
  billingAddressId?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod: "online" | "cash_on_delivery" | "wallet";
  note?: string;
}

/** مرحله‌ی چک‌اوت — برای نمایش stepper. */
export interface CheckoutStep {
  id: string;
  label: string;
  completed: boolean;
}

/** اطلاعاتِ فرمِ چندمرحله‌ای — منبعِ حقیقت در Checkout page. */
export interface CheckoutData {
  address: Address | null;
  shippingMethodId: string | null;
  payment: { method: string; [key: string]: unknown } | null;
}

/** نتیجه‌ی ثبت سفارش از سرور. */
export interface PlaceOrderResult {
  orderId: string;
  redirectUrl?: string;
}
