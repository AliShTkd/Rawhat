// Price.tsx
import { Show, createMemo, type Component } from "solid-js";

export interface PriceProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  showDiscountPercent?: boolean;
  formatPrice?: (value: number, currency?: string) => string;
  srCurrentLabel?: string;
  srOriginalLabel?: string;
}

const Price: Component<PriceProps> = (props) => {
  const hasDiscount = createMemo(
    () =>
      props.originalPrice !== undefined &&
      props.originalPrice > props.price
  );

  const discountPercent = createMemo(() => {
    if (!hasDiscount()) return 0;
    const original = props.originalPrice as number;
    return Math.round(((original - props.price) / original) * 100);
  });

  const format = (value: number) =>
    props.formatPrice
      ? props.formatPrice(value, props.currency)
      : `${value.toLocaleString("fa-IR")} ${props.currency ?? "تومان"}`;

  return (
    <div class="price">
      <span class="price__current">
        <span class="price__sr-only">{props.srCurrentLabel ?? "قیمت"}</span>
        {format(props.price)}
      </span>

      <Show when={hasDiscount()}>
        <span class="price__original">
          <span class="price__sr-only">
            {props.srOriginalLabel ?? "قیمت پیش از تخفیف"}
          </span>
          {format(props.originalPrice as number)}
        </span>

        <Show when={props.showDiscountPercent}>
          <span class="price__discount">{discountPercent()}%</span>
        </Show>
      </Show>
    </div>
  );
};

export default Price;







// // قیمت ساده
// <Price price={3200000} />

// // با تخفیف و درصد
// <Price
//   price={3200000}
//   originalPrice={3800000}
//   showDiscountPercent
// />

// // با فرمت‌دهی سفارشی پروژه
// <Price
//   price={3200000}
//   originalPrice={3800000}
//   showDiscountPercent
//   formatPrice={(v, c) => formatMoney(v, c)}
// />


// این هم Price، یک Component نمایشی مستقل برای نمایش قیمت — با پشتیبانی از قیمت اصلی خط‌خورده و درصد تخفیف. قبلاً در ProductCard بخش قیمت را inline نوشتیم؛ این Component آن را یکدست و قابل‌استفاده‌ی مجدد می‌کند.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// ورودی قیمت‌ها عدد است (نه رشته‌ی از پیش فرمت‌شده)، و فرمت‌دهی به‌صورت اختیاری با formatPrice از بیرون کنترل می‌شود تا واحد پول/جداکننده‌ها یکجا در پروژه مدیریت شود و اینجا حدس نزنم.
// اگر originalPrice بزرگ‌تر از price باشد، حالت تخفیف فعال می‌شود (خط‌خورده + درصد اختیاری).
// نمایش درصد تخفیف با showDiscountPercent کنترل می‌شود.
// امنیتی/معماری (مهم): این Component فقط نمایشی است. قیمت و تخفیف نباید Source of Truth باشند؛ محاسبه و اعتبارسنجی واقعی قیمت/تخفیف باید در Backend و در زمان افزودن به سبد/پرداخت انجام شود. درصد تخفیف اینجا فقط برای نمایش محاسبه می‌شود


// نکات مهم:

// بدون inline style و کاملاً BEM؛ قیمت خط‌خورده (price__original با text-decoration: line-through و رنگ کم‌رنگ‌تر)، برجسته‌کردن price__current، و ظاهر بج درصد (price__discount) را در CSS با همین کلاس‌ها بساز.
// A11y: کلاس price__sr-only باید در CSS با الگوی visually-hidden پیاده شود (بصری پنهان، برای screen reader فعال — با position:absolute; width:1px; height:1px; clip-path: inset(50%); overflow:hidden; نه display:none). این باعث می‌شود screen reader «قیمت ... / قیمت پیش از تخفیف ...» را گویا بخواند و کاربر قیمت خط‌خورده را با قیمت فعلی اشتباه نگیرد.
// نکته: چون price__original قیمت قدیمی است، بهتر است در نظر داشته باشی که خط‌خوردگی صرفاً بصری است؛ همان srOriginalLabel معنا را برای screen reader می‌رساند. اگر بخواهی می‌توانم آن را داخل <del> معنایی هم بگذارم؛ بگو تا تغییر دهم.
// امنیتی: بدون innerHTML؛ همه‌چیز متن امن. درصد تخفیف فقط نمایشی است و نباید مبنای محاسبه‌ی واقعی مبلغ قابل پرداخت قرار گیرد.
// toLocaleString("fa-IR"): به‌عنوان پیش‌فرض منطقی برای اعداد فارسی گذاشتم؛ اگر واحد پول/زبان پروژه فرق دارد، از formatPrice استفاده کن تا رفتار یکدست شود.
// نکته‌ی یکدست‌سازی: حالا که Price آماده شد، می‌توانیم بخش قیمتِ ProductCard (product-card__pricing/__price/__original-price) را با همین Price جایگزین کنیم تا محاسبه‌ی تخفیف و ظاهر قیمت در کل پروژه یکجا مدیریت شود. اگر بخواهی، ProductCard را برای استفاده از Price به‌روزرسانی می‌کنم.

// اگر می‌خواهی Price مقدار صرفه‌جویی (مثلاً «۶۰۰٬۰۰۰ تومان تخفیف») را هم به‌جای درصد (یا کنارش) نشان دهد، بگو تا یک المان و کلاس برایش اضافه کنم. 