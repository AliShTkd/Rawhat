// @ts-nocheck

// components/products/ProductGrid.tsx
import {
  Show,
  For,
  type Component,
  type JSX,
} from "solid-js";
import ProductCard, { type ProductCardData } from "../product/ProductCard";

export type ProductView = "grid" | "list";

export interface ProductGridProps {
  products: ProductCardData[];
  view?: ProductView;
  loading?: boolean;
  skeletonCount?: number;

  formatPrice?: (value: number, currency?: string) => string;
  onAddToCart?: (productId: string | number) => void;
  onProductClick?: (productId: string | number) => void;

  /** متن/محتوای حالت خالی، قابل‌سفارشی‌سازی از بیرون */
  emptyMessage?: string;
  emptySlot?: JSX.Element;
}

const ProductGrid: Component<ProductGridProps> = (props) => {
  const view = () => props.view ?? "grid";
  const hasProducts = () => props.products.length > 0;
  const skeletonCount = () => props.skeletonCount ?? 12;

  return (
    <div
      class="product-grid"
      classList={{
        "product-grid--grid": view() === "grid",
        "product-grid--list": view() === "list",
        "product-grid--loading": props.loading,
      }}
    >
      {/* حالت loading: اسکلت */}
      <Show when={props.loading}>
        <ul class="product-grid__list" aria-hidden="true">
          <For each={Array.from({ length: skeletonCount() })}>
            {() => (
              <li class="product-grid__item">
                <div class="product-grid__skeleton" />
              </li>
            )}
          </For>
        </ul>
      </Show>

      {/* حالت داده / خالی */}
      <Show when={!props.loading}>
        <Show
          when={hasProducts()}
          fallback={
            <Show
              when={props.emptySlot}
              fallback={
                <div class="product-grid__empty" role="status">
                  <p class="product-grid__empty-text">
                    {props.emptyMessage ??
                      "محصولی پیدا نشد. فیلترها را تغییر دهید."}
                  </p>
                </div>
              }
            >
              {props.emptySlot}
            </Show>
          }
        >
          <ul class="product-grid__list">
            <For each={props.products}>
              {(product) => (
                <li class="product-grid__item">
                  <ProductCard
                    product={product}
                    variant={view()}
                    formatPrice={props.formatPrice}
                    onAddToCart={() => props.onAddToCart?.(product.id)}
                    onClick={() => props.onProductClick?.(product.id)}
                  />
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Show>
    </div>
  );
};

export default ProductGrid;




















// // داخل ProductsPage، به‌جای شبکه‌ی درون‌خطی قبلی:
// <ProductGrid
//   products={props.products}
//   view={currentView()}          // "grid" | "list" از URL
//   loading={props.loading}
//   skeletonCount={props.pageSize}
//   formatPrice={props.formatPrice}
//   onAddToCart={(id) => props.onAddToCart?.(id)}
//   onProductClick={(id) => props.onProductClick?.(id)}
// />

// // حالت خالی سفارشی (مثلاً با دکمه‌ی پاک‌کردن فیلترها)
// <ProductGrid
//   products={[]}
//   emptySlot={
//     <div class="product-grid__empty">
//       <p>چیزی پیدا نشد.</p>
//       <button type="button" onClick={clearFilters}>پاک‌کردن فیلترها</button>
//     </div>
//   }
// />


// رسیدیم به ProductGrid — قلب نمایش لیست. این همان شبکه‌ی محصولاتی است که قبلاً درون‌خطی داخل ProductsPage بود؛ حالا جدایش کردم تا ProductsPage فقط هماهنگ‌کننده بماند و منطق نمایشِ شبکه (حالت‌های داده/خالی/loading و نمای grid/list) در یک جای متمرکز باشد.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// این Component صرفاً نمایشی (presentational) است: داده را prop می‌گیرد و هر آیتم را به ProductCard می‌سپارد. خودش fetch/فیلتر/مرتب‌سازی ندارد.
// از نمای grid/list پشتیبانی می‌کند (هماهنگ با toggle که در ProductsHeader گذاشتیم). یادآوری مهم: نمای list فقط وقتی واقعاً درست کار می‌کند که ProductCard یک variant بگیرد — پایین توضیح دادم.
// سه حالت را خودش مدیریت می‌کند: loading (اسکلت)، خالی (empty state)، و داده. صفحه‌بندی این‌جا نیست (کار ProductsPage).






// نکات مهم:

// جایگزینی شبکه‌ی درون‌خطی ProductsPage (هماهنگی لازم): این دقیقاً همان products-page__grid + GridSkeleton + fallback خالی قبلی را در خود جمع می‌کند. اگر می‌پذیری، ProductsPage را به‌روز می‌کنم تا به‌جای آن مارک‌آپ، فقط <ProductGrid/> را صدا بزند. این کار ProductsPage را واقعاً «فقط هماهنگ‌کننده» می‌کند.
// نمای list و وابستگی به ProductCard (مهم‌ترین تصمیم): من variant={view()} را به ProductCard پاس می‌دهم. اگر ProductCard هنوز variant را نمی‌شناسد، در نمای list چیدمان درستِ افقی (تصویر کنار، اطلاعات کنارش) اتفاق نمی‌افتد و فقط CSS شبکه عوض می‌شود. دو راه داریم:
// ProductCard را با variant?: "grid" | "list" گسترش بدهم (پیشنهاد من، اگر نمای list را واقعاً می‌خواهی).
// یا فعلاً نمای list را حذف کنیم و فقط grid داشته باشیم تا چیزی نیمه‌کاره نماند (و بعداً اضافه کنیم). بگو کدام؛ این همان تصمیمی است که در ProductsHeader هم علامت زده بودم و حالا واقعاً به آن رسیدیم.
// Accessibility:
// شبکه یک <ul>/<li> معنایی است (مجموعه‌ای از آیتم‌ها)، نه صرفاً divهای شناور. برای صفحه‌خوان «فهرست n موردی» اعلام می‌شود.
// اسکلت aria-hidden="true" است تا محتوای بی‌معنی خوانده نشود.
// حالت خالی role="status" دارد تا وقتی نتیجه‌ای نیست (مثلاً بعد از فیلتر)، پیام برای کاربر صفحه‌خوان اعلام شود.
// نکته‌ی A11y مهمِ نمای loading: چون در حالت loading کل شبکه aria-hidden است، بهتر است اعلان متنیِ «در حال بارگذاری…» جای دیگری (شمارنده‌ی aria-live در ProductsHeader) باشد — که همان‌جا گذاشتیم. پس این دو مکمل‌اند و نباید هر دو ساکت بمانند.
// جلوگیری از پرش چیدمان (CLS): skeletonCount را برابر pageSize بگذار تا تعداد اسکلت‌ها با تعداد واقعی هم‌خوان باشد و هنگام آمدن داده، صفحه نپرد. ابعاد product-grid__skeleton باید تقریباً هم‌اندازه‌ی ProductCard واقعی باشد (همان aspect-ratio و ارتفاع تقریبی).
// Performance: برای لیست‌های بلند، تصاویر داخل ProductCard باید loading="lazy" باشند (که رعایت شده). اگر pageSize بزرگ است یا نمای list ردیف‌های سنگین دارد، می‌توان بعداً virtualization اضافه کرد؛ ولی برای صفحه‌بندی معمولی (۱۲–۴۸ آیتم) لازم نیست و over-engineering است.
// بدون inline style و کاملاً BEM؛ نکات CSS:
// product-grid--grid .product-grid__list → display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: ....
// product-grid--list .product-grid__list → display: flex; flex-direction: column; gap: ... و داخلش ProductCard نمای افقی.
// product-grid__skeleton با aspect-ratio و افکت shimmer (با @keyframes)، بدون inline style.
// از خاصیت‌های منطقی برای RTL استفاده کن.
// یک نکته‌ی ظریف که ممکن است بخواهی: چون نمای grid و list هر دو از یک <ul> استفاده می‌کنند و فقط با کلاسِ کانتینر متفاوت‌اند، سوییچ‌کردن نما DOM را دوباره نمی‌سازد (بازچینش سبک است). این خوب است چون فوکوس و وضعیت تصاویر حفظ می‌شود.

// قدم بعدی پیشنهادی (وابستگی‌های باقی‌مانده‌ی صفحه‌ی لیست، به‌ترتیب اولویت):

// تصمیم ProductCard variant (برای این‌که نمای list واقعی شود) — چون همین حالا به آن گره خورد.
// Pagination — برای کامل‌شدن عملی ProductsPage.
// Breadcrumb.
// به‌روزرسانی ProductsPage تا از ProductGrid (+ ProductsHeader/ProductSort) استفاده کند.
// کدام را بسازم؟ اگر نمای list را می‌خواهی، بهترین حرکت الان گسترش ProductCard با variant است؛ وگرنه می‌رویم سراغ Pagination. 