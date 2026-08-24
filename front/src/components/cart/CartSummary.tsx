
// CartSummary.tsx
import { Show, type Component } from "solid-js";
import Price from "../common/Price";
import Button from "../common/Button";

export interface CartSummaryProps {
  subtotal: number;
  total: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  freeShipping?: boolean;
  currency?: string;
  itemCount?: number;
  formatPrice?: (value: number, currency?: string) => string;
  checkoutLabel?: string;
  checkoutHref?: string;
  onCheckout?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const CartSummary: Component<CartSummaryProps> = (props) => {
  const format = (value: number) =>
    props.formatPrice
      ? props.formatPrice(value, props.currency)
      : `${value.toLocaleString("fa-IR")} ${props.currency ?? "تومان"}`;

  const hasDiscount = () =>
    props.discount !== undefined && props.discount > 0;

  return (
    <div class="cart-summary">
      <h2 class="cart-summary__title">خلاصه سفارش</h2>

      <dl class="cart-summary__rows">
        <div class="cart-summary__row">
          <dt class="cart-summary__label">
            جمع کل
            <Show when={props.itemCount !== undefined}>
              <span class="cart-summary__count">
                {" "}({props.itemCount} کالا)
              </span>
            </Show>
          </dt>
          <dd class="cart-summary__value">{format(props.subtotal)}</dd>
        </div>

        <Show when={hasDiscount()}>
          <div class="cart-summary__row cart-summary__row--discount">
            <dt class="cart-summary__label">تخفیف</dt>
            <dd class="cart-summary__value cart-summary__value--discount">
              −{format(props.discount as number)}
            </dd>
          </div>
        </Show>

        <Show when={props.shipping !== undefined || props.freeShipping}>
          <div class="cart-summary__row">
            <dt class="cart-summary__label">هزینه ارسال</dt>
            <dd class="cart-summary__value">
              <Show
                when={!props.freeShipping}
                fallback={
                  <span class="cart-summary__free">رایگان</span>
                }
              >
                {format(props.shipping as number)}
              </Show>
            </dd>
          </div>
        </Show>

        <Show when={props.tax !== undefined}>
          <div class="cart-summary__row">
            <dt class="cart-summary__label">مالیات</dt>
            <dd class="cart-summary__value">{format(props.tax as number)}</dd>
          </div>
        </Show>

        <div class="cart-summary__row cart-summary__row--total">
          <dt class="cart-summary__label cart-summary__label--total">
            مبلغ قابل پرداخت
          </dt>
          <dd class="cart-summary__value cart-summary__value--total">
            <Price
              price={props.total}
              currency={props.currency}
              formatPrice={props.formatPrice}
            />
          </dd>
        </div>
      </dl>

      <div class="cart-summary__action">
        <Button
          variant="primary"
          block
          href={props.checkoutHref}
          loading={props.loading}
          disabled={props.disabled}
          onClick={props.checkoutHref ? undefined : () => props.onCheckout?.()}
        >
          {props.checkoutLabel ?? "ادامه فرآیند خرید"}
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;







// <CartSummary
//   itemCount={3}
//   subtotal={9600000}      // از Backend
//   discount={600000}       // از Backend
//   freeShipping            // یا shipping={45000}
//   total={9000000}         // مبلغ نهایی از Backend، نه محاسبه‌ی Frontend
//   onCheckout={() => goToCheckout()}
// />

// // حالت لینک به صفحه‌ی پرداخت
// <CartSummary
//   subtotal={9600000}
//   total={9000000}
//   checkoutHref="/checkout"
// />

// این هم CartSummary، برای نمایش خلاصه‌ی سبد خرید (جمع کل، تخفیف، هزینه‌ی ارسال، مبلغ نهایی و دکمه‌ی ادامه‌ی خرید). این تکمیل‌کننده‌ی CartItem است و از Price و Button که قبلاً ساختیم استفاده می‌کند.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// مقادیر پول به‌صورت عدد از بیرون (از Backend) می‌آیند و این Component فقط نمایش‌شان می‌دهد. جمع/تخفیف/ارسال را اینجا محاسبه نمی‌کنم چون این‌ها باید در سرور محاسبه شوند.
// «ادامه‌ی خرید/پرداخت» با callback onCheckout یا لینک checkoutHref به بیرون سپرده می‌شود.
// ردیف‌های اختیاری: discount (تخفیف)، shipping (ارسال — با پشتیبانی از حالت «رایگان»)، tax (مالیات). اگر مقدار داده نشود، ردیفش نمایش داده نمی‌شود.
// امنیتی/معماری (بسیار مهم): تمام مبالغ، تخفیف‌ها و مبلغ نهایی قابل پرداخت باید در Backend محاسبه و اعتبارسنجی شوند. این Component صرفاً نمایشی است؛ هیچ محاسبه‌ی مالی‌ای که مبنای پرداخت باشد اینجا انجام نمی‌شود. کد تخفیف هم فقط به بیرون پاس داده می‌شود و اعتبارش در سرور بررسی می‌شود.

// نکات مهم:

// امنیتی (مهم‌ترین نکته‌ی این Component):
// همه‌ی مبالغ فقط نمایش داده می‌شوند و از Backend می‌آیند. هیچ محاسبه‌ی مالی مبنای پرداخت اینجا انجام نمی‌شود (حتی subtotal - discount + shipping). دلیل: کاربر می‌تواند داده‌ی Frontend را دستکاری کند؛ پس مبلغ نهایی باید در سرور در زمان checkout دوباره محاسبه و تأیید شود.
// اگر ورودی کد تخفیف داری، اعتبارسنجی و اعمالش باید سمت سرور باشد؛ Frontend فقط کد را ارسال و نتیجه‌ی محاسبه‌شده‌ی سرور را نمایش می‌دهد.
// بدون innerHTML.
// استفاده‌ی مجدد: برای مبلغ نهایی از Price و برای دکمه از Button (با block تمام‌عرض) که قبلاً ساختیم استفاده شد تا ظاهر و رفتار یکدست بماند. توجه: در Button، وقتی href داده شود به <a> تبدیل می‌شود؛ برای همین onClick را فقط در حالت بدون href وصل کردم تا تداخل رفتار ناوبری/عمل پیش نیاید.
// Accessibility:
// از ساختار معنایی <dl>/<dt>/<dd> برای جفت‌های «برچسب/مقدار» استفاده شد که برای این نوع خلاصه‌ی مالی مناسب است.
// عنوان بخش <h2> است (سازگار با سلسله‌مراتب صفحه‌ی سبد). اگر ساختار heading صفحه‌ات فرق دارد، بگو تا قابل‌تنظیم کنم.
// تخفیف با علامت − نمایش داده می‌شود؛ اگر می‌خواهی برای screen reader گویاتر باشد (مثلاً «۶۰۰٬۰۰۰ تومان تخفیف»)، می‌توانم یک متن visually-hidden اضافه کنم.
// بدون inline style و کاملاً BEM؛ چیدمان ردیف‌ها (برچسب چپ/راست، مقدار طرف مقابل با justify-content: space-between)، تأکید روی ردیف مبلغ نهایی (--total)، رنگ سبز برای «رایگان»/تخفیف، و حالت چسبان (sticky) در دسکتاپ را در CSS با همین کلاس‌ها بساز.
// اگر بخواهی، قدم بعدی می‌تواند یک CouponInput (ورودی کد تخفیف با حالت‌های اعمال‌شده/نامعتبر/در حال بررسی) باشد که کنار همین CartSummary بنشیند — با تأکید بر اینکه اعتبارسنجی واقعی کد در سرور انجام می‌شود. یا می‌توانیم کل صفحه‌ی سبد خرید را با کنار هم گذاشتن CartItem + CartSummary + EmptyState (برای سبد خالی) مونتاژ کنیم. بگو کدام را ادامه دهم. 🙂