

// components/products/ProductsHeader.tsx
import {
  Show,
  createUniqueId,
  type Component,
} from "solid-js";
import Select from "../Select";

export type ProductView = "grid" | "list";

export interface SortOption {
  value: string;
  label: string;
}

export interface ProductsHeaderProps {
  title: string;
  totalCount: number;
  loading?: boolean;

  sort: string;
  sortOptions?: SortOption[];
  onSortChange: (value: string) => void;

  view?: ProductView;
  onViewChange?: (view: ProductView) => void;

  /** فقط برای موبایل: باز کردن کشوی فیلترها */
  onOpenFilters?: () => void;
  /** تعداد فیلترهای فعال، برای نشان‌دادن روی دکمه‌ی فیلتر */
  activeFilterCount?: number;
}

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "popular", label: "محبوب‌ترین" },
  { value: "rating", label: "بیشترین امتیاز" },
];

const ProductsHeader: Component<ProductsHeaderProps> = (props) => {
  const countId = createUniqueId();
  const options = () => props.sortOptions ?? DEFAULT_SORT_OPTIONS;

  const setView = (view: ProductView) => props.onViewChange?.(view);

  return (
    <div class="products-header">
      {/* راست: عنوان + شمارش نتایج */}
      <div class="products-header__info">
        <h1 class="products-header__title">{props.title}</h1>
        <p
          class="products-header__count"
          id={countId}
          aria-live="polite"
        >
          <Show
            when={!props.loading}
            fallback={<span class="products-header__count-loading">در حال بارگذاری…</span>}
          >
            {props.totalCount.toLocaleString("fa-IR")} محصول
          </Show>
        </p>
      </div>

      {/* چپ: ابزارها */}
      <div class="products-header__tools">
        {/* دکمه‌ی فیلتر — فقط موبایل (نمایش با CSS کنترل می‌شود) */}
        <Show when={props.onOpenFilters}>
          <button
            class="products-header__filter-btn"
            type="button"
            onClick={() => props.onOpenFilters?.()}
          >
            <span class="products-header__filter-btn-text">فیلترها</span>
            <Show when={(props.activeFilterCount ?? 0) > 0}>
              <span
                class="products-header__filter-badge"
                aria-label={`${props.activeFilterCount} فیلتر فعال`}
              >
                {props.activeFilterCount!.toLocaleString("fa-IR")}
              </span>
            </Show>
          </button>
        </Show>

        {/* مرتب‌سازی */}
        <label class="products-header__sort">
          <span class="products-header__sort-label">مرتب‌سازی:</span>
          <Select
            value={props.sort}
            options={options()}
            onChange={(v) => props.onSortChange(v)}
          />
        </label>

        {/* تعویض نما grid/list */}
        <Show when={props.onViewChange}>
          <div
            class="products-header__view"
            role="group"
            aria-label="نمای نمایش محصولات"
          >
            <button
              class="products-header__view-btn products-header__view-btn--grid"
              type="button"
              aria-label="نمای شبکه‌ای"
              aria-pressed={props.view === "grid"}
              onClick={() => setView("grid")}
            >
              <span aria-hidden="true">▦</span>
            </button>
            <button
              class="products-header__view-btn products-header__view-btn--list"
              type="button"
              aria-label="نمای فهرستی"
              aria-pressed={props.view === "list"}
              onClick={() => setView("list")}
            >
              <span aria-hidden="true">☰</span>
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default ProductsHeader;
















// // داخل ProductsPage، به‌جای <header> دستی قبلی:
// <ProductsHeader
//   title="فروشگاه"
//   totalCount={props.totalCount}
//   loading={props.loading}
//   sort={currentSort()}
//   onSortChange={changeSort}
//   view={currentView()}
//   onViewChange={changeView}
//   onOpenFilters={() => setFiltersOpen(true)}
//   activeFilterCount={activeFilterCount()}
// />




// این هم components/products/ProductsHeader.tsx. توجه کردم که این‌بار مسیر داخل components/products/ است (نه pages/)، پس این یک زیرمؤلفه‌ی نمایشی است که از دل ProductsPage بیرون کشیده شده تا نوار بالای لیست (عنوان + شمارش نتایج + مرتب‌سازی + تعویض نمای grid/list + دکمه‌ی فیلتر موبایل) را جدا و تمیز مدیریت کند. این کار ProductsPage را سبک‌تر می‌کند و این نوار را قابل‌تست/بازاستفاده.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// این Component کاملاً کنترل‌شده (controlled) است: هیچ state داخلی برای مرتب‌سازی/نما نگه نمی‌دارد؛ مقدار فعلی را prop می‌گیرد و تغییرات را با callback به بالا (که آن‌جا در URL/query ذخیره می‌شود) می‌دهد. این با تصمیم «URL منبع حقیقت» در ProductsPage هماهنگ است.
// سه مسئولیت: (۱) نمایش عنوان و تعداد نتایج، (۲) مرتب‌سازی با Select، (۳) تعویض نمای grid/list، و یک دکمه‌ی «فیلترها» که فقط در موبایل دیده می‌شود و Drawer فیلتر را باز می‌کند (منطق باز/بسته بیرون است).
// گزینه‌های مرتب‌سازی را از بیرون می‌گیرد (پیش‌فرض دارد) تا سخت‌کد نباشد.


// نکات مهم:

// جایگزینی بخش header در ProductsPage: این Component دقیقاً همان products-page__header + بخش toolbar قبلی را در خود جمع می‌کند. اگر این را می‌پذیری، باید ProductsPage را کمی به‌روز کنیم تا به‌جای مارک‌آپ دستیِ عنوان/مرتب‌سازی، از <ProductsHeader/> استفاده کند و دو state جدید (view و باز/بسته‌بودن فیلتر موبایل) را هم به query/URL وصل کند. بگو تا آن هماهنگی را انجام دهم.
// تصمیم مهم: <h1> کجاست؟ (خطر A11y) عنوان صفحه را این‌جا <h1> گذاشتم. حواست باشد که در کل صفحه فقط یک <h1> وجود داشته باشد؛ یعنی اگر این Component را استفاده می‌کنی، <h1> قبلی در ProductsPage باید حذف شود تا دو تا h1 نشود. اگر ترجیح می‌دهی این Component ساختاری‌تر بماند و عنوان بیرون کنترل شود، می‌توانم prop headingLevel یا حتی حذف عنوان از این‌جا را پیاده کنم. این را عمداً علامت زدم چون یک تداخل بالقوه است.
// تعویض نما (grid/list): از دو دکمه با aria-pressed استفاده کردم (الگوی toggle button)، داخل یک role="group" با برچسب. این درست‌تر از radiogroup برای دکمه‌های toggle بصری است. آیکن‌های ▦/☰ تزئینی‌اند (aria-hidden) و برچسب واقعی روی خود دکمه است.
// هماهنگی لازم: اگر نمای list را می‌خواهی، ProductCard باید یک prop variant?: "grid" | "list" بگیرد تا در حالت فهرستی افقی رندر شود (تصویر کنار، اطلاعات کنارش). الان ProductCard احتمالاً فقط حالت کارت عمودی دارد. اگر نمای list را واقعاً لازم داری، بگو تا ProductCard را با variant گسترش دهم؛ وگرنه می‌توانیم کل بخش view toggle را حذف کنیم تا چیزی نیمه‌کاره نماند.
// Accessibility:
// شمارش نتایج aria-live="polite" است تا با تغییر فیلتر/مرتب‌سازی، تعداد جدید برای صفحه‌خوان اعلام شود. حالت loading هم متن «در حال بارگذاری…» را در همان ناحیه‌ی live می‌گذارد تا تجربه‌ی گویاتر شود.
// دکمه‌ی فیلتر موبایل، تعداد فیلترهای فعال را هم به‌صورت متنی (aria-label) اعلام می‌کند، نه فقط عدد بصری.
// همه‌ی دکمه‌ها type="button" دارند تا داخل فرم احتمالی، submit ناخواسته رخ ندهد.
// Responsive: دکمه‌ی «فیلترها» فقط باید در موبایل دیده شود (در دسکتاپ فیلترها در سایدبار همیشه هستند). این را با CSS کنترل کن (products-header__filter-btn { display: none } و در media query موبایل display: inline-flex)، نه با JS، تا ساده و بدون پرش بماند.
// بدون inline style و کاملاً BEM؛ چیدمان دوسر (عنوان یک‌طرف، ابزارها طرف دیگر با justify-content: space-between)، شکسته‌شدن به چند ردیف در موبایل، استایل دکمه‌های toggle و حالت فعال (aria-pressed="true" → .products-header__view-btn[aria-pressed="true"])، و بج فیلتر را در CSS با همین کلاس‌ها بساز. از خاصیت‌های منطقی برای RTL استفاده کن.
// دو هماهنگی که بهتر است تصمیم بگیری (وابستگی واقعی):

// ProductsPage را به‌روز کنم تا از این ProductsHeader استفاده کند و h1 تکراری حذف شود؟
// نمای list را واقعاً می‌خواهی؟ اگر بله، باید ProductCard را با variant="list" گسترش دهم؛ اگر نه، view toggle را حذف کنیم.
// قدم بعدی پیشنهادی همان ترتیب قبلی است که هنوز باقی مانده: Pagination → Breadcrumb → ProductFilters (و در صورت نیاز نهایی‌کردن Select). کدام را بسازم؟ 🙂