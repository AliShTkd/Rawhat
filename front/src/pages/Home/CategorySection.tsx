// CategorySection.tsx
import { Show, For, type Component } from "solid-js";

export interface CategoryImage {
  src: string;
  alt: string;
}

export interface CategoryItem {
  id: string | number;
  name: string;
  href: string;
  image?: CategoryImage;
  productCount?: number;
}

export interface CategorySectionProps {
  title?: string;
  categories: CategoryItem[];
}

const CategorySection: Component<CategorySectionProps> = (props) => {
  return (
    <section class="category" aria-labelledby="category-title">
      <div class="category__container">
        <Show when={props.title}>
          <h2 id="category-title" class="category__title">
            {props.title}
          </h2>
        </Show>

        <Show
          when={props.categories.length > 0}
          fallback={
            <p class="category__empty">دسته‌بندی‌ای برای نمایش وجود ندارد.</p>
          }
        >
          <ul class="category__list">
            <For each={props.categories}>
              {(category) => (
                <li class="category__item">
                  <a class="category__link" href={category.href}>
                    <Show when={category.image}>
                      {(image) => (
                        <span class="category__media">
                          <img
                            class="category__image"
                            src={image().src}
                            alt={image().alt}
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                      )}
                    </Show>

                    <span class="category__name">{category.name}</span>

                    <Show when={category.productCount !== undefined}>
                      <span class="category__count">
                        {category.productCount} محصول
                      </span>
                    </Show>
                  </a>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </section>
  );
};

export default CategorySection;




// <CategorySection
//   title="خرید بر اساس دسته‌بندی"
//   categories={[
//     {
//       id: 1,
//       name: "پروتئین وی",
//       href: "/category/whey-protein",
//       image: { src: "/images/cat-whey.webp", alt: "انواع پروتئین وی" },
//       productCount: 42,
//     },
//     {
//       id: 2,
//       name: "کراتین",
//       href: "/category/creatine",
//       image: { src: "/images/cat-creatine.webp", alt: "مکمل کراتین" },
//       productCount: 18,
//     },
//   ]}
// />


// این هم CategorySection که دسته‌بندی‌های محصولات را نمایش می‌دهد. مطابق رویه‌ی قبلی، کاملاً prop-driven و مستقل ساختمش تا محتوا hard-code نشود.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// لیست دسته‌بندی‌ها از طریق Props می‌آید (هر دسته: نام، تصویر با alt، و لینک).
// هر دسته یک لینک ناوبری (<a>) است. اگر Component جداگانه‌ای به نام CategoryCard داری، من آن را نمی‌سازم؛ فقط نامش را اعلام می‌کنم تا خودت جایگزین کنی.
// یک title اختیاری برای عنوان بخش وجود دارد و با aria-labelledby به بخش وصل شده است.
// تصویر دسته‌بندی اختیاری است؛ اگر بود، alt اجباری است.
// بدون inline style و کاملاً با BEM؛ چیدمان گرید/responsive را در CSS با همین کلاس‌ها پیاده کن (مثلاً category__list را grid کن تا در موبایل ستون‌ها کم شوند).
// Accessibility: از ساختار معنایی <ul>/<li> برای لیست دسته‌ها، <h2> برای عنوان بخش، و alt اجباری روی تصویر استفاده شده. کل کارت یک لینک واقعی <a> است تا با کیبورد قابل فوکوس و کلیک باشد.
// امنیتی: هیچ محتوایی با innerHTML رندر نمی‌شود؛ همه‌چیز امن به‌صورت متن درج شده. مقدار productCount صرفاً برای نمایش است و نباید منبع حقیقت شمرده شود؛ اعتبار واقعی موجودی/تعداد باید در Backend باشد.
// دو نکته که ممکن است بخواهی مشخص کنی:

// اگر می‌خواهی به‌جای <a> از Component اختصاصی CategoryCard استفاده کنم، بگو تا فقط ساختار Section را نگه دارم و رندر هر آیتم را به آن بسپارم.
// اگر داده‌ها قرار است از API بیایند (loading/error state)، بگو تا نسخه‌ای با در نظر گرفتن این حالت‌ها طراحی کنم؛ فعلاً طبق قوانین، چیزی درباره‌ی API حدس نزدم. 🙂