// src/components/wishlist/EmptyWishlist.tsx
import type { Component } from "solid-js";
import { A } from "@solidjs/router";

const EmptyWishlist: Component = () => (
  <div class="empty-wishlist">
    <p>لیست علاقه‌مندی‌های شما خالی است.</p>
    <A href="/products" class="empty-wishlist__link">
      مشاهده محصولات
    </A>
  </div>
);

export default EmptyWishlist;
