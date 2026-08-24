// @ts-nocheck
// src/components/product/ProductRecommendations.tsx
import {
  Show,
  For,
  createUniqueId,
  type Component,
} from "solid-js";
import RelatedProducts from "./RelatedProducts";
import type { Product } from "../../types/product";

export interface RecommendationSection {
  id: string | number;
  title: string;
  products: Product[];
}

export interface ProductRecommendationsProps {
  sections: RecommendationSection[];
  heading?: string;
  loading?: boolean;
  skeletonCount?: number;
  onAddToCart?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
}

const ProductRecommendations: Component<ProductRecommendationsProps> = (
  props
) => {
  const headingId = createUniqueId();

  const visibleSections = () =>
    props.sections.filter((s) => s.products.length > 0);

  const hasContent = () => props.loading || visibleSections().length > 0;

  return (
    <Show when={hasContent()}>
      <section class="product-recommendations" aria-labelledby={headingId}>
        <h2 class="product-recommendations__heading" id={headingId}>
          {props.heading ?? "پیشنهاد برای شما"}
        </h2>

        <Show when={props.loading}>
          <RelatedProducts products={[]} loading skeletonCount={props.skeletonCount ?? 4} title="" />
        </Show>

        <Show when={!props.loading}>
          <For each={visibleSections()}>
            {(section) => (
              <div class="product-recommendations__section">
                <RelatedProducts
                  title={section.title}
                  products={section.products}
                  onAddToCart={props.onAddToCart}
                  onProductClick={props.onProductClick}
                />
              </div>
            )}
          </For>
        </Show>
      </section>
    </Show>
  );
};

export default ProductRecommendations;
