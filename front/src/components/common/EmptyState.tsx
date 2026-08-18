
// EmptyState.tsx
import { Show, type Component, type JSX } from "solid-js";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: JSX.Element;
  action?: JSX.Element;
}

const EmptyState: Component<EmptyStateProps> = (props) => {
  return (
    <div class="empty-state" role="status">
      <Show when={props.icon}>
        <div class="empty-state__icon" aria-hidden="true">
          {props.icon}
        </div>
      </Show>

      <div class="empty-state__content">
        <h2 class="empty-state__title">{props.title}</h2>

        <Show when={props.description}>
          <p class="empty-state__description">{props.description}</p>
        </Show>
      </div>

      <Show when={props.action}>
        <div class="empty-state__action">{props.action}</div>
      </Show>
    </div>
  );
};

export default EmptyState;













// // سبد خرید خالی
// <EmptyState
//   icon={<CartIcon />}
//   title="سبد خرید شما خالی است"
//   description="هنوز محصولی به سبد خود اضافه نکرده‌اید."
//   action={
//     <Button href="/products" variant="primary">
//       مشاهده محصولات
//     </Button>
//   }
// />

// // نتیجه‌ی جستجوی بدون نتیجه
// <EmptyState
//   title="نتیجه‌ای یافت نشد"
//   description="برای عبارت جستجوشده محصولی پیدا نکردیم. عبارت دیگری را امتحان کنید."
// />


// این هم EmptyState، برای نمایش حالت‌های «خالی» — مثل سبد خرید خالی، نتیجه‌ی جستجوی بدون نتیجه، لیست علاقه‌مندی‌های خالی، یا خطای «موردی یافت نشد». عمداً ساده و منعطف نگه‌اش داشتم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// محتوا کاملاً از Props می‌آید: یک آیکون/تصویر اختیاری، عنوان، توضیح، و یک اکشن اختیاری (مثل «بازگشت به فروشگاه»).
// برای آیکون یک JSX.Element می‌گیرم (مثل بقیه‌ی primitiveها) تا به کتابخانه‌ی خاصی وابسته نشویم. اگر ترجیح می‌دهی تصویر با src/alt باشد، بگو تا تغییر دهم.
// اکشن را ساده به‌صورت JSX.Element (اسلات) می‌گیرم تا خودت هر چیزی (مثلاً Button یا <a>) داخلش بگذاری و این Component به رفتار دکمه وابسته نشود.
// نکات مهم:

// Accessibility:
// آیکون با aria-hidden="true" (صرفاً تزئینی) و عنوان به‌صورت <h2> واقعی؛ اگر ساختار heading صفحه‌ات فرق دارد (مثلاً این تنها محتوای صفحه است و باید <h1> باشد)، بگو تا سطح heading را قابل‌تنظیم کنم.
// role="status" گذاشتم چون معمولاً EmptyState بعد از یک عملیات (مثل جستجو) به‌صورت پویا ظاهر می‌شود و خوب است به screen reader اعلام شود. اگر این EmptyState محتوای ثابت اولیه‌ی صفحه است (نه نتیجه‌ی یک اکشن)، بهتر است role="status" را حذف کنیم تا اعلام بی‌مورد نشود؛ بگو تا اختیاری‌اش کنم.
// اکشن به‌صورت اسلات: چون action یک JSX.Element است، هم با Button/IconButton که قبلاً ساختیم سازگار است و هم با هر لینک دلخواه؛ این Component خودش رفتار ناوبری/کلیک را مدیریت نمی‌کند (مسئولیت درست، جای درست).
// بدون inline style و کاملاً BEM؛ چیدمان وسط‌چین، فاصله‌ها، اندازه‌ی آیکون و responsive بودن را در CSS با همین کلاس‌ها بساز.
// امنیتی: بدون innerHTML؛ همه‌چیز متن/JSX امن.
// اگر می‌خواهی این Component چند variant داشته باشد (مثلاً empty معمولی در مقابل error برای حالت خطای بارگذاری، با رنگ/آیکون متفاوت)، بگو تا با BEM (empty-state--error) اضافه کنم؛ این‌طوری هم برای «خالی بودن» و هم «خطا» یکدست قابل استفاده می‌شود. 🙂