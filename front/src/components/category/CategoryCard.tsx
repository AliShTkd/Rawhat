// CategoryCard.tsx
import { Show, type Component } from "solid-js";

export interface CategoryCardImage {
  src: string;
  alt: string;
}

export interface CategoryItem {
  id: string | number;
  name: string;
  href: string;
  image?: CategoryCardImage;
  productCount?: number;
}

export interface CategoryCardProps {
  category: CategoryItem;
}

const CategoryCard: Component<CategoryCardProps> = (props) => {
  const category = () => props.category;

  return (
    <a class="category-card" href={category().href}>
      <Show when={category().image}>
        {(image) => (
          <span class="category-card__media">
            <img
              class="category-card__image"
              src={image().src}
              alt={image().alt}
              loading="lazy"
              decoding="async"
            />
          </span>
        )}
      </Show>

      <span class="category-card__body">
        <span class="category-card__name">{category().name}</span>

        <Show when={category().productCount !== undefined}>
          <span class="category-card__count">
            {category().productCount} محصول
          </span>
        </Show>
      </span>
    </a>
  );
};

export default CategoryCard;








// <CategoryCard
//   category={{
//     id: 1,
//     name: "پروتئین وی",
//     href: "/category/whey-protein",
//     image: { src: "/images/cat-whey.webp", alt: "انواع پروتئین وی" },
//     productCount: 42,
//   }}
// />

// این هم CategoryCard که یک کارت مستقل برای نمایش یک دسته‌بندی است. در CategorySection قبلاً رندر آیتم را به‌صورت inline با <a> نوشته بودیم؛ حالا با ساختن این کارت مستقل می‌توانی رندر هر آیتم را به آن بسپاری.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// برای سازگاری با CategorySection، همان مدل CategoryItem را اینجا تعریف و export می‌کنم (نام، لینک، تصویر اختیاری، تعداد محصول اختیاری). اگر می‌خواهی این Type از یک فایل مشترک (مثلاً types.ts) بیاید، بگو تا import کنم به‌جای تعریف مجدد.
// کل کارت یک لینک ناوبری <a> است تا با کیبورد قابل فوکوس/کلیک باشد.
// تصویر اختیاری است و اگر باشد alt اجباری است.
// امنیتی: productCount صرفاً نمایشی است و نباید Source of Truth باشد؛ اعتبار واقعی در Backend.



// نکات مهم:

// سازگاری با CategorySection: اگر می‌خواهی این کارت را داخل CategorySection استفاده کنی، باید رندر inline فعلی آن Section را با <CategoryCard category={category} /> جایگزین کنم و Type مشترک را یکجا نگه داریم تا دوباره تعریف نشود. بگو تا CategorySection را برای این کار به‌روز کنم (تغییر کوچکی است).
// چرا عناصر داخل <a> همه <span> هستند؟ چون یک لینک <a> نباید عناصر block-level معنایی مثل heading داخل خودش بگیرد؛ با <span> و استایل CSS همان ظاهر را می‌سازی و ساختار HTML معتبر می‌ماند. (در CategorySection عنوان بخش با <h2> جداست، پس این کارت‌ها نیازی به heading ندارند.)
// Accessibility: کل کارت یک هدف کلیک واحد و قابل فوکوس با کیبورد است؛ alt تصویر اجباری است و نام دسته به‌صورت متن واقعی خوانده می‌شود.
// بدون inline style و کاملاً BEM؛ چیدمان، هاور، و responsive بودن را در CSS با همین کلاس‌ها بساز.
// اگر می‌خواهی این کارت یک آیکون به‌جای تصویر بگیرد (مثل FeaturesSection که آیکون JSX.Element می‌گرفت) یا حالت‌های بصری مختلف (variant) داشته باشد، بگو تا مطابق همان بسازم