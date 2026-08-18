// Badge.tsx
import { Show, type Component, type JSX } from "solid-js";

type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "sale"
  | "danger";

type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  srLabel?: string;
  children: JSX.Element;
}

const Badge: Component<BadgeProps> = (props) => {
  return (
    <span
      class="badge"
      classList={{
        "badge--neutral": (props.variant ?? "neutral") === "neutral",
        "badge--primary": props.variant === "primary",
        "badge--success": props.variant === "success",
        "badge--sale": props.variant === "sale",
        "badge--danger": props.variant === "danger",
        "badge--sm": props.size === "sm",
        "badge--md": (props.size ?? "md") === "md",
      }}
    >
      <span class="badge__content">{props.children}</span>

      <Show when={props.srLabel}>
        <span class="badge__sr-only">{props.srLabel}</span>
      </Show>
    </span>
  );
};

export default Badge;







// نکات مهم:

// بدون inline style و کاملاً BEM؛ رنگ/اندازه‌ی هر variant/size و شکل بج (گرد، pill، و...) را در CSS با همین کلاس‌ها بساز.
// A11y (مهم): کلاس badge__sr-only باید در CSS با الگوی visually-hidden پیاده شود (بصری پنهان، برای screen reader فعال) — یعنی با position:absolute; width:1px; height:1px; clip-path: inset(50%); overflow:hidden; نه با display:none. اگر بخواهی، همین CSS استاندارد را برایت می‌نویسم.
// بج صرفاً بصری: اگر بج فقط تزئینی است و اطلاعاتش جای دیگری هم منتقل می‌شود، می‌توانی از srLabel استفاده نکنی؛ اما اگر بج تنها حامل اطلاعات است (مثل عدد سبد خرید)، حتماً srLabel گویا بده.
// امنیتی: محتوای بج به‌صورت JSX/متن امن رندر می‌شود؛ بدون innerHTML.
// نکته‌ی یکدست‌سازی: حالا که Badge آماده شد، می‌توانیم بج‌های خامِ داخل ProductCard (product-card__badge--new/--sale) و NewArrivalsSection (new-arrivals__badge) را با همین Badge جایگزین کنیم تا کل پروژه یک زبان بصری واحد داشته باشد. اگر بخواهی، آن دو Component را برای استفاده از Badge به‌روزرسانی می‌کنم. 🙂


// <Badge variant="sale">تخفیف</Badge>

// <Badge variant="success">جدید</Badge>

// <Badge variant="danger">ناموجود</Badge>

// // عددی با توضیح برای screen reader
// <Badge variant="primary" srLabel="۳ مورد در سبد خرید">
//   ۳
// </Badge>

// این هم Badge، یک primitive کوچک و پرکاربرد برای نمایش نشان‌هایی مثل «جدید»، «تخفیف»، «ناموجود»، تعداد و... . قبلاً در ProductCard/NewArrivalsSection بج‌ها را به‌صورت <span> خام نوشتیم؛ این Component آن را یکدست و قابل‌استفاده‌ی مجدد می‌کند.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// محتوای بج از children می‌آید (متن یا عدد یا حتی آیکون به‌صورت JSX.Element).
// variant و size ساده برای استایل‌دهی با CSS گذاشتم؛ منطق ظاهری کامل در CSS است.
// عمداً ساده نگه‌اش داشتم (یک primitive نمایشی، نه تعاملی).
// A11y: بج معمولاً تزئینی/تکمیلی است. یک prop اختیاری srLabel گذاشتم تا اگر متن بج به‌تنهایی برای screen reader گویا نیست (مثلاً فقط یک عدد)، بتوانی توضیح متنی بدهی.