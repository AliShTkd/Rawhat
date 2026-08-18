// BestSellersSection.tsx
import { Show, For, type Component } from "solid-js";
// این Component را من نمی‌سازم؛ باید جداگانه بسازی.
import ProductCard, { type Product } from "./ProductCard";

export interface BestSellersSectionProps {
  title?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  showRank?: boolean;
}

const BestSellersSection: Component<BestSellersSectionProps> = (props) => {
  return (
    <section class="bestsellers" aria-labelledby="bestsellers-title">
      <div class="bestsellers__container">
        <div class="bestsellers__header">
          <Show when={props.title}>
            <h2 id="bestsellers-title" class="bestsellers__title">
              {props.title}
            </h2>
          </Show>

          <Show when={props.viewAllHref}>
            <a class="bestsellers__view-all" href={props.viewAllHref}>
              {props.viewAllLabel ?? "مشاهده همه"}
            </a>
          </Show>
        </div>

        <Show
          when={props.products.length > 0}
          fallback={
            <p class="bestsellers__empty">محصولی برای نمایش وجود ندارد.</p>
          }
        >
          <ol class="bestsellers__list">
            <For each={props.products}>
              {(product, index) => (
                <li class="bestsellers__item">
                  <Show when={props.showRank}>
                    <span class="bestsellers__rank" aria-hidden="true">
                      {index() + 1}
                    </span>
                  </Show>
                  <ProductCard product={product} />
                </li>
              )}
            </For>
          </ol>
        </Show>
      </div>
    </section>
  );
};

export default BestSellersSection;



// <BestSellersSection
//   title="پرفروش‌ترین‌ها"
//   viewAllHref="/products?sort=best-selling"
//   showRank
//   products={bestSellingProducts} // آرایه‌ای از Product از سطح بالاتر
// />


// این هم BestSellersSection برای نمایش پرفروش‌ترین محصولات. ساختار آن به FeaturedProductsSection نزدیک است اما مستقل و با namespace جدای BEM (bestsellers) نوشته شده تا استایل‌ها با هم تداخل نداشته باشند.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// لیست محصولات پرفروش از طریق Props می‌آید.
// رندر هر کارت به Component جداگانه‌ی ProductCard سپرده می‌شود (طبق قانون نمی‌سازمش؛ فقط استفاده می‌کنم). همان Product قبلی استفاده می‌شود.
// یک title اختیاری و لینک اختیاری «مشاهده همه» دارد.
// اختیاری: امکان نمایش رتبه/شماره‌ی پرفروش (showRank) اضافه کردم، چون در بخش «پرفروش‌ها» معمول است. اگر نمی‌خواهی، فقط آن را پاس نده (پیش‌فرض خاموش است).
// امنیتی: ترتیب پرفروش‌ها و قیمت/موجودی فقط برای نمایش‌اند و نباید Source of Truth باشند؛ اعتبارسنجی واقعی باید در Backend انجام شود.

// نکات مهم:

// Component موردنیاز: ProductCard (و Type Product). ساخته نشد؛ فقط استفاده شد.
// چرا <ol> به‌جای <ul>؟ چون «پرفروش‌ها» ذاتاً یک ترتیب معنادار دارند؛ لیست مرتب (<ol>) از نظر Accessibility دقیق‌تر است. اگر ترتیب برایت معنادار نیست، بگو تا به <ul> تغییر دهم.
// بدون inline style و کاملاً BEM؛ چیدمان گرید/اسکرول افقی و responsive را در CSS با همین کلاس‌ها پیاده کن.
// Accessibility: عنوان با <h2> و اتصال aria-labelledby؛ شماره‌ی رتبه با aria-hidden="true" مخفی از screen reader است تا ترتیب <ol> دوباره‌کاری اعلام نشود.
// امنیتی: بدون منطق قیمت/تخفیف/موجودی و بدون innerHTML؛ این موارد در ProductCard (نمایش) و Backend (اعتبارسنجی) مدیریت می‌شوند.
// اگر خواستی این بخش مستقیماً از API داده بگیرد (loading/error/skeleton) یا مدل واقعی Product را داری، بفرست تا دقیق هماهنگ کنم. 🙂