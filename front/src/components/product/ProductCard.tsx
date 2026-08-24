// ProductCard.tsx
import { Show, type Component } from "solid-js";
import type { Product } from "../../types/product";

/** Re-export the canonical Product type so that consumers can
 *  import `{ type Product }` from this module. */
export type { Product };

/** Backward-compatible alias used by RelatedProducts / ProductGrid. */
export type ProductCardData = Product;

export interface ProductCardProps {
  product: Product;
  formatPrice?: (value: number, currency?: string) => string;
  addToCartLabel?: string;
  outOfStockLabel?: string;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: Component<ProductCardProps> = (props) => {
  const product = () => props.product;

  const isOutOfStock = () => product().availability !== "in_stock";

  const hasDiscount = () =>
    product().compareAtPrice !== undefined &&
    product().compareAtPrice!.amount > product().price.amount;

  const formatPrice = (value: number) =>
    props.formatPrice
      ? props.formatPrice(value, product().price.currency)
      : `${value.toLocaleString("fa-IR")} تومان`;

  const handleAddToCart = () => {
    if (isOutOfStock()) return;
    props.onAddToCart?.(product());
  };

  return (
    <article class="product-card">
      <a class="product-card__link" href={`/products/${product().slug}`}>
        <div class="product-card__media">
          <img
            class="product-card__image"
            src={product().image.url}
            alt={product().image.alt}
            loading="lazy"
            decoding="async"
          />

          <Show when={product().badges?.includes("new")}>
            <span class="product-card__badge product-card__badge--new">
              جدید
            </span>
          </Show>

          <Show when={hasDiscount()}>
            <span class="product-card__badge product-card__badge--sale">
              تخفیف
            </span>
          </Show>
        </div>

        <h3 class="product-card__name">{product().title}</h3>
      </a>

      <div class="product-card__pricing">
        <span class="product-card__price">{formatPrice(product().price.amount)}</span>

        <Show when={hasDiscount()}>
          <span class="product-card__original-price">
            {formatPrice(product().compareAtPrice!.amount)}
          </span>
        </Show>
      </div>

      <div class="product-card__footer">
        <Show
          when={!isOutOfStock()}
          fallback={
            <span class="product-card__stock product-card__stock--out">
              {props.outOfStockLabel ?? "ناموجود"}
            </span>
          }
        >
          <button
            class="product-card__add"
            type="button"
            onClick={handleAddToCart}
          >
            {props.addToCartLabel ?? "افزودن به سبد"}
          </button>
        </Show>
      </div>
    </article>
  );
};

export default ProductCard;
