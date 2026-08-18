// IconButton.tsx
import { Show, splitProps, type Component, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

type IconButtonVariant = "solid" | "ghost" | "outline";
type IconButtonSize = "sm" | "md" | "lg";

interface BaseIconButtonProps {
  label: string;
  icon: JSX.Element;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
}

interface AnchorIconButtonProps
  extends BaseIconButtonProps,
    JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

interface NativeIconButtonProps
  extends BaseIconButtonProps,
    JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
}

export type IconButtonProps = AnchorIconButtonProps | NativeIconButtonProps;

const IconButton: Component<IconButtonProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "label",
    "icon",
    "variant",
    "size",
    "loading",
    "href",
    "class",
  ]);

  const isLink = () => local.href !== undefined;
  const isDisabled = () =>
    local.loading === true || (rest as NativeIconButtonProps).disabled === true;

  return (
    <Dynamic
      component={isLink() ? "a" : "button"}
      href={isLink() ? local.href : undefined}
      type={
        isLink() ? undefined : (rest as NativeIconButtonProps).type ?? "button"
      }
      aria-label={local.label}
      aria-disabled={isLink() && isDisabled() ? "true" : undefined}
      tabindex={isLink() && isDisabled() ? -1 : undefined}
      disabled={!isLink() ? isDisabled() : undefined}
      aria-busy={local.loading ? "true" : undefined}
      class="icon-button"
      classList={{
        "icon-button--solid": (local.variant ?? "solid") === "solid",
        "icon-button--ghost": local.variant === "ghost",
        "icon-button--outline": local.variant === "outline",
        "icon-button--sm": local.size === "sm",
        "icon-button--md": (local.size ?? "md") === "md",
        "icon-button--lg": local.size === "lg",
        "icon-button--loading": local.loading === true,
        [String(local.class ?? "")]: Boolean(local.class),
      }}
      {...rest}
    >
      <Show
        when={!local.loading}
        fallback={<span class="icon-button__spinner" aria-hidden="true" />}
      >
        <span class="icon-button__icon" aria-hidden="true">
          {local.icon}
        </span>
      </Show>
    </Dynamic>
  );
};

export default IconButton;












// // دکمه‌ی عمل (مثلاً افزودن به علاقه‌مندی‌ها)
// <IconButton
//   label="افزودن به علاقه‌مندی‌ها"
//   icon={<HeartIcon />}
//   variant="ghost"
//   onClick={() => toggleWishlist(id)}
// />

// // دکمه‌ی لینک (مثلاً رفتن به سبد خرید)
// <IconButton
//   label="سبد خرید"
//   icon={<CartIcon />}
//   href="/cart"
// />


// این هم IconButton، یک primitive برای دکمه‌هایی که فقط آیکون دارند (بدون متن مرئی) — مثل «افزودن به علاقه‌مندی‌ها»، «بستن»، «باز کردن منو»، «سبد خرید». چون متن مرئی ندارد، مهم‌ترین نکته‌اش Accessibility است و آن را جدی گرفتم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// آیکون به‌صورت JSX.Element از بیرون می‌آید (SVG یا Component آیکون)، تا به کتابخانه‌ی خاصی وابسته نشویم و امن بماند (بدون innerHTML).
// label اجباری است و به‌عنوان aria-label استفاده می‌شود، چون دکمه متن مرئی ندارد. این را در Type اجباری کردم تا از ساخت دکمه‌ی نامفهوم برای screen reader جلوگیری شود.
// مثل Button، اگر href بدهی به <a> تبدیل می‌شود؛ در غیر این صورت <button>.
// variant و size ساده برای استایل CSS.

// نکات مهم:

// Accessibility (مهم‌ترین بخش):
// چون متن مرئی ندارد، label اجباری است و به aria-label می‌رود؛ آیکون داخل aria-hidden است تا screen reader فقط برچسب گویا را بخواند.
// عمل‌ها <button type="button"> و ناوبری‌ها <a href> می‌شوند (رفتار کیبورد/screen reader درست).
// حالت loading: روی <button> از disabled بومی استفاده می‌شود؛ برای <a> از aria-disabled و tabindex={-1} (چون لینک disabled بومی ندارد). aria-busy هم برای اعلام وضعیت ست می‌شود.
// نکته‌ی مهم اندازه: برای تعامل لمسی، ناحیه‌ی کلیک را در CSS حداقل حدود ۴۴×۴۴ پیکسل بگیر (مخصوصاً --sm) تا روی موبایل قابل‌استفاده باشد.
// امنیتی: آیکون به‌صورت JSX.Element امن رندر می‌شود؛ بدون innerHTML. اگر لینک خارجی با target="_blank" می‌سازی، rel="noopener noreferrer" را از طریق {...rest} پاس بده (یا بگو تا خودکارش کنم).
// بدون inline style و کاملاً BEM؛ شکل دایره‌ای/مربعی، اندازه‌ها، حالت hover/focus، و اسپینر (icon-button__spinner با انیمیشن CSS) را در CSS بساز.
// نکته‌ی یکدست‌سازی با Button: این IconButton عمداً همان الگوی Dynamic/splitProps/loading را مثل Button دارد تا رفتار در کل پروژه یکسان باشد. اگر بخواهی، می‌توانم بعداً منطق مشترک (تبدیل link/button و مدیریت disabled) را در یک helper مشترک استخراج کنم تا تکرار کم شود؛ ولی طبق قانون «ساده نگه‌داشتن»، فعلاً هر کدام مستقل‌اند.
