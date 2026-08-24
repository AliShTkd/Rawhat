// src/components/wishlist/WishlistItem.tsx
import type { Component } from "solid-js";

interface Props {
  item: any;
  onRemove?: (id: string) => void;
  onAddToCart?: (productId: string) => void;
}

const WishlistItem: Component<Props> = (props) => {
  return (
    <article class="wishlist-item">
      <span class="wishlist-item__name">{props.item.product?.title ?? "محصول"}</span>
      <div class="wishlist-item__actions">
        <button onClick={() => props.onAddToCart?.(props.item.productId)}>
          افزودن به سبد
        </button>
        <button onClick={() => props.onRemove?.(props.item.id)} aria-label="حذف">
          ✕
        </button>
      </div>
    </article>
  );
};

export default WishlistItem;
