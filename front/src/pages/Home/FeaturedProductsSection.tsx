// FeaturedProductsSection.tsx
import { Show, For, type Component } from "solid-js";
// این Component را من نمی‌سازم؛ باید جداگانه بسازی.
import ProductCard, { type Product } from "../../components/product/ProductCard";

export interface FeaturedProductsSectionProps {
  title?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

const FeaturedProductsSection: Component<FeaturedProductsSectionProps> = (
  props
) => {
  return (
    <section class="featured" aria-labelledby="featured-title">
      <div class="featured__container">
        <div class="featured__header">
          <Show when={props.title}>
            <h2 id="featured-title" class="featured__title">
              {props.title}
            </h2>
          </Show>

          <Show when={props.viewAllHref}>
            <a class="featured__view-all" href={props.viewAllHref}>
              {props.viewAllLabel ?? "مشاهده همه"}
            </a>
          </Show>
        </div>

        <Show
          when={props.products.length > 0}
          fallback={
            <p class="featured__empty">محصولی برای نمایش وجود ندارد.</p>
          }
        >
          <ul class="featured__list">
            <For each={props.products}>
              {(product) => (
                <li class="featured__item">
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

export default FeaturedProductsSection;




{/* <FeaturedProductsSection
  title="محصولات منتخب"
  viewAllHref="/products?sort=featured"
  products={featuredProducts} // آرایه‌ای از Product که از سطح بالاتر (مثلاً صفحه) می‌آید
/> */}



// این هم FeaturedProductsSection برای نمایش محصولات منتخب. مطابق رویه‌ی قبلی، prop-driven و مستقل ساخته شده.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// لیست محصولات منتخب از طریق Props می‌آید.
// رندر هر کارت محصول را به Component جداگانه‌ای به نام ProductCard می‌سپارم (طبق قانون، آن را نمی‌سازم؛ فقط نامش را اعلام می‌کنم). این‌طوری منطق نمایش قیمت/تخفیف/سبد خرید داخل خودِ ProductCard می‌ماند و این Section فقط چیدمان و عنوان را مدیریت می‌کند.
// یک title اختیاری و یک لینک اختیاری «مشاهده همه» وجود دارد.
// مهم امنیتی: قیمت/تخفیف/موجودی صرفاً برای نمایش‌اند و در همین‌جا هم تأکید می‌کنم که نباید Source of Truth باشند؛ اعتبارسنجی واقعی باید در Backend انجام شود. چون ساختار Product را مشخص نکرده‌ای، من فقط یک Type حداقلی و بازتعریف‌پذیر گذاشتم؛ اگر مدل واقعی محصول را داری بده تا دقیق کنم.

// Component موردنیاز: ProductCard (به همراه Type مربوط به Product). من آن را نساختم؛ فقط از آن استفاده کردم. اگر می‌خواهی Type را من داخل همین فایل نگذارم یا مسیر import فرق دارد، بگو.
// بدون inline style و کاملاً BEM؛ چیدمان گرید/کاروسل و responsive را در CSS با همین کلاس‌ها پیاده کن (مثلاً featured__list را grid یا اسکرول افقی کن).
// Accessibility: ساختار معنایی <section aria-labelledby>، <h2> برای عنوان، و لیست <ul>/<li> برای محصولات استفاده شده تا برای screen reader قابل درک باشد.
// امنیتی: این Section هیچ منطق قیمت/تخفیف/موجودی ندارد و چیزی با innerHTML رندر نمی‌کند؛ این موارد باید در ProductCard (فقط نمایش) و نهایتاً Backend (اعتبارسنجی) مدیریت شوند.
// دو نکته که ممکن است بخواهی مشخص کنی:

// اگر می‌خواهی این Section مستقیماً از API داده بگیرد (با loading/error/skeleton)، بگو تا نسخه‌ای با آن حالت‌ها بسازم؛ فعلاً طبق قوانین چیزی درباره‌ی API حدس نزدم.
// اگر مدل واقعی Product (فیلدها و Typeها) را داری، بفرست تا import و امضای ProductCard را دقیقاً با آن هماهنگ کنم. 🙂