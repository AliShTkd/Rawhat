// NewArrivalsSection.tsx
import { Show, For, type Component } from "solid-js";
// این Component را من نمی‌سازم؛ باید جداگانه بسازی.
import ProductCard, { type Product } from "./ProductCard";

export interface NewArrivalsSectionProps {
  title?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  showNewBadge?: boolean;
  newBadgeLabel?: string;
}

const NewArrivalsSection: Component<NewArrivalsSectionProps> = (props) => {
  return (
    <section class="new-arrivals" aria-labelledby="new-arrivals-title">
      <div class="new-arrivals__container">
        <div class="new-arrivals__header">
          <Show when={props.title}>
            <h2 id="new-arrivals-title" class="new-arrivals__title">
              {props.title}
            </h2>
          </Show>

          <Show when={props.viewAllHref}>
            <a class="new-arrivals__view-all" href={props.viewAllHref}>
              {props.viewAllLabel ?? "مشاهده همه"}
            </a>
          </Show>
        </div>

        <Show
          when={props.products.length > 0}
          fallback={
            <p class="new-arrivals__empty">محصولی برای نمایش وجود ندارد.</p>
          }
        >
          <ul class="new-arrivals__list">
            <For each={props.products}>
              {(product) => (
                <li class="new-arrivals__item">
                  <Show when={props.showNewBadge}>
                    <span class="new-arrivals__badge">
                      {props.newBadgeLabel ?? "جدید"}
                    </span>
                  </Show>
                  <ProductCard product={product} />
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </section>
  );
};

export default NewArrivalsSection;













// <NewArrivalsSection
//   title="جدیدترین محصولات"
//   viewAllHref="/products?sort=newest"
//   showNewBadge
//   products={newProducts} // آرایه‌ای از Product از سطح بالاتر
// />




// این هم NewArrivalsSection برای نمایش «جدیدترین محصولات». ساختار مشابه بخش‌های محصولی قبلی است اما مستقل و با namespace جدای BEM (new-arrivals) تا استایل‌ها تداخل نکنند.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// لیست محصولات جدید از Props می‌آید.
// رندر هر کارت به Component جداگانه‌ی ProductCard سپرده می‌شود (نمی‌سازمش؛ فقط استفاده می‌کنم). همان Product قبلی.
// title اختیاری و لینک اختیاری «مشاهده همه» دارد.
// اختیاری: امکان نمایش نشان «جدید» روی هر آیتم (showNewBadge) گذاشتم، چون در این بخش معمول است. پیش‌فرض خاموش است.
// امنیتی: «جدید بودن» و ترتیب نمایش صرفاً نمایشی‌اند و نباید Source of Truth باشند؛ اعتبارسنجی واقعی در Backend.

// Component موردنیاز: ProductCard (و Type Product). ساخته نشد؛ فقط استفاده شد.
// بدود inline style و کاملاً BEM؛ چیدمان گرید/اسکرول افقی و responsive را با همین کلاس‌ها در CSS پیاده کن. برای موقعیت‌دهی new-arrivals__badge روی کارت، new-arrivals__item را در CSS position: relative کن و بج را absolute.
// Accessibility: عنوان <h2> با aria-labelledby، و لیست معنایی <ul>/<li>. بج «جدید» یک متن واقعی است و برای screen reader هم خوانده می‌شود (اگر می‌خواهی صرفاً بصری باشد، بگو تا aria-hidden کنم).
// امنیتی: بدون منطق قیمت/موجودی و بدون innerHTML؛ فقط نمایش امن.
// نکته‌ی تکرارشونده که خوب است در سطح پروژه تصمیم بگیری: چون این بخش‌ها ممکن است در یک صفحه کنار هم بیایند و همه id ثابت برای عنوان دارند، اگر بخواهی می‌توانم در همه‌ی Sectionها id را با createUniqueId یکتا کنم تا از تکرار id جلوگیری شود. بگو تا یکدست اعمالش کنم.