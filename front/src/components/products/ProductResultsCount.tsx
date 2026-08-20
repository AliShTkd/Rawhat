
// components/products/ProductResultsCount.tsx
import {
  Show,
  type Component,
} from "solid-js";

export interface ProductResultsCountProps {
  /** تعداد کل نتایج (پس از فیلتر) */
  total?: number;
  loading?: boolean;

  /** برای متن «نمایش X تا Y از Z» (اختیاری) */
  rangeStart?: number;
  rangeEnd?: number;

  /** پنهان‌کردن بصری، ولی فعال برای صفحه‌خوان */
  visuallyHidden?: boolean;
  /** خاموش‌کردن اعلان زنده (اگر جای دیگری این کار انجام می‌شود) */
  silent?: boolean;
}

const faNum = (n: number) => n.toLocaleString("fa-IR");

const ProductResultsCount: Component<ProductResultsCountProps> = (props) => {
  const hasRange = () =>
    props.rangeStart != null &&
    props.rangeEnd != null &&
    (props.total ?? 0) > 0;

  const message = () => {
    if (props.loading) return "در حال بارگذاری نتایج…";
    const total = props.total ?? 0;
    if (total === 0) return "نتیجه‌ای یافت نشد";
    if (hasRange()) {
      return `نمایش ${faNum(props.rangeStart!)} تا ${faNum(
        props.rangeEnd!
      )} از ${faNum(total)} محصول`;
    }
    return `${faNum(total)} محصول`;
  };

  return (
    <p
      class="product-results-count"
      classList={{
        "product-results-count--hidden": props.visuallyHidden,
        "product-results-count--loading": props.loading,
      }}
      // ناحیه‌ی زنده: تغییر متن به‌آرامی اعلام می‌شود
      aria-live={props.silent ? undefined : "polite"}
      aria-atomic="true"
    >
      <Show when={props.loading} fallback={<span>{message()}</span>}>
        <span class="product-results-count__spinner" aria-hidden="true" />
        <span>{message()}</span>
      </Show>
    </p>
  );
};

export default ProductResultsCount;














// // حالت معمول: کنار عنوان در ProductsHeader
// <ProductResultsCount total={props.totalCount} loading={props.loading} />

// // با بازه‌ی صفحه‌بندی: «نمایش ۱ تا ۱۲ از ۲۴۰ محصول»
// <ProductResultsCount
//   total={props.totalCount}
//   rangeStart={(currentPage() - 1) * pageSize() + 1}
//   rangeEnd={Math.min(currentPage() * pageSize(), props.totalCount)}
//   loading={props.loading}
// />

// // نسخه‌ی «فقط برای صفحه‌خوان» (اگر جایی عدد را بصری جای دیگر نشان می‌دهی)
// <ProductResultsCount total={props.totalCount} loading={props.loading} visuallyHidden />


// این هم components/products/ProductResultsCount.tsx — همان شمارنده‌ی نتایج که در چند پیام قبل چند بار به آن اشاره کردم («شمارندهٔ aria-live در ProductsHeader»). حالا وقتش رسید به یک Component مستقل تبدیلش کنم، چون هم ProductsHeader به آن نیاز دارد و هم منطقِ اعلانِ زندهٔ تغییر نتایج جای واحدی می‌خواهد تا در چند جا تکرار و ناسازگار نشود.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// نمایشیِ محض و کنترل‌شده: عدد نهایی را prop می‌گیرد و خودش چیزی نمی‌شمارد. منبع حقیقت (total از سرور) در ProductsPage است.
// مسئولِ اعلانِ aria-live برای صفحه‌خوان است. این همان تکه‌ای است که در ProductGrid/ProductsHeader عمداً خالی گذاشتم تا این‌جا متمرکز شود (تا دو aria-live هم‌زمان حرف نزنند).
// هم حالت loading («در حال بارگذاری…») و هم حالت صفر نتیجه را می‌شناسد تا اعلانش کامل باشد.



