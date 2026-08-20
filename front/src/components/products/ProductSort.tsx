

// components/products/ProductSort.tsx
import {
  createUniqueId,
  type Component,
} from "solid-js";
import Select from "../Select";

export interface SortOption {
  value: string;
  label: string;
}

export interface ProductSortProps {
  value: string;
  options?: SortOption[];
  onChange: (value: string) => void;
  /** متن برچسب کنار فیلد */
  label?: string;
  /** برچسب را بصری پنهان کن (فقط برای screen reader) */
  hideLabel?: boolean;
  disabled?: boolean;
}

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "popular", label: "محبوب‌ترین" },
  { value: "rating", label: "بیشترین امتیاز" },
];

const ProductSort: Component<ProductSortProps> = (props) => {
  const labelId = createUniqueId();
  const options = () => props.options ?? DEFAULT_SORT_OPTIONS;
  const labelText = () => props.label ?? "مرتب‌سازی:";

  return (
    <div
      class="product-sort"
      classList={{ "product-sort--label-hidden": props.hideLabel }}
    >
      <span
        class="product-sort__label"
        classList={{ "product-sort__label--visually-hidden": props.hideLabel }}
        id={labelId}
      >
        {labelText()}
      </span>
      <Select
        value={props.value}
        options={options()}
        disabled={props.disabled}
        aria-labelledby={labelId}
        onChange={(v) => props.onChange(v)}
      />
    </div>
  );
};

export default ProductSort;

















// // حالت معمول (نوار بالای لیست)
// <ProductSort value={currentSort()} onChange={changeSort} />

// // داخل Drawer موبایل یا جایی که فضا کم است، برچسب فقط برای screen reader
// <ProductSort value={currentSort()} onChange={changeSort} hideLabel />

// // با گزینه‌های سفارشی
// <ProductSort
//   value={currentSort()}
//   options={[
//     { value: "newest", label: "جدیدترین" },
//     { value: "discount", label: "بیشترین تخفیف" },
//   ]}
//   onChange={changeSort}
// />


// این هم components/products/ProductSort.tsx. این عملاً همان بخش «مرتب‌سازی» است که در ProductsHeader به‌صورت درون‌خطی داشتیم، ولی حالا به یک Component مستقل و کوچک تبدیلش کردم تا هم قابل‌استفاده‌ی مجدد باشد (مثلاً هم در نوار بالا، هم داخل Drawer موبایل) و هم ProductsHeader را سبک‌تر کند.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// این Component کاملاً کنترل‌شده است: مقدار فعلی (value) را می‌گیرد و تغییر را با onChange بالا می‌دهد تا در query/URL بنشیند (هماهنگ با کل صفحه‌ی لیست).
// گزینه‌ها از بیرون می‌آیند ولی یک پیش‌فرض منطقی هم دارد تا سخت‌کد نباشد.
// زیر پوستش یک <label> + Select است (نه یک listbox سفارشی)، تا رفتار کیبورد/فوکوس بومی و درست را رایگان داشته باشیم.



// نکات مهم:

// هم‌پوشانی با ProductsHeader (هماهنگی لازم): الان منطق مرتب‌سازی هم درون ProductsHeader هست و هم این‌جا. برای اینکه دوباره‌کاری و ناسازگاری نداشته باشیم، پیشنهادم این است که ProductsHeader از همین ProductSort استفاده کند (به‌جای اینکه خودش مستقیم Select بسازد). همین‌طور DEFAULT_SORT_OPTIONS را این‌جا export کردم تا یک منبع واحد برای گزینه‌ها باشد و در چند جا تکرار نشود. اگر موافقی، در قدم بعد ProductsHeader را به‌روز می‌کنم تا <ProductSort/> را داخلش بگذارد.
// A11y — نکته‌ی مهم برچسب: به‌جای پیچیدن Select داخل <label>، از aria-labelledby که به id متنِ برچسب اشاره می‌کند استفاده کردم. دلیل: اگر Select تو زیر پوسته یک <div role="combobox"> سفارشی باشد (نه <select> بومی)، پیچاندن در <label> پیوند درستی ایجاد نمی‌کند، اما aria-labelledby همیشه کار می‌کند. اگر Select تو یک <select> بومی است، بگو تا به الگوی ساده‌ترِ <label for> سوییچ کنم.
// حالت hideLabel: برچسب از DOM حذف نمی‌شود (تا پیوند aria-labelledby نشکند)، فقط بصری با تکنیک visually-hidden پنهان می‌شود. پس همیشه یک نام دسترس‌پذیر برای فیلد وجود دارد. کلاس product-sort__label--visually-hidden را در CSS با الگوی استاندارد visually-hidden بساز (نه display:none).
// اعلان تغییر نتایج: خود این Component تغییرِ تعداد نتایج را اعلام نمی‌کند؛ آن مسئولیت جای دیگری است (شمارنده‌ی aria-live در ProductsHeader/ProductsPage). این تفکیک عمدی است تا هر Component یک کار انجام دهد.
// بدون inline style و کاملاً BEM؛ چیدمان افقی برچسب+فیلد (display: inline-flex; gap)، رفتار product-sort--label-hidden در موبایل، و الگوی visually-hidden را در CSS با همین کلاس‌ها بساز. از خاصیت‌های منطقی برای RTL استفاده کن.
// امنیت: بدون innerHTML؛ فقط متن گزینه‌ها رندر می‌شود. مقدار value نمایشی است و اعتبارِ واقعیِ مرتب‌سازی/داده در سرور اعمال می‌شود (سرور نباید به مقدار sort کورکورانه اعتماد کند و باید آن را در برابر یک allowlist اعتبارسنجی کند).
// یک وابستگی واقعی که هنوز باز است: این Component به Select تکیه دارد و من هنوز فرض کرده‌ام Select ساخته شده. اگر Select واقعاً وجود ندارد، بهتر است اول آن را نهایی کنیم (یا با <select> بومی یا با listbox سفارشیِ کامل‌ازنظر-A11y)، وگرنه این Component نیمه‌کاره می‌ماند.

// قدم بعدی پیشنهادی (همان صفحه‌ی لیست که کم‌کم کامل می‌شود):

// نهایی‌کردن Select (اگر هنوز نیست) — چون هم ProductSort و هم ProductFilters احتمالی به آن نیاز دارند.
// Pagination — برای کامل‌شدن عملی ProductsPage.
// Breadcrumb.
// به‌روزرسانی ProductsHeader تا از ProductSort استفاده کند.
// کدام را بسازم؟ پیشنهادم این بار Select است تا زیربنای ProductSort واقعی شود؛ بعد سراغ Pagination برویم.