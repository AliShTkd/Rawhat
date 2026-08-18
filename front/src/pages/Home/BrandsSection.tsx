
// BrandsSection.tsx
import { Show, For, type Component } from "solid-js";

export interface BrandItem {
  id: string | number;
  name: string;
  logoSrc: string;
  href?: string;
}

export interface BrandsSectionProps {
  title?: string;
  brands: BrandItem[];
}

const BrandsSection: Component<BrandsSectionProps> = (props) => {
  return (
    <section class="brands" aria-labelledby="brands-title">
      <div class="brands__container">
        <Show when={props.title}>
          <h2 id="brands-title" class="brands__title">
            {props.title}
          </h2>
        </Show>

        <Show
          when={props.brands.length > 0}
          fallback={<p class="brands__empty">برندی برای نمایش وجود ندارد.</p>}
        >
          <ul class="brands__list">
            <For each={props.brands}>
              {(brand) => (
                <li class="brands__item">
                  <Show
                    when={brand.href}
                    fallback={
                      <span class="brands__media">
                        <img
                          class="brands__logo"
                          src={brand.logoSrc}
                          alt={brand.name}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                    }
                  >
                    <a class="brands__link" href={brand.href}>
                      <span class="brands__media">
                        <img
                          class="brands__logo"
                          src={brand.logoSrc}
                          alt={brand.name}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                    </a>
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </section>
  );
};

export default BrandsSection;







// <BrandsSection
//   title="برندهای معتبر"
//   brands={[
//     { id: 1, name: "Optimum Nutrition", logoSrc: "/images/brands/on.webp", href: "/brands/optimum-nutrition" },
//     { id: 2, name: "MyProtein", logoSrc: "/images/brands/myprotein.webp", href: "/brands/myprotein" },
//     { id: 3, name: "Dymatize", logoSrc: "/images/brands/dymatize.webp" },
//   ]}
// />





// این هم BrandsSection برای نمایش برندهای همکار/موجود در فروشگاه (لوگوی برندها). مطابق رویه، prop-driven و مستقل با namespace جدای BEM (brands).

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// لیست برندها از Props می‌آید (هر برند: نام، لوگو با alt، و لینک اختیاری به صفحه‌ی برند).
// اگر برند href داشته باشد، لوگو داخل یک لینک <a> رندر می‌شود؛ در غیر این صورت فقط تصویر نمایش داده می‌شود.
// title اختیاری دارد.
// Accessibility مهم: برای لوگوی برند، alt را برابر نام برند گذاشتم (نه رشته‌ی خالی)، چون لوگو در اینجا اطلاعات معنادار است.




// نکات مهم:

// بدون inline style و کاملاً BEM؛ چیدمان گرید یا اسکرول افقی (کاروسل لوگوها) و responsive را با همین کلاس‌ها در CSS پیاده کن.
// Accessibility: لیست معنایی <ul>/<li>، عنوان <h2> با aria-labelledby، و alt برابر نام برند برای لوگوها. لوگوهای دارای لینک با <a> واقعی قابل فوکوس و کلیک با کیبوردند.
// امنیتی: بدون innerHTML؛ همه‌چیز امن به‌صورت متن/تصویر درج شده.
// یک نکته که ممکن است بخواهی تصمیم بگیری: اگر لوگوها تک‌رنگ (grayscale) باشند و با hover رنگی شوند، این کاملاً در CSS با همین کلاس‌ها قابل انجام است و نیازی به تغییر کد ندارد. اگر می‌خواهی به‌جای گرید، یک کاروسل خودکار باشد (با اسکرول یا انیمیشن)، بگو تا نسخه‌ی مناسب را بسازم؛ فقط توجه کن که کاروسل خودکار باید امکان توقف با hover/focus داشته باشد تا Accessibility حفظ شود. 🙂