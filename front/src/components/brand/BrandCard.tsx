

// BrandCard.tsx
import { Show, type Component } from "solid-js";

export interface BrandItem {
  id: string | number;
  name: string;
  logoSrc: string;
  href?: string;
}

export interface BrandCardProps {
  brand: BrandItem;
}

const BrandCard: Component<BrandCardProps> = (props) => {
  const brand = () => props.brand;

  return (
    <Show
      when={brand().href}
      fallback={
        <div class="brand-card">
          <span class="brand-card__media">
            <img
              class="brand-card__logo"
              src={brand().logoSrc}
              alt={brand().name}
              loading="lazy"
              decoding="async"
            />
          </span>
        </div>
      }
    >
      <a class="brand-card brand-card--link" href={brand().href}>
        <span class="brand-card__media">
          <img
            class="brand-card__logo"
            src={brand().logoSrc}
            alt={brand().name}
            loading="lazy"
            decoding="async"
          />
        </span>
      </a>
    </Show>
  );
};

export default BrandCard;







// <BrandCard
//   brand={{
//     id: 1,
//     name: "Optimum Nutrition",
//     logoSrc: "/images/brands/on.webp",
//     href: "/brands/optimum-nutrition",
//   }}
// />


// این هم BrandCard، کارت مستقل برای نمایش یک برند. در BrandsSection قبلاً رندر هر برند را inline نوشته بودیم؛ حالا با این کارت مستقل می‌توانی رندر هر آیتم را به آن بسپاری.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// برای سازگاری با BrandsSection، همان مدل BrandItem را اینجا تعریف و export می‌کنم (نام، لوگو، لینک اختیاری). اگر می‌خواهی این Type از یک فایل مشترک بیاید، بگو تا import کنم به‌جای تعریف مجدد.
// اگر برند href داشته باشد، لوگو داخل یک لینک <a> رندر می‌شود؛ در غیر این صورت فقط تصویر نمایش داده می‌شود (بدون لینک، تا هدف فوکوس بی‌مورد ساخته نشود).
// Accessibility: alt لوگو برابر نام برند است، چون لوگو در اینجا اطلاعات معنادار دارد.



// نکات مهم:

// سازگاری با BrandsSection: اگر می‌خواهی این کارت را داخل BrandsSection استفاده کنی، باید رندر inline فعلی آن Section را با <BrandCard brand={brand} /> جایگزین کنم و Type مشترک BrandItem را یکجا نگه داریم تا دوباره تعریف نشود. بگو تا BrandsSection را برای این کار به‌روز کنم (تغییر کوچکی است).
// چرا حالت بدون لینک <div> است؟ اگر برند لینک نداشته باشد، ساختن <a> بی‌هدف یا با href="#" از نظر Accessibility بد است؛ پس در آن حالت یک ظرف ساده‌ی غیرتعاملی می‌سازیم.
// Accessibility: لوگوهای دارای لینک با <a> واقعی قابل فوکوس و کلیک با کیبوردند؛ alt برابر نام برند تنظیم شده است.
// بدون inline style و کاملاً BEM؛ افکت‌هایی مثل grayscale→رنگی در هاور، اندازه‌ی یکسان لوگوها، و responsive بودن را در CSS با همین کلاس‌ها بساز. برای هماهنگی رنگی/خاکستری بین حالت لینک‌دار و بدون‌لینک، از کلاس پایه‌ی brand-card استفاده کن.
// اگر می‌خواهی این کارت یک حالت با نام برند به‌صورت متن زیر لوگو (نه فقط alt) داشته باشد، یا variantهای بصری مختلف، بگو تا اضافه کنم. 🙂