// نکات مهم:

// مسئلهٔ «یک aria-live واحد» (مهم‌ترین نکتهٔ هماهنگی): در پیام‌های قبل، هم در ProductGrid (حالت loading) و هم این‌جا از اعلان صحبت شد. قانون طلایی: در کل صفحهٔ لیست فقط یک ناحیهٔ aria-live برای وضعیت نتایج داشته باش. این Component همان یک ناحیه است. برای همین یک prop silent گذاشتم: اگر به هر دلیل جای دیگری (مثلاً یک live-region سراسری) این را اعلام می‌کند، این‌جا با silent خاموشش کن تا دوبار اعلام نشود (تجربهٔ آزارندهٔ صفحه‌خوان). پیش‌فرض این است که این تنها ناحیه است.
// چرا aria-atomic="true": می‌خواهیم کل جملهٔ «۲۴۰ محصول» یک‌جا خوانده شود، نه فقط بخشِ تغییرکرده. بدون این، بعضی صفحه‌خوان‌ها ممکن است فقط عدد را بخوانند و بی‌معنی شود.
// polite نه assertive: تغییر تعداد نتایج مهم است ولی اضطراری نیست؛ assertive حرف کاربر را قطع می‌کند و آزارنده است. polite صبر می‌کند تا صفحه‌خوان مکث کند. این انتخاب عمدی و درست است.
// loading هم اعلام می‌شود: چون ProductGrid در حالت loading کلاً aria-hidden است (اسکلت خوانده نمی‌شود)، اگر این‌جا هم «در حال بارگذاری…» را نگوییم، کاربر صفحه‌خوان یک لحظه در سکوت می‌ماند و نمی‌داند چیزی در حال آمدن است. برای همین حالت loading این‌جا عمداً اعلام می‌شود — این دقیقاً همان مکملی است که در ProductGrid قول دادم.
// یک ملاحظهٔ ظریف اعلان‌های پیاپی: اگر کاربر سریع فیلترها را عوض کند، متن مدام «در حال بارگذاری…» → «۲۴۰ محصول» می‌شود و ممکن است چند اعلان پشت‌سرهم صف شود. polite معمولاً این را مدیریت می‌کند (آخرین را می‌خواند)، ولی اگر آزاردهنده شد، می‌توان اعلان را debounce کرد (مثلاً فقط وضعیت نهایی بعد از ۳۰۰ms اعلام شود). فعلاً over-engineering است؛ اگر در تست واقعی مزاحم بود، بگو تا نسخهٔ debounced را بدهم.
// قرارگیری و رابطه با ProductsHeader: جای طبیعی‌اش داخل ProductsHeader (نزدیک h1) است. یعنی ProductsHeader باید total/loading را بگیرد و این را رندر کند — که با تصمیم قبلی‌مان (شمارندهٔ زنده در Header) یکی است. اگر ترجیح می‌دهی مستقیم در ProductsPage بالای ProductGrid بنشیند هم اشکالی ندارد؛ فقط در یک جا باشد.
// فرمت عدد فارسی: با toLocaleString("fa-IR") اعداد فارسی می‌شوند. اگر بعداً i18n چندزبانه شد، این تابع باید از locale جاری تغذیه شود؛ فعلاً fa-IR هاردکد است که با بقیهٔ اجزا هماهنگ است.
// بدون inline style و کاملاً BEM؛ نکات CSS:
// product-results-count--hidden را با الگوی استاندارد visually-hidden بساز (نه display:none)، وگرنه aria-live در بعضی صفحه‌خوان‌ها اعلام نمی‌شود.
// product-results-count__spinner یک اسپینر کوچک با @keyframes بچرخان و prefers-reduced-motion را احترام بگذار (به‌جای چرخش، مثلاً محو/ظاهر).
// از خاصیت‌های منطقی برای فاصله‌گذاری در RTL استفاده کن.