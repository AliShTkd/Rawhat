// @ts-nocheck


// Button.tsx
import { Show, splitProps, type Component, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  leadingIcon?: JSX.Element;
  trailingIcon?: JSX.Element;
  children: JSX.Element;
}

interface AnchorButtonProps
  extends BaseButtonProps,
    JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

interface NativeButtonProps
  extends BaseButtonProps,
    JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
}

export type ButtonProps = AnchorButtonProps | NativeButtonProps;

const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "variant",
    "size",
    "loading",
    "block",
    "leadingIcon",
    "trailingIcon",
    "children",
    "href",
    "class",
  ]);

  const isLink = () => local.href !== undefined;
  const isDisabled = () =>
    local.loading === true || (rest as NativeButtonProps).disabled === true;

  return (
    <Dynamic
      component={isLink() ? "a" : "button"}
      href={isLink() ? local.href : undefined}
      type={isLink() ? undefined : (rest as NativeButtonProps).type ?? "button"}
      // برای لینک: اگر غیرفعال است، فوکوس‌پذیری را حذف و به AT اعلام می‌کنیم
      aria-disabled={isLink() && isDisabled() ? "true" : undefined}
      tabindex={isLink() && isDisabled() ? -1 : undefined}
      // برای دکمه: از ویژگی بومی disabled استفاده می‌کنیم
      disabled={!isLink() ? isDisabled() : undefined}
      aria-busy={local.loading ? "true" : undefined}
      class="button"
      classList={{
        "button--primary": (local.variant ?? "primary") === "primary",
        "button--secondary": local.variant === "secondary",
        "button--ghost": local.variant === "ghost",
        "button--danger": local.variant === "danger",
        "button--sm": local.size === "sm",
        "button--md": (local.size ?? "md") === "md",
        "button--lg": local.size === "lg",
        "button--block": local.block === true,
        "button--loading": local.loading === true,
        [String(local.class ?? "")]: Boolean(local.class),
      }}
      {...rest}
    >
      <Show when={local.loading}>
        <span class="button__spinner" aria-hidden="true" />
      </Show>

      <Show when={local.leadingIcon && !local.loading}>
        <span class="button__icon button__icon--leading" aria-hidden="true">
          {local.leadingIcon}
        </span>
      </Show>

      <span class="button__label">{local.children}</span>

      <Show when={local.trailingIcon}>
        <span class="button__icon button__icon--trailing" aria-hidden="true">
          {local.trailingIcon}
        </span>
      </Show>
    </Dynamic>
  );
};

export default Button;










// // دکمه‌ی عمل (مثلاً افزودن به سبد)
// <Button variant="primary" onClick={() => addToCart(id)}>
//   افزودن به سبد
// </Button>

// // دکمه‌ی لینک (ناوبری)
// <Button variant="secondary" href="/products">
//   مشاهده محصولات
// </Button>

// // حالت در حال بارگذاری
// <Button variant="primary" loading>
//   در حال ارسال...
// </Button>

// این هم Button، یک primitive پایه و پرکاربرد. چون در چند بخش قبلی (مثل Hero و بنرها) به «Component اختصاصی Button» اشاره کردم، این را طوری می‌سازم که هم به‌صورت دکمه‌ی واقعی (<button>) و هم به‌صورت لینک (<a>) کار کند تا در کل پروژه یکدست استفاده شود.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// اگر href پاس داده شود، به‌صورت <a> رندر می‌شود؛ در غیر این صورت <button>. این برای Accessibility درست است (ناوبری = لینک، عمل = دکمه).
// variant و size ساده برای استایل‌دهی با CSS گذاشتم؛ منطق ظاهری کامل در CSS است.
// یک حالت loading اختیاری دارد که دکمه را غیرفعال و وضعیت را برای screen reader اعلام می‌کند.
// بیش از حد پیچیده‌اش نکردم؛ فقط چیزهایی که یک دکمه‌ی حرفه‌ی قابل استفاده‌ی مجدد لازم دارد.

// نکات مهم:

// چرا Dynamic؟ برای اینکه یک Component واحد بتواند بسته به وجود href بین <a> و <button> سوییچ کند، بدون تکرار کد. این روش رسمی Solid برای رندر پویا از solid-js/web است (Dependency جدید نیست؛ بخشی از خود Solid است).
// Accessibility:
// عمل‌ها <button type="button"> و ناوبری‌ها <a href> می‌شوند تا رفتار کیبورد/screen reader درست باشد.
// حالت loading روی دکمه‌ی بومی از disabled استفاده می‌کند؛ اما چون <a> غیرفعال‌شونده‌ی بومی ندارد، برای لینک از aria-disabled و tabindex={-1} استفاده کردم. توجه: این کار کلیک را ذاتاً متوقف نمی‌کند؛ اگر لینکِ غیرفعال داری که نباید ناوبری کند، بهتر است اصلاً href را نده یا در onClick جلوی رفتار پیش‌فرض را بگیر. اگر بخواهی، می‌توانم این محافظت را داخل Component اضافه کنم.
// aria-busy هنگام loading برای اعلام وضعیت گذاشته شد. اسپینر aria-hidden است (صرفاً بصری).
// امنیتی: اگر این دکمه به‌صورت لینک به مقصد خارجی استفاده شد و target="_blank" دادی، حتماً rel="noopener noreferrer" را هم پاس بده (از طریق همان {...rest} قابل عبور است). اگر می‌خواهی این را خودکار و امن داخل Component مدیریت کنم، بگو تا وقتی target="_blank" بود، rel امن را به‌صورت پیش‌فرض ست کنم.
// بدون inline style و کاملاً BEM؛ ظاهر variantها/sizeها، اسپینر (button__spinner با انیمیشن CSS)، و حالت button--block (تمام‌عرض) را در CSS بساز.
// یک نکته که خوب است در سطح پروژه یکدست کنیم: چون این Button آماده شد، در HeroSection و PromotionalBanner که فعلاً از <a> خام استفاده کرده بودند، می‌توانیم CTAها را با همین Button جایگزین کنیم تا ظاهر و رفتار یکدست شود. اگر بخواهی، آن دو Section را برای استفاده از Button به‌روزرسانی می‌کنم. 🙂