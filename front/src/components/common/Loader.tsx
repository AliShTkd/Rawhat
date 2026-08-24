// @ts-nocheck

// Loader.tsx
import { Show, type Component } from "solid-js";

type LoaderSize = "sm" | "md" | "lg";

export interface LoaderProps {
  size?: LoaderSize;
  label?: string;
  hideLabel?: boolean;
  overlay?: boolean;
  fullscreen?: boolean;
}

const Loader: Component<LoaderProps> = (props) => {
  return (
    <div
      class="loader"
      classList={{
        "loader--sm": props.size === "sm",
        "loader--md": (props.size ?? "md") === "md",
        "loader--lg": props.size === "lg",
        "loader--overlay": props.overlay === true,
        "loader--fullscreen": props.fullscreen === true,
      }}
      role="status"
      aria-live="polite"
    >
      <span class="loader__spinner" aria-hidden="true" />

      <span
        class="loader__label"
        classList={{ "loader__label--hidden": props.hideLabel === true }}
      >
        {props.label ?? "در حال بارگذاری..."}
      </span>
    </div>
  );
};

export default Loader;






// // ساده (inline)
// <Loader />

// // اندازه‌ی بزرگ با متن مخفی (فقط برای screen reader)
// <Loader size="lg" hideLabel />

// // پوشش کل ناحیه هنگام بارگذاری (مثلاً روی یک بخش)
// <div class="section" style="position: relative">
//   <Loader overlay />
// </div>

// // حالت تمام‌صفحه
// <Show when={isLoading()}>
//   <Loader fullscreen label="در حال بارگذاری محصولات..." />
// </Show>


// این هم Loader، یک Component ساده و پرکاربرد برای نمایش وضعیت بارگذاری (spinner). عمداً ساده و سبک نگه‌اش داشتم، اما نکات A11y مربوط به اعلام وضعیت بارگذاری را رعایت کردم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// خود spinner صرفاً بصری است (با CSS ساخته می‌شود)، و وضعیت بارگذاری با role="status" و متن قابل‌دسترس به screen reader اعلام می‌شود.
// یک حالت fullscreen/overlay اختیاری برای پوشاندن کل ناحیه هنگام بارگذاری گذاشتم.
// size و label قابل تنظیم‌اند. label پیش‌فرض «در حال بارگذاری...» است.
// انیمیشن چرخش کاملاً در CSS پیاده می‌شود (بدون inline style).

// نکات مهم:

// Accessibility:
// ظرف با role="status" و aria-live="polite" است تا screen reader شروع بارگذاری را اعلام کند بدون اینکه مزاحم شود.
// خود spinner با aria-hidden="true" از دید screen reader پنهان است (چون صرفاً بصری است) و متن loader__label معنا را می‌رساند.
// اگر متن را با hideLabel بصری پنهان می‌کنی، در CSS آن را با الگوی visually-hidden پیاده کن (نه display:none) تا برای screen reader باقی بماند.
// بدون inline style و کاملاً BEM:
// انیمیشن چرخش را در CSS با @keyframes روی loader__spinner بساز.
// loader--overlay را position: absolute; inset: 0 با پس‌زمینه‌ی نیمه‌شفاف کن (والدش باید position: relative باشد).
// loader--fullscreen را position: fixed; inset: 0 با z-index مناسب کن.
// پیشنهاد A11y مهم: در CSS یک @media (prefers-reduced-motion: reduce) بگذار تا برای کاربرانی که حرکت کمتر می‌خواهند، چرخش کند/متوقف شود.
// امنیتی: بدون innerHTML؛ صرفاً نمایش امن متن و یک عنصر بصری.
// نکته‌ی هماهنگی با بقیه‌ی پروژه: قبلاً در Button/IconButton اسپینرِ داخلی جدا (button__spinner/icon-button__spinner) داشتیم که مخصوص حالت loading دکمه بود. این Loader برای بارگذاری بخش‌ها/صفحات/داده است. اگر بخواهی، می‌توانم اسپینر دکمه‌ها را هم به همین Loader (مثلاً <Loader size="sm" hideLabel />) یکدست کنم؛ ولی طبق اصل سادگی، فعلاً جداست تا دکمه‌ها سبک بمانند.

// اگر به‌جای spinner چرخشی، Skeleton loader (برای کارت‌ها/لیست محصولات) می‌خواهی، بگو تا یک Component جدا مثل Skeleton با همین سبک بسازم؛ برای صفحات محصول تجربه‌ی بهتری می‌دهد. 🙂