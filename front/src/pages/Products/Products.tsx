

// pages/Products/Products.tsx
import {
  Show,
  For,
  Suspense,
  createMemo,
  type Component,
} from "solid-js";
import { useSearchParams } from "@solidjs/router";
import ProductCard, { type ProductCardData } from "../../components/ProductCard";
import ProductFilters, {
  type FilterState,
} from "../../components/ProductFilters";
import Select from "../../components/Select";
import Pagination from "../../components/Pagination";
import Breadcrumb from "../../components/Breadcrumb";

export interface ProductsPageProps {
  /** لیست محصولات صفحه‌ی جاری (از لایه‌ی داده/loader بیرونی) */
  products: ProductCardData[];
  totalCount: number;
  pageSize: number;
  loading?: boolean;
  /** گزینه‌های فیلتر که سرور/داده تعیین می‌کند (دسته‌ها، برندها، بازه‌ی قیمت) */
  facets?: FilterState;
  formatPrice?: (value: number, currency?: string) => string;
  onAddToCart?: (productId: string | number) => void;
  onProductClick?: (productId: string | number) => void;
}

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "popular", label: "محبوب‌ترین" },
  { value: "rating", label: "بیشترین امتیاز" },
];

const ProductsPage: Component<ProductsPageProps> = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = createMemo(() => Number(searchParams.page ?? 1));
  const currentSort = createMemo(() => searchParams.sort ?? "newest");

  const totalPages = createMemo(() =>
    Math.max(1, Math.ceil(props.totalCount / props.pageSize))
  );

  const hasProducts = () => props.products.length > 0;

  const changeSort = (value: string) => {
    // تغییر مرتب‌سازی، بازگشت به صفحه‌ی ۱
    setSearchParams({ sort: value, page: 1 });
  };

  const changePage = (page: number) => {
    setSearchParams({ page });
    // اسکرول به بالای لیست برای تجربه‌ی بهتر
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyFilters = (next: Partial<FilterState>) => {
    // فیلترها به query params منتقل می‌شوند؛ صفحه به ۱ برمی‌گردد
    setSearchParams({ ...next, page: 1 });
  };

  return (
    <main class="products-page">
      <Breadcrumb
        items={[
          { label: "خانه", href: "/" },
          { label: "فروشگاه", href: "/products" },
        ]}
      />

      <header class="products-page__header">
        <h1 class="products-page__title">فروشگاه</h1>
        <p class="products-page__count" aria-live="polite">
          {props.totalCount.toLocaleString("fa-IR")} محصول
        </p>
      </header>

      <div class="products-page__layout">
        {/* ستون فیلترها */}
        <aside
          class="products-page__sidebar"
          aria-label="فیلتر محصولات"
        >
          <ProductFilters
            value={props.facets}
            onChange={applyFilters}
          />
        </aside>

        {/* ستون اصلی: نوار ابزار + شبکه + صفحه‌بندی */}
        <div class="products-page__content">
          <div class="products-page__toolbar">
            <label class="products-page__sort">
              <span class="products-page__sort-label">مرتب‌سازی:</span>
              <Select
                value={currentSort()}
                options={SORT_OPTIONS}
                onChange={changeSort}
              />
            </label>
          </div>

          <Suspense fallback={<GridSkeleton />}>
            <Show
              when={hasProducts()}
              fallback={
                <div class="products-page__empty">
                  <p class="products-page__empty-text">
                    محصولی با این فیلترها پیدا نشد. فیلترها را تغییر دهید.
                  </p>
                </div>
              }
            >
              <ul class="products-page__grid">
                <For each={props.products}>
                  {(product) => (
                    <li class="products-page__grid-item">
                      <ProductCard
                        product={product}
                        formatPrice={props.formatPrice}
                        onAddToCart={() => props.onAddToCart?.(product.id)}
                        onClick={() => props.onProductClick?.(product.id)}
                      />
                    </li>
                  )}
                </For>
              </ul>

              <Show when={totalPages() > 1}>
                <nav
                  class="products-page__pagination"
                  aria-label="صفحه‌بندی محصولات"
                >
                  <Pagination
                    currentPage={currentPage()}
                    totalPages={totalPages()}
                    onPageChange={changePage}
                  />
                </nav>
              </Show>
            </Show>
          </Suspense>
        </div>
      </div>
    </main>
  );
};

