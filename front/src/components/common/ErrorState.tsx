
// ErrorState.tsx
import { Show, type Component, type JSX } from "solid-js";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: JSX.Element;
  action?: JSX.Element;
  onRetry?: () => void;
  retryLabel?: string;
}

const ErrorState: Component<ErrorStateProps> = (props) => {
  return (
    <div class="error-state" role="alert" aria-live="assertive">
      <Show when={props.icon}>
        <div class="error-state__icon" aria-hidden="true">
          {props.icon}
        </div>
      </Show>

      <div class="error-state__content">
        <h2 class="error-state__title">
          {props.title ?? "مشکلی پیش آمد"}
        </h2>

        <p class="error-state__description">
          {props.description ??
            "در دریافت اطلاعات خطایی رخ داد. لطفاً دوباره تلاش کنید."}
        </p>
      </div>

      <Show when={props.onRetry || props.action}>
        <div class="error-state__actions">
          <Show when={props.onRetry}>
            <button
              class="error-state__retry"
              type="button"
              onClick={() => props.onRetry?.()}
            >
              {props.retryLabel ?? "تلاش دوباره"}
            </button>
          </Show>

          <Show when={props.action}>
            <div class="error-state__extra-action">{props.action}</div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default ErrorState;










// // خطای بارگذاری با تلاش دوباره
// <ErrorState
//   title="بارگذاری محصولات ناموفق بود"
//   description="ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید."
//   onRetry={() => refetchProducts()}
// />

// // خطا با اکشن دلخواه علاوه بر retry
// <ErrorState
//   onRetry={() => refetch()}
//   action={
//     <Button href="/support" variant="ghost">
//       تماس با پشتیبانی
//     </Button>
//   }
// />

// این هم ErrorState، برای نمایش حالت‌های خطا — مثل خطای بارگذاری داده، قطع ارتباط با سرور، خطای ۵۰۰، یا شکست در واکشی محصولات. ساختار آن نزدیک به EmptyState است اما با تمرکز روی خطا و امکان تلاش دوباره (retry) و A11y مناسب خطا.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// محتوا از Props می‌آید: آیکون اختیاری، عنوان، توضیح، و یک اکشن اختیاری (اسلات JSX.Element) و/یا یک دکمه‌ی تلاش دوباره با callback onRetry.
// مهم امنیتی: پیام خطای فنی خام (مثل stack trace یا پیام مستقیم سرور) نباید به کاربر نشان داده شود. این Component فقط متن قابل‌فهم و امنی که شما می‌دهید را نمایش می‌دهد؛ جزئیات فنی باید در لاگ سمت سرور بماند، نه UI.
// role="alert" گذاشتم (به‌جای status در EmptyState) چون خطا معمولاً باید فوری‌تر به کاربر screen reader اعلام شود.

// نکات مهم:

// Accessibility:
// role="alert" + aria-live="assertive" تا خطا فوراً به screen reader اعلام شود (برخلاف EmptyState که status/polite بود). اگر این ErrorState به‌صورت محتوای ثابت صفحه (مثل صفحه‌ی 500 اختصاصی) استفاده می‌شود و نه نتیجه‌ی یک اکشن پویا، بهتر است alert/assertive را حذف کنیم تا اعلام مزاحم نشود؛ بگو تا اختیاری‌اش کنم.
// آیکون aria-hidden (تزئینی) و عنوان <h2> واقعی. اگر این تنها محتوای صفحه است و باید <h1> باشد، بگو تا سطح heading را قابل‌تنظیم کنم.
// دکمه‌ی retry یک <button type="button"> واقعی و قابل فوکوس با کیبورد است.
// امنیتی (مهم):
// هرگز پیام خام خطا/‏stack trace/‏پاسخ داخلی سرور را مستقیم به کاربر نده. فقط متن امن و کاربرپسندی که خودت تعیین می‌کنی نمایش داده می‌شود؛ جزئیات فنی را در لاگ سمت سرور نگه‌دار.
// بدون innerHTML؛ همه‌چیز متن/JSX امن.
// بدون inline style و کاملاً BEM؛ چیدمان وسط‌چین، رنگ‌بندی خطا (مثلاً تأکید ملایم قرمز روی آیکون/عنوان)، و responsive بودن را در CSS با همین کلاس‌ها بساز.
// retry به‌صورت داخلی ساده: دکمه‌ی تلاش دوباره فقط onRetry را صدا می‌زند؛ منطق واقعی refetch/backoff را بیرون مدیریت کن. اگر می‌خواهی از حملات/فشار ناخواسته جلوگیری شود، در لایه‌ی داده debounce/throttle روی retry بگذار.
// نکته‌ی هماهنگی: این ErrorState عمداً هم onRetry (دکمه‌ی داخلی آماده) و هم action (اسلات دلخواه) دارد تا هم سریع قابل استفاده باشد و هم منعطف. اگر می‌خواهی به‌جای دکمه‌ی داخلی، retry هم از طریق Buttonای که ساختیم رندر شود تا ظاهر کاملاً یکدست شود، بگو تا آن را با اسلات جایگزین کنم. 🙂

// اگر بخواهی، می‌توانم در کنار این‌ها یک Skeleton (برای حالت loading کارت‌ها/لیست‌ها) هم بسازم تا سه‌گانه‌ی رایج «loading / empty / error» در پروژه‌ات کامل شود. 🙂







