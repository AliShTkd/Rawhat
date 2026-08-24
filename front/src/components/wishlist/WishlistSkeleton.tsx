// src/components/wishlist/WishlistSkeleton.tsx
import type { Component } from "solid-js";

const WishlistSkeleton: Component = () => (
  <div class="wishlist-skeleton" aria-hidden="true">
    <div class="wishlist-skeleton__item" />
    <div class="wishlist-skeleton__item" />
    <div class="wishlist-skeleton__item" />
  </div>
);

export default WishlistSkeleton;
