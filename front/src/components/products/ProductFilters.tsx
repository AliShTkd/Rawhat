
// components/products/ProductFilters.tsx
import {
  Show,
  For,
  createUniqueId,
  type Component,
} from "solid-js";

export interface FacetOption {
  value: string;
  label: string;
  count?: number; // تعداد محصولِ این گزینه (اختیاری)
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterState {
  categories?: string[];
  brands?: string[];
  price?: PriceRange;
  minRating?: number;
  inStockOnly?: boolean;
}

export interface FilterFacets {
  categories?: FacetOption[];
  brands?: FacetOption[];
  priceBounds?: PriceRange; // کمینه/بیشینه‌ی مجاز قیمت
}

export interface ProductFiltersProps {
  facets: FilterFacets;
  value: FilterState;
  onChange: (next: FilterState) => void;
  onClear?: () => void;
  formatPrice?: (value: number) => string;
}

const ProductFilters: Component<ProductFiltersProps> = (props) => {
  const priceMinId = createUniqueId();
  const priceMaxId = createUniqueId();

  // آیا فیلتری فعال است؟ (برای نمایش دکمه‌ی پاک‌کردن)
  const hasActiveFilters = () => {
    const v = props.value;
    return Boolean(
      v.categories?.length ||
        v.brands?.length ||
        v.price ||
        v.minRating ||
        v.inStockOnly
    );
  };

  // تیک‌زدن/برداشتن یک گزینه در یک آرایه (categories یا brands)
  const toggleInArray = (
    key: "categories" | "brands",
    value: string,
    checked: boolean
  ) => {
    const current = props.value[key] ?? [];
    const next = checked
      ? [...current, value]
      : current.filter((x) => x !== value);
    props.onChange({ ...props.value, [key]: next.length ? next : undefined });
  };

  const isChecked = (key: "categories" | "brands", value: string) =>
    (props.value[key] ?? []).includes(value);

  const changePrice = (part: "min" | "max", raw: string) => {
    const bounds = props.facets.priceBounds;
    const num = raw === "" ? undefined : Number(raw);
    const prev = props.value.price ?? {
      min: bounds?.min ?? 0,
      max: bounds?.max ?? 0,
    };
    const next: PriceRange = { ...prev, [part]: num ?? prev[part] };
    props.onChange({ ...props.value, price: next });
  };

  const setRating = (rating: number) => {
    // کلیک روی همان امتیاز فعلی، آن را برمی‌دارد (toggle)
    props.onChange({
      ...props.value,
      minRating: props.value.minRating === rating ? undefined : rating,
    });
  };

  const setInStock = (checked: boolean) => {
    props.onChange({ ...props.value, inStockOnly: checked || undefined });
  };

  return (
    <form
      class="product-filters"
      aria-label="فیلتر محصولات"
      onSubmit={(e) => e.preventDefault()}
    >
      <div class="product-filters__header">
        <h2 class="product-filters__title">فیلترها</h2>
        <Show when={hasActiveFilters()}>
          <button
            class="product-filters__clear"
            type="button"
            onClick={() => props.onClear?.()}
          >
            پاک‌کردن همه
          </button>
        </Show>
      </div>

      {/* دسته‌بندی */}
      <Show when={props.facets.categories?.length}>
        <fieldset class="product-filters__group">
          <legend class="product-filters__legend">دسته‌بندی</legend>
          <ul class="product-filters__options">
            <For each={props.facets.categories}>
              {(opt) => (
                <li class="product-filters__option">
                  <label class="product-filters__check">
                    <input
                      type="checkbox"
                      class="product-filters__check-input"
                      checked={isChecked("categories", opt.value)}
                      onChange={(e) =>
                        toggleInArray(
                          "categories",
                          opt.value,
                          e.currentTarget.checked
                        )
                      }
                    />
                    <span class="product-filters__check-label">
                      {opt.label}
                    </span>
                    <Show when={opt.count != null}>
                      <span class="product-filters__check-count">
                        {opt.count!.toLocaleString("fa-IR")}
                      </span>
                    </Show>
                  </label>
                </li>
              )}
            </For>
          </ul>
        </fieldset>
      </Show>

      {/* برند */}
      <Show when={props.facets.brands?.length}>
        <fieldset class="product-filters__group">
          <legend class="product-filters__legend">برند</legend>
          <ul class="product-filters__options">
            <For each={props.facets.brands}>
              {(opt) => (
                <li class="product-filters__option">
                  <label class="product-filters__check">
                    <input
                      type="checkbox"
                      class="product-filters__check-input"
                      checked={isChecked("brands", opt.value)}
                      onChange={(e) =>
                        toggleInArray(
                          "brands",
                          opt.value,
                          e.currentTarget.checked
                        )
                      }
                    />
                    <span class="product-filters__check-label">
                      {opt.label}
                    </span>
                    <Show when={opt.count != null}>
                      <span class="product-filters__check-count">
                        {opt.count!.toLocaleString("fa-IR")}
                      </span>
                    </Show>
                  </label>
                </li>
              )}
            </For>
          </ul>
        </fieldset>
      </Show>

      {/* بازه‌ی قیمت */}
      <Show when={props.facets.priceBounds}>
        <fieldset class="product-filters__group">
          <legend class="product-filters__legend">بازه‌ی قیمت</legend>
          <div class="product-filters__price">
            <div class="product-filters__price-field">
              <label
                class="product-filters__price-label"
                for={priceMinId}
              >
                از
              </label>
              <input
                id={priceMinId}
                class="product-filters__price-input"
                type="number"
                inputmode="numeric"
                min={props.facets.priceBounds!.min}
                max={props.facets.priceBounds!.max}
                value={props.value.price?.min ?? ""}
                onChange={(e) => changePrice("min", e.currentTarget.value)}
              />
            </div>
            <div class="product-filters__price-field">
              <label
                class="product-filters__price-label"
                for={priceMaxId}
              >
                تا
              </label>
              <input
                id={priceMaxId}
                class="product-filters__price-input"
                type="number"
                inputmode="numeric"
                min={props.facets.priceBounds!.min}
                max={props.facets.priceBounds!.max}
                value={props.value.price?.max ?? ""}
                onChange={(e) => changePrice("max", e.currentTarget.value)}
              />
            </div>
          </div>
        </fieldset>
      </Show>

      {/* حداقل امتیاز */}
      <fieldset class="product-filters__group">
        <legend class="product-filters__legend">حداقل امتیاز</legend>
        <ul class="product-filters__ratings">
          <For each={[4, 3, 2, 1]}>
            {(rating) => (
              <li class="product-filters__rating">
                <button
                  type="button"
                  class="product-filters__rating-btn"
                  aria-pressed={props.value.minRating === rating}
                  aria-label={`${rating} ستاره و بالاتر`}
                  onClick={() => setRating(rating)}
                >
                  <span aria-hidden="true">
                    {"★".repeat(rating)}
                    {"☆".repeat(5 - rating)}
                  </span>
                  <span class="product-filters__rating-text">و بالاتر</span>
                </button>
              </li>
            )}
          </For>
        </ul>
      </fieldset>

      {/* فقط موجود */}
      <fieldset class="product-filters__group">
        <label class="product-filters__check product-filters__check--stock">
          <input
            type="checkbox"
            class="product-filters__check-input"
            checked={Boolean(props.value.inStockOnly)}
            onChange={(e) => setInStock(e.currentTarget.checked)}
          />
          <span class="product-filters__check-label">فقط کالاهای موجود</span>
        </label>
      </fieldset>
    </form>
  );
};

export default ProductFilters;





















// // داخل ProductsPage (سایدبار) یا داخل Drawer موبایل:
// <ProductFilters
//   facets={{
//     categories: [
//       { value: "mineral", label: "آب معدنی", count: 42 },
//       { value: "sparkling", label: "آب گازدار", count: 12 },
//     ],
//     brands: [
//       { value: "damavand", label: "دماوند", count: 18 },
//       { value: "oxab", label: "اُکساب", count: 9 },
//     ],
//     priceBounds: { min: 0, max: 500000 },
//   }}
//   value={currentFilters()}            // از query/URL خوانده می‌شود
//   onChange={(next) => applyFilters(next)}  // در URL می‌نشیند
//   onClear={() => clearFilters()}
// />



// رسیدیم به ProductFilters — بزرگ‌ترین قطعه‌ی گمشده‌ی صفحه‌ی لیست که چند بار علامتش زده بودم. این پنل فیلتر سمت (دسته/برند/بازه‌ی قیمت/امتیاز/موجودی) است. چون فرم فیلتر ذاتاً درگیر A11y و RTL و منبع‌حقیقت‌بودن URL است، این‌جا با دقت بیشتری طراحی کردم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// این Component کنترل‌شده (controlled) است: مقدار فعلی فیلترها را prop می‌گیرد (value) و هر تغییر را با onChange به بالا می‌دهد تا آن‌جا در query/URL بنشیند (هماهنگ با تصمیم ProductsPage). خودش state ماندگار نگه نمی‌دارد.
// گزینه‌های قابل‌انتخاب (facets) از بیرون/سرور می‌آیند (دسته‌ها، برندها با تعداد، بازه‌ی مجاز قیمت). این Component لیست ثابت سخت‌کد ندارد.
// الگوی اعمال: فوری (on-change) — هر تیک بلافاصله اعمال می‌شود. یک حالت جایگزین «اعمال با دکمه» هم در نکات توضیح دادم.
// بازه‌ی قیمت را این‌جا با دو input عددی (از/تا) گذاشتم، نه اسلایدر دوسر. دلیلش پایین آمده (اسلایدر دوسر با A11y درست، خودش یک Component جدا و پرچالش است).


// نکات مهم:

// کنترل‌شده + URL منبع حقیقت: این Component چیزی را داخل خودش نگه نمی‌دارد؛ value می‌گیرد و onChange می‌دهد. در ProductsPage، onChange باید فیلترها را در query بنشاند (و page را به ۱ برگرداند). این یعنی refresh/اشتراک لینک، فیلترها را حفظ می‌کند.
// A11y (نقطه‌ی قوت این Component):
// هر گروه فیلتر یک <fieldset> با <legend> است — این استاندارد درست برای «گروهی از کنترل‌های مرتبط» است و صفحه‌خوان عنوان گروه را قبل از هر گزینه اعلام می‌کند.
// چک‌باکس‌ها داخل <label> پیچیده شده‌اند (کلیک روی متن هم کار می‌کند) و از input بومی استفاده می‌کنند (نه div سفارشی) تا رفتار کیبورد/فوکوس رایگان و درست باشد.
// فیلتر امتیاز با دکمه‌های aria-pressed (toggle) و aria-label متنی («۴ ستاره و بالاتر») است؛ ستاره‌های ★/☆ تزئینی و aria-hiddenاند تا صفحه‌خوان کاراکترها را هجی نکند.
// input های قیمت label واقعی با for/id دارند و type="number" + inputmode="numeric".
// دو تصمیم مهم که باید خودت بگیری:
// اعمال فوری در برابر اعمال با دکمه: الان on-change فوری است. مزیت: سریع و مدرن. عیب: در موبایل/شبکه‌ی کند، هر تیک یک درخواست می‌زند. اگر بار سرور مهم است، دو راهکار دارم: (الف) debounce روی onChange (به‌خصوص برای input قیمت که با تایپ عوض می‌شود — این تقریباً ضروری است)، یا (ب) الگوی «اعمال با دکمه» با یک state موقت داخلی و دکمه‌ی «اعمال فیلترها». بگو کدام را می‌خواهی؛ برای input قیمت من قویاً debounce را توصیه می‌کنم.
// اسلایدر دوسر قیمت: عمداً از دو input عددی استفاده کردم نه اسلایدر دوسر. اسلایدر دوسرِ درست‌ازنظر-A11y (دو thumb، aria-valuemin/max/now, پشتیبانی کیبورد، RTL) یک Component مستقل و نسبتاً پیچیده است. اگر واقعاً اسلایدر می‌خواهی، به‌صورت PriceRangeSlider جدا می‌سازمش (و همین input ها را هم به‌عنوان fallback/همراهش نگه می‌داریم).
// RTL / اعداد: تعدادها با toLocaleString("fa-IR") فارسی می‌شوند. برای input عددی قیمت، مقدار داخل input را انگلیسی نگه داشتم (چون type="number" با ارقام فارسی مشکل دارد)؛ نمایش فرمت‌شده‌ی فارسی را می‌توان جدا کنار input نشان داد. اگر ارقام فارسی داخل خود فیلد را می‌خواهی، باید به type="text" + parse دستی سوییچ کنیم — بگو تا این نسخه را بدهم.
// هماهنگی با موبایل (Drawer): همین Component بدون تغییر داخل Drawer موبایل هم می‌نشیند (که در ProductsHeader دکمه‌ی بازکردنش را گذاشتیم). فقط ظرف (Drawer) بیرون است. اگر Drawer را بسازیم، این پنل مستقیم داخلش می‌رود.
// بدون inline style و کاملاً BEM؛ چیدمان گروه‌ها با فاصله‌ی عمودی، اسکرول‌شدن لیست‌های بلند (مثلاً برندهای زیاد با max-block-size + overflow: auto)، استایل چک‌باکس، حالت فعال دکمه‌ی امتیاز ([aria-pressed="true"])، و چیدمان دو فیلد قیمت را در CSS با همین کلاس‌ها بساز. از خاصیت‌های منطقی برای RTL استفاده کن.
// یک نکته‌ی تجربه‌ی کاربری که ممکن است بخواهی بعداً اضافه کنیم: «تراشه‌های فیلتر فعال» (filter chips) بالای شبکه‌ی محصولات که هر فیلتر انتخاب‌شده را با دکمه‌ی حذف (×) نشان دهد. این خیلی به کشف‌پذیری کمک می‌کند و می‌تواند یک Component کوچک ActiveFilters باشد.

// قدم بعدی پیشنهادی (وابستگی‌های باقی‌مانده‌ی صفحه‌ی لیست):

// Pagination — هنوز نساخته‌ایم و ProductsPage به آن نیاز دارد.
// Breadcrumb.
// در صورت تمایل: ActiveFilters (chips) یا PriceRangeSlider یا Drawer موبایل.
// کدام را بسازم؟ پیشنهادم Pagination است تا صفحه‌ی لیست عملاً کامل شود. 