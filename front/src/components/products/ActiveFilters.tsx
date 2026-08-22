
// components/products/ActiveFilters.tsx
import {
  Show,
  For,
  type Component,
} from "solid-js";

export interface ActiveFilterChip {
  /** کلید یکتا برای این تراشه، مثلاً "brand:damavand" یا "price" */
  id: string;
  /** برچسب گروه (اختیاری)، مثلاً «برند» */
  groupLabel?: string;
  /** متن نمایشی خوانا، مثلاً «دماوند» یا «۰ تا ۵۰۰٬۰۰۰ تومان» */
  label: string;
}

export interface ActiveFiltersProps {
  items: ActiveFilterChip[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  /** متن پیش از تراشه‌ها (اختیاری) */
  heading?: string;
  /** آستانه‌ی نمایش دکمه‌ی «پاک‌کردن همه» (پیش‌فرض ۲) */
  clearAllThreshold?: number;
}

const ActiveFilters: Component<ActiveFiltersProps> = (props) => {
  const hasItems = () => props.items.length > 0;
  const showClearAll = () =>
    props.items.length >= (props.clearAllThreshold ?? 2);

  return (
    <Show when={hasItems()}>
      <div class="active-filters" role="region" aria-label="فیلترهای فعال">
        <Show when={props.heading}>
          <span class="active-filters__heading">{props.heading}</span>
        </Show>

        <ul class="active-filters__list">
          <For each={props.items}>
            {(chip) => (
              <li class="active-filters__item">
                <span class="active-filters__chip">
                  <Show when={chip.groupLabel}>
                    <span class="active-filters__group">
                      {chip.groupLabel}:
                    </span>
                  </Show>
                  <span class="active-filters__label">{chip.label}</span>
                  <button
                    type="button"
                    class="active-filters__remove"
                    aria-label={`حذف فیلتر ${
                      chip.groupLabel ? chip.groupLabel + " " : ""
                    }${chip.label}`}
                    onClick={() => props.onRemove(chip.id)}
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </span>
              </li>
            )}
          </For>

          <Show when={showClearAll() && props.onClearAll}>
            <li class="active-filters__item active-filters__item--clear">
              <button
                type="button"
                class="active-filters__clear-all"
                onClick={() => props.onClearAll?.()}
              >
                پاک‌کردن همه
              </button>
            </li>
          </Show>
        </ul>
      </div>
    </Show>
  );
};

export default ActiveFilters;





















// توضیح کوتاه استفاده

// نکته این‌جاست که باید یک تابع کوچکِ نگاشت در والد (ProductsPage) بنویسی که FilterState را به ActiveFilterChip[] تبدیل کند. این «چسبِ» بین فیلترها و تراشه‌هاست:

// // داخل ProductsPage — تبدیل FilterState به تراشه‌ها با کمک facets:
// const chips = createMemo<ActiveFilterChip[]>(() => {
//   const v = currentFilters();
//   const f = facets();
//   const out: ActiveFilterChip[] = [];

//   // دسته‌ها و برندها: مقدار خام → برچسب خوانا از روی facets
//   for (const val of v.categories ?? []) {
//     const opt = f.categories?.find((o) => o.value === val);
//     out.push({ id: `category:${val}`, groupLabel: "دسته", label: opt?.label ?? val });
//   }
//   for (const val of v.brands ?? []) {
//     const opt = f.brands?.find((o) => o.value === val);
//     out.push({ id: `brand:${val}`, groupLabel: "برند", label: opt?.label ?? val });
//   }

//   // قیمت: یک تراشه‌ی واحد
//   if (v.price) {
//     out.push({
//       id: "price",
//       groupLabel: "قیمت",
//       label: `${v.price.min.toLocaleString("fa-IR")} تا ${v.price.max.toLocaleString("fa-IR")} تومان`,
//     });
//   }

//   // امتیاز
//   if (v.minRating) {
//     out.push({ id: "minRating", groupLabel: "امتیاز", label: `${v.minRating.toLocaleString("fa-IR")} ستاره و بالاتر` });
//   }

//   // فقط موجود
//   if (v.inStockOnly) {
//     out.push({ id: "inStockOnly", label: "فقط کالاهای موجود" });
//   }

//   return out;
// });

// // و حذف بر اساس id:
// const removeChip = (id: string) => {
//   const v = { ...currentFilters() };
//   if (id.startsWith("category:")) {
//     const val = id.slice("category:".length);
//     v.categories = (v.categories ?? []).filter((x) => x !== val) || undefined;
//     if (!v.categories?.length) v.categories = undefined;
//   } else if (id.startsWith("brand:")) {
//     const val = id.slice("brand:".length);
//     v.brands = (v.brands ?? []).filter((x) => x !== val);
//     if (!v.brands?.length) v.brands = undefined;
//   } else if (id === "price") {
//     v.price = undefined;
//   } else if (id === "minRating") {
//     v.minRating = undefined;
//   } else if (id === "inStockOnly") {
//     v.inStockOnly = undefined;
//   }
//   applyFilters(v); // در URL می‌نشیند
// };

// // در JSX:
// <ActiveFilters items={chips()} onRemove={removeChip} onClearAll={clearFilters} />



// این هم components/products/ActiveFilters.tsx — همان «تراشه‌های فیلتر فعال» (filter chips) که چند پیام قبل پیشنهادش را داده بودم. این نوار بالای شبکه‌ی محصولات می‌نشیند و هر فیلترِ انتخاب‌شده را به‌صورت یک تراشه با دکمه‌ی حذف (×) نشان می‌دهد، به‌علاوه‌ی یک «پاک‌کردن همه». نقش اصلی‌اش کشف‌پذیری است: کاربر بدون بازکردن پنل فیلتر می‌بیند چه چیزی اعمال شده و می‌تواند تک‌تک بردارد.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// کاملاً کنترل‌شده و بدون منطق داخلی از خودش: این Component نمی‌داند برچسبِ خوانا برای هر مقدار چیست (مثلاً mineral → «آب معدنی»). به همین دلیل لیستِ آماده‌ی تراشه‌ها (items) را از بیرون می‌گیرد، چون فقط والد (که به facets دسترسی دارد) می‌تواند مقدارِ خام را به برچسبِ خوانا نگاشت کند. این تصمیم مهم را پایین توضیح دادم.
// هر تراشه یک onRemove دارد که همان تکه‌ی FilterState را حذف می‌کند؛ و یک onClearAll کلی.
// هماهنگ با ProductFilters/URL: حذف هر تراشه در نهایت onChange همان فیلترها را می‌زند و در query می‌نشیند.


// نکات مهم:

// مهم‌ترین تصمیم — «نگاشت مقدار→برچسب کجاست؟»: عمداً این Component را گنگ (dumb) نگه داشتم و تراشه‌های آماده را از بیرون گرفتم. دلیل: تبدیل brand: "damavand" به «دماوند»، یا فرمت‌کردن بازه‌ی قیمت، به facets و منطق فرمت نیاز دارد که در والد است. اگر این تبدیل را داخل این Component می‌بردم، مجبور بود facets و formatPrice را هم بگیرد و به ProductFilters گره می‌خورد. جداکردنش این Component را کوچک، خالص و قابل‌تست نگه می‌دارد. اما یک هزینه دارد: آن تابع نگاشت باید یک‌جا نوشته شود (بالا نمونه‌اش را دادم). اگر ترجیح می‌دهی این منطق داخل خود Component باشد (نسخه‌ی «باهوش» که FilterState + FilterFacets می‌گیرد)، بگو تا آن نسخه را بدهم — ولی آن‌وقت این Component دیگر مستقل از دامنه نیست.
// هماهنگی id بین chips و removeChip: قرارداد id (مثل brand:damavand) باید بین سازنده‌ی تراشه و حذف‌کننده یکی باشد. چون هر دو در والد نوشته می‌شوند مشکلی نیست، ولی حواست باشد این قرارداد را جای دیگری نشکنی. یک ظرافت: تراشه‌ی «قیمت» یک واحد است (نه دو تراشه‌ی از/تا) تا حذفش کل بازه را بردارد؛ اگر می‌خواهی از/تا جدا حذف شوند، بگو.
// A11y:
// ناحیه role="region" با aria-label="فیلترهای فعال" تا صفحه‌خوان آن را به‌عنوان یک بخش مشخص بشناسد.
// مهم‌ترین نکته: دکمه‌ی حذف aria-label کامل و گویا دارد («حذف فیلتر برند دماوند»)، نه فقط «✕»؛ وگرنه صفحه‌خوان ده‌تا دکمه‌ی «✕» بی‌تفاوت می‌خواند.
// ✕ تزئینی و aria-hidden است.
// پیشنهاد تکمیلی (اختیاری): چون حذف تراشه باعث تغییر نتایج می‌شود، خوب است این ناحیه یا شمارنده‌ی نتایج aria-live="polite" داشته باشد تا تغییر اعلام شود — که ما شمارنده‌ی زنده را در ProductsHeader گذاشتیم، پس این‌جا لازم نیست دوباره.
// قرارگیری (مهم برای هماهنگی): جای طبیعی این نوار بالای ProductGrid و زیر ProductsHeader است. در ProductsPage بین این دو بنشانش. روی موبایل هم چون فیلترها در Drawerاند، این تراشه‌ها تنها بازخورد دیداریِ همیشه‌مرئیِ «چه فیلتری فعال است» هستند؛ برای موبایل ارزش بیشتری دارند.
// مدل حذف = همان مدل اعمال: حذف تراشه بلافاصله applyFilters می‌زند (فوری، هماهنگ با تصمیم فعلیِ on-change). اگر بعداً مدل «اعمال با دکمه» را برای موبایل انتخاب کنیم، باید تصمیم بگیریم آیا حذف تراشه هم فوری باشد یا به state موقت برود؛ فعلاً فوری منطقی‌تر است چون تراشه‌ها بیرونِ پنل‌اند.
// بدون inline style و کاملاً BEM؛ نکات CSS: active-filters__list را display: flex; flex-wrap: wrap; gap کن؛ هر __chip را با display: inline-flex; align-items: center; gap و یک border-radius بزرگ (قرص‌مانند)؛ دکمه‌ی __remove هدف لمسی کافی داشته باشد؛ active-filters__item--clear را کمی جدا کن (مثلاً margin-inline-start: auto)؛ از خاصیت‌های منطقی برای RTL استفاده کن.