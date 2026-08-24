// src/types/wishlist.ts
import type { Product } from "./product";

/**
 * یک آیتم در لیستِ علاقه‌مندی‌ها.
 * سبک‌تر از CartItem — فقط ارجاع به محصول، نه عکسِ فوری.
 */
export interface WishlistItem {
  id: string;
  productId: string;
  /** زمانِ افزودن (ISO) — برای مرتب‌سازیِ «جدیدترین اول». */
  addedAt: string;
  /** ارجاعِ سبکِ محصول برای نمایشِ سریع. */
  product?: Product;
}
