
// ProductSpecifications.tsx
import {
  Show,
  For,
  createUniqueId,
  type Component,
} from "solid-js";

export interface SpecItem {
  label: string;
  value: string;
}

export interface SpecGroup {
  title: string;
  items: SpecItem[];
}

export interface ProductSpecificationsProps {
  title?: string;
  items?: SpecItem[];
  groups?: SpecGroup[];
}

const SpecList: Component<{ items: SpecItem[] }> = (props) => (
  <dl class="product-specs__list">
    <For each={props.items}>
      {(item) => (
        <div class="product-specs__row">
          <dt class="product-specs__label">{item.label}</dt>
          <dd class="product-specs__value">{item.value}</dd>
        </div>
      )}
    </For>
  </dl>
);

const ProductSpecifications: Component<ProductSpecificationsProps> = (props) => {
  const titleId = createUniqueId();

  const hasGroups = () => props.groups !== undefined && props.groups.length > 0;
  const hasFlat = () => props.items !== undefined && props.items.length > 0;

  return (
    <Show when={hasGroups() || hasFlat()}>
      <section class="product-specs" aria-labelledby={titleId}>
        <h2 class="product-specs__title" id={titleId}>
          {props.title ?? "مشخصات فنی"}
        </h2>

        {/* حالت گروه‌بندی‌شده */}
        <Show when={hasGroups()}>
          <For each={props.groups}>
            {(group) => (
              <div class="product-specs__group">
                <h3 class="product-specs__group-title">{group.title}</h3>
                <SpecList items={group.items} />
              </div>
            )}
          </For>
        </Show>

        {/* حالت تخت */}
        <Show when={!hasGroups() && hasFlat()}>
          <SpecList items={props.items as SpecItem[]} />
        </Show>
      </section>
    </Show>
  );
};

export default ProductSpecifications;


















// // حالت ساده (تخت)
// <ProductSpecifications
//   items={[
//     { label: "وزن", value: "۲۲۷۰ گرم" },
//     { label: "طعم", value: "شکلاتی" },
//     { label: "تعداد سروینگ", value: "۷۴" },
//     { label: "کشور سازنده", value: "آمریکا" },
//   ]}
// />

// // حالت گروه‌بندی‌شده
// <ProductSpecifications
//   groups={[
//     {
//       title: "مشخصات کلی",
//       items: [
//         { label: "برند", value: "Optimum Nutrition" },
//         { label: "وزن", value: "۲۲۷۰ گرم" },
//       ],
//     },
//     {
//       title: "اطلاعات تغذیه‌ای (هر سروینگ)",
//       items: [
//         { label: "پروتئین", value: "۲۴ گرم" },
//         { label: "کالری", value: "۱۲۰" },
//       ],
//     },
//   ]}
// />




// این هم ProductSpecifications، برای نمایش جدول مشخصات فنی محصول (وزن، طعم، تعداد سروینگ، کشور سازنده و...). این یکی بیشتر معنایی/ساختاری است تا تعاملی، پس تمرکز اصلی روی انتخاب درست عنصر HTML برای دسترس‌پذیری است.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// داده به‌صورت آرایه‌ای از جفت‌های «برچسب/مقدار» می‌آید (label/value).
// ساختار معنایی را با <dl> (description list) پیاده کردم، چون این‌ها ذاتاً جفت‌های «نام ویژگی ← مقدار» هستند، نه یک جدول دوبعدی واقعی با سطر و ستون. (در ادامه توضیح می‌دهم چرا <dl> بهتر از <table> است.)
// امکان گروه‌بندی اختیاری (مثل «مشخصات کلی»، «اطلاعات تغذیه‌ای») با prop groups — اگر گروه ندهی، حالت تخت (flat) با items کار می‌کند.





// نکات مهم:

// چرا <dl> و نه <table>؟ (تصمیم معنایی مهم)
// مشخصات محصول مجموعه‌ای از جفت‌های «نام ویژگی ← مقدار» است؛ این دقیقاً کاربرد <dl> (description list) با <dt> (term) و <dd> (description) است.
// <table> برای داده‌ی دوبعدی واقعی (سطر × ستون با سرستون‌های معنادار در هر دو محور) مناسب است، مثل مقایسه‌ی چند محصول. برای «برچسب/مقدار» تک‌ستونی، <table> معنای اضافه و بار A11y بی‌مورد می‌آورد.
// اگر بعداً مقایسه‌ی چند محصول خواستی (چند ستون)، آن یک Component جدا (ProductComparison) با <table> واقعی و <th scope="col/row"> است؛ بگو تا بسازم.
// نکته‌ی ساختاری <dl>: هر جفت را داخل یک <div class="product-specs__row"> گذاشتم. این کار مجاز و استاندارد است (از HTML5 به بعد، <div> به‌عنوان wrapper دور گروه dt/dd معتبر است) و چیدمان دوستونی (grid) را خیلی ساده‌تر می‌کند.
// Accessibility:
// <section> با aria-labelledby به عنوان وصل شده تا ناحیه معنادار باشد.
// سلسله‌مراتب heading رعایت شد: بخش <h2>، عنوان هر گروه <h3>. فرض بر این است که در صفحه‌ی محصول این زیرِ <h1> نام محصول قرار می‌گیرد. اگر جای دیگری استفاده می‌کنی، بگو تا سطح heading را قابل‌تنظیم کنم.
// امنیتی: بدون innerHTML؛ همه‌ی مقادیر به‌صورت متن امن رندر می‌شوند. label/value را از داده‌ی قابل‌اعتماد بده؛ چون متن ساده‌اند ریسک XSS ندارند (برخلاف ProductDescription که HTML داشت).
// بدون inline style و کاملاً BEM؛ چیدمان دوستونی هر ردیف (product-specs__row با display: grid; grid-template-columns)، خطوط جداکننده‌ی بین ردیف‌ها (border-block-end — از خاصیت منطقی برای RTL استفاده کن)، رنگ کم‌رنگ‌تر برچسب نسبت به مقدار، و راه‌راه‌کردن یک‌درمیان (zebra) در صورت تمایل را در CSS با همین کلاس‌ها بساز.
// قدم بعدی پیشنهادی برای کامل‌کردن صفحه‌ی محصول:

// ProductTabs با الگوی کامل tab/tabpanel که ProductDescription، همین ProductSpecifications و بخش دیدگاه‌ها را کنار هم بگذارد (با roving tabindex و aria-controls، مشابه بندانگشتی‌های ProductGallery).
// یا شروع بخش دیدگاه‌ها: یک ReviewList + ReviewItem (با Rating نمایشی) و سپس ReviewForm (با Rating تعاملی برای ثبت امتیاز).