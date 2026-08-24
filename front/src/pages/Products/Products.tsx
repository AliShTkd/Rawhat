// pages/Products/Products.tsx
import { Show, For, type Component } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import ProductCard from "../../components/product/ProductCard";
import Breadcrumb from "../../components/common/Breadcrumb";
import type { Product } from "../../types/product";

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "rating", label: "بیشترین امتیاز" },
];

const ProductsPage: Component = () => {
  const [, setSearchParams] = useSearchParams();

  // Placeholder data until API is connected
  const products: Product[] = [];
  const totalCount = 0;

  const changeSort = (value: string) => {
    setSearchParams({ sort: value, page: 1 });
  };

  return (
    <main class="products-page" dir="rtl">
      <Breadcrumb
        items={[
          { label: "خانه", href: "/" },
          { label: "فروشگاه", href: "/products" },
        ]}
      />

      <header class="products-page__header">
        <h1 class="products-page__title">فروشگاه</h1>
        <p class="products-page__count" aria-live="polite">
          {totalCount.toLocaleString("fa-IR")} محصول
        </p>
      </header>

      <div class="products-page__layout">
        <aside class="products-page__sidebar" aria-label="فیلتر محصولات">
          <div style={{ padding: "1rem", color: "var(--text)" }}>
            <p>فیلترها به زودی اضافه می‌شوند.</p>
          </div>
        </aside>

        <div class="products-page__content">
          <div class="products-page__toolbar">
            <label class="products-page__sort">
              <span class="products-page__sort-label">مرتب‌سازی:</span>
              <select
                onChange={(e) => changeSort(e.currentTarget.value)}
                style={{ padding: "0.25rem 0.5rem", "border-radius": "6px", border: "1px solid var(--border)" }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>

          <Show
            when={products.length > 0}
            fallback={
              <div class="products-page__empty">
                <p class="products-page__empty-text">
                  محصولی یافت نشد. سرور متصل نیست.
                </p>
              </div>
            }
          >
            <ul class="products-page__grid">
              <For each={products}>
                {(product) => (
                  <li class="products-page__grid-item">
                    <ProductCard product={product} />
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>
      </div>
    </main>
  );
};

export default ProductsPage;