const GridSkeleton: Component = () => (
  <ul class="products-page__grid" aria-hidden="true">
    <For each={Array.from({ length: 12 })}>
      {() => (
        <li class="products-page__grid-item">
          <div class="products-page__skeleton" />
        </li>
      )}
    </For>
  </ul>
);

export default ProductsPage;















// // معمولاً داخل یک route با loader/resource:
// <Route
//   path="/products"
//   component={() => {
//     const [searchParams] = useSearchParams();
//     const [data] = createResource(
//       () => ({ ...searchParams }),           // با تغییر query دوباره واکشی می‌شود
//       (params) => fetchProducts(params)      // واکشی سمت سرور با همان فیلتر/صفحه/مرتب‌سازی
//     );

//     return (
//       <ProductsPage
//         products={data()?.items ?? []}
//         totalCount={data()?.total ?? 0}
//         pageSize={24}
//         loading={data.loading}
//         facets={data()?.facets}
//         onAddToCart={(id) => addToCart(id, 1)}
//         onProductClick={(id) => navigate(`/product/${id}`)}
//       />
//     );
//   }}
// />



// رسیدیم به سطح صفحه (نه دیگر یک Component تکی). pages/Products/Products.tsx صفحه‌ی فهرست/کاتالوگ محصولات است؛ پس نقشش مونتاژ و هماهنگی است، نه ساختن UI جدید. این‌جا داده، فیلتر، مرتب‌سازی و صفحه‌بندی را کنار هم می‌آورد و رندر هر آیتم را به ProductCard می‌سپارد.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// این صفحه ترکیب‌کننده‌ی سطح صفحه است: خودش UI پایه نمی‌سازد؛ از ProductCard (شبکه)، و primitiveهای Select (مرتب‌سازی)، Pagination، Breadcrumb و یک ProductFilters استفاده می‌کند. هرکدام را که هنوز نساخته‌ایم، در انتها علامت زده‌ام.
// منبع حقیقت، URL است (query params مثل ?page=2&sort=newest&category=...). این برای صفحه‌ی لیست حیاتی است: اشتراک‌گذاری لینک، دکمه‌ی back مرورگر، و SEO. این‌جا فرض کردم یک روتر (مثل @solidjs/router) داری و از useSearchParams استفاده می‌کنم.
// واکشی داده بیرون از این فایل و از طریق یک منبع reactive (مثل createResource) می‌آید؛ من ساختار را نشان می‌دهم ولی endpoint واقعی را تو وصل می‌کنی.



// نکات مهم:

// URL به‌عنوان منبع حقیقت (مهم‌ترین تصمیم این صفحه): صفحه، مرتب‌سازی و فیلترها همه در query params ذخیره می‌شوند، نه در state داخلی. مزایا: لینک قابل‌اشتراک، کارکرد درست دکمه‌ی back/forward مرورگر، و امکان SSR/SEO. با تغییر query، لایه‌ی داده (createResource) دوباره واکشی می‌کند. این الگو باعث می‌شود صفحه «بی‌حالت» (stateless) و قابل‌پیش‌بینی بماند.
// جدایی واکشی از نمایش: این فایل عمداً خودش fetch نمی‌کند؛ داده را به‌صورت prop می‌گیرد. این کار تست، SSR و جایگزینی منبع داده را ساده می‌کند و صفحه را «نمایشی/ترکیب‌کننده» نگه می‌دارد. اگر ترجیح می‌دهی fetch داخل همین فایل باشد، می‌توانم نسخه‌ای با createResource داخلی بسازم.
// Accessibility:
// یک <h1> واحد برای صفحه (عنوان «فروشگاه»)، و ساختار main/aside/nav معنایی.
// شبکه یک <ul>/<li> معنایی است (مجموعه‌ای از آیتم‌ها).
// شمارنده‌ی نتایج aria-live="polite" دارد تا وقتی فیلتر عوض شد و تعداد تغییر کرد، به کاربر صفحه‌خوان اعلام شود. نکته‌ی A11y مهم: هنگام واکشی نتایج جدید، بهتر است یک اعلان «در حال بارگذاری…» و سپس «۳۲ نتیجه یافت شد» هم به یک ناحیه‌ی live بدهی؛ اگر بخواهی این را کامل می‌کنم.
// navها aria-label مجزا دارند (breadcrumb و pagination) تا از هم متمایز باشند.
// حالت‌های خالی/در حال بارگذاری: هم Suspense با اسکلت، هم fallback «محصولی پیدا نشد». اسکلت aria-hidden است. توصیه: اسکلت را با تعداد نزدیک به pageSize نشان بده تا پرش چیدمان (layout shift) کم شود.
// Performance / SEO: صفحه‌بندی مبتنی بر URL برای خزنده‌ها ایندکس‌پذیر است (بهتر از infinite scroll خالص برای SEO). اگر infinite scroll می‌خواهی، پیشنهاد می‌کنم hybrid باشد (URL page + دکمه‌ی «بارگذاری بیشتر») تا SEO حفظ شود. برای موبایل هم فیلترها بهتر است داخل یک Drawer/Modal جمع شوند (نکته‌ی responsive پایین).
// Responsive (نکته‌ی مهمی که باید تصمیم بگیری): در دسکتاپ products-page__layout دو ستونه است (سایدبار فیلتر + شبکه). در موبایل، سایدبار باید به یک دکمه‌ی «فیلترها» + کشوی (Drawer) بازشونده تبدیل شود، وگرنه فیلترها کل صفحه را اشغال می‌کنند. من ساختار را دوستونه گذاشتم؛ اگر بخواهی، منطق باز/بسته‌شدن فیلتر موبایل را با یک Drawer (که می‌توانیم بسازیم) اضافه می‌کنم.
// بدون inline style و کاملاً BEM؛ شبکه‌ی responsive (products-page__grid با display: grid و grid-template-columns: repeat(auto-fill, minmax(...)))، چیدمان دوستونه‌ی __layout، چسبیدن سایدبار (position: sticky)، و ابعاد اسکلت را در CSS با همین کلاس‌ها بساز. از خاصیت‌های منطقی برای RTL استفاده کن.
// هشدارهای هماهنگی (وابستگی‌های واقعی): این صفحه به چند چیز تکیه دارد که وضعیت‌شان را باید روشن کنیم:

// ProductFilters — هنوز نساخته‌ایم. این مهم‌ترین قطعه‌ی گمشده است (فیلتر دسته/برند/بازه‌ی قیمت/امتیاز با A11y مناسب: fieldset/legend, چک‌باکس‌ها، اسلایدر قیمت).
// Pagination — نساخته‌ایم. نیازمند A11y دقیق (nav, صفحه‌ی جاری با aria-current="page", دکمه‌های قبلی/بعدی).
// Breadcrumb — نساخته‌ایم (پیش‌تر هم پیشنهادش دادم).
// Select — فرض کردم ساخته شده؛ اگر نه، باید اول آن را بسازیم (با A11y کامل یا listbox سفارشی).
// فرض کردم روتر @solidjs/router است؛ اگر روتر دیگری داری بگو تا useSearchParams را تطبیق بدهم.
// پیشنهاد ترتیب برای کامل‌کردن این صفحه بدون شکستن وابستگی‌ها:

// اول Pagination (کوچک و پرکاربرد).
// بعد Breadcrumb.
// بعد ProductFilters (بزرگ‌ترین قطعه).
// در پایان اگر Select آماده نیست، همان را نهایی کنیم.
// کدام را اول بسازم؟ پیشنهاد من شروع با Pagination است تا این صفحه سریع‌تر واقعی شود. 🙂