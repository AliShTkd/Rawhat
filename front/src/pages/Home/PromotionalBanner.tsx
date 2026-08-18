// PromotionalBanner.tsx
import { Show, type Component } from "solid-js";

export interface PromotionalBannerImage {
  src: string;
  alt: string;
}

export interface PromotionalBannerAction {
  label: string;
  href?: string;
  onClick?: (event: MouseEvent) => void;
}

export interface PromotionalBannerProps {
  title: string;
  description?: string;
  image?: PromotionalBannerImage;
  action?: PromotionalBannerAction;
  variant?: "primary" | "sale" | "neutral";
}

const PromotionalBanner: Component<PromotionalBannerProps> = (props) => {
  return (
    <section
      class="promo-banner"
      classList={{
        "promo-banner--primary": (props.variant ?? "primary") === "primary",
        "promo-banner--sale": props.variant === "sale",
        "promo-banner--neutral": props.variant === "neutral",
      }}
      aria-labelledby="promo-banner-title"
    >
      <div class="promo-banner__container">
        <Show when={props.image}>
          {(image) => (
            <div class="promo-banner__media">
              <img
                class="promo-banner__image"
                src={image().src}
                alt={image().alt}
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
        </Show>

        <div class="promo-banner__content">
          <h2 id="promo-banner-title" class="promo-banner__title">
            {props.title}
          </h2>

          <Show when={props.description}>
            <p class="promo-banner__description">{props.description}</p>
          </Show>

          <Show when={props.action}>
            {(action) => (
              <a
                class="promo-banner__action"
                href={action().href ?? "#"}
                onClick={action().onClick}
              >
                {action().label}
              </a>
            )}
          </Show>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;






// <PromotionalBanner
//   variant="sale"
//   title="فروش ویژه پروتئین وی"
//   description="تا پایان هفته با ارسال رایگان"
//   image={{ src: "/images/promo-whey.webp", alt: "کمپین تخفیف پروتئین وی" }}
//   action={{ label: "مشاهده پیشنهاد", href: "/campaigns/whey-sale" }}
// />






// این هم PromotionalBanner برای نمایش بنرهای تبلیغاتی/کمپین (مثلاً «تخفیف ویژه» یا معرفی یک کمپین). مطابق رویه، prop-driven و مستقل ساخته شده.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// کل محتوا (عنوان، توضیح، متن دکمه، تصویر) از Props می‌آید.
// یک CTA اختیاری به‌صورت لینک <a> دارد؛ اگر Component اختصاصی Button داری، نمی‌سازمش و فقط نامش را اعلام می‌کنم.
// تصویر اختیاری است و اگر باشد alt اجباری است. یک variant ساده برای تم بصری گذاشتم (مثل primary/sale) تا با CSS استایل بدهی.
// امنیتی مهم: متن تخفیف/کد تخفیف/قیمت داخل بنر فقط نمایشی است. کد تخفیف را نباید به‌عنوان منبع حقیقت اعمال قیمت در Frontend فرض کنی؛ اعتبار و اعمال واقعی آن باید در Backend انجام شود. به همین دلیل من هیچ منطق محاسبه‌ی قیمت اینجا نگذاشتم.


// بدون inline style و کاملاً BEM؛ رنگ/چیدمان هر variant و responsive بودن (تصویر بالای متن در موبایل، کنار هم در دسکتاپ) را در CSS با همین کلاس‌ها پیاده کن.
// Accessibility: از <section aria-labelledby> و <h2> واقعی استفاده شد. اگر این بنر در یک صفحه چند بار استفاده شود، id="promo-banner-title" تکراری می‌شود؛ اگر چند نمونه در یک صفحه داری بگو تا id را قابل‌تنظیم/یکتا کنم (مثلاً با prop یا createUniqueId).
// امنیتی: بدون innerHTML و بدون هیچ منطق قیمت/تخفیف؛ صرفاً نمایش امن متن.
// اگر خواستی این بنر یک شمارش معکوس (countdown timer) برای پایان کمپین داشته باشد، بگو تا نسخه‌ای با آن بسازم — فقط توجه کن که زمان پایان واقعی و اعتبار تخفیف باید از Backend بیاید و تایمر صرفاً نمایشی است. 