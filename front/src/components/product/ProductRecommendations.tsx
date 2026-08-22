
// ProductRecommendations.tsx
import {
  Show,
  For,
  createUniqueId,
  type Component,
} from "solid-js";
import RelatedProducts from "./RelatedProducts";
import { type ProductCardData } from "./ProductCard";

export interface RecommendationSection {
  id: string | number;
  title: string;
  products: ProductCardData[];
}

export interface ProductRecommendationsProps {
  sections: RecommendationSection[];
  heading?: string;
  loading?: boolean;
  skeletonCount?: number;
  formatPrice?: (value: number, currency?: string) => string;
  onAddToCart?: (productId: string | number) => void;
  onProductClick?: (productId: string | number) => void;
}

const ProductRecommendations: Component<ProductRecommendationsProps> = (
  props
) => {
  const headingId = createUniqueId();

  // فقط بخش‌هایی که واقعاً محصول دارند (مگر در حالت loading)
  const visibleSections = () =>
    props.sections.filter((s) => s.products.length > 0);

  const hasContent = () => props.loading || visibleSections().length > 0;

  return (
    <Show when={hasContent()}>
      <section class="product-recommendations" aria-labelledby={headingId}>
        {/* عنوان کلی ناحیه؛ بصری پنهان اگر فقط ساختاری لازم است */}
        <h2
          class="product-recommendations__heading"
          id={headingId}
        >
          {props.heading ?? "پیشنهاد برای شما"}
        </h2>

        {/* حالت loading: یک بخش اسکلتی */}
        <Show when={props.loading}>
          <RelatedProducts
            products={[]}
            loading
            skeletonCount={props.skeletonCount ?? 4}
            title=""
          />
        </Show>

        {/* حالت داده: هر بخش یک RelatedProducts */}
        <Show when={!props.loading}>
          <For each={visibleSections()}>
            {(section) => (
              <div class="product-recommendations__section">
                <RelatedProducts
                  title={section.title}
                  products={section.products}
                  formatPrice={props.formatPrice}
                  onAddToCart={props.onAddToCart}
                  onProductClick={props.onProductClick}
                />
              </div>
            )}
          </For>
        </Show>
      </section>
    </Show>
  );
};

export default ProductRecommendations;
















<ProductRecommendations
  heading="پیشنهادها"
  sections={[
    { id: "recent", title: "اخیراً دیده‌اید", products: recentlyViewed },
    { id: "bought-together", title: "مشتریان این را هم خریدند", products: boughtTogether },
    { id: "for-you", title: "بر اساس علاقه‌ی شما", products: personalized },
  ]}
  onAddToCart={(id) => addToCart(id, 1)}
  onProductClick={(id) => navigate(`/product/${id}`)}
/>

// حالت loading
<ProductRecommendations sections={[]} loading />





این هم ProductRecommendations، بخش «پیشنهادها برای شما». این را عمداً از RelatedProducts متفاوت طراحی کردم تا تکرار نشود: RelatedProducts یک نوار افقی از محصولات مشابه بود؛ اما ProductRecommendations یک کانتینر چندبخشی است که می‌تواند چند دسته‌ی پیشنهادی را کنار هم بگذارد (مثل «اخیراً دیده‌اید»، «مشتریان این را هم خریدند»، «بر اساس علاقه‌ی شما») و هر بخش را به RelatedProducts که قبلاً ساختیم بسپارد.

فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

این Component ترکیب‌کننده‌ی سطح بالاتر است: هر «بخش پیشنهادی» را با RelatedProducts رندر می‌کند (که خودش هر آیتم را با ProductCard می‌سازد). یعنی سه لایه‌ی تمیز: ProductCard → RelatedProducts → ProductRecommendations.
ورودی یک آرایه از بخش‌هاست؛ هر بخش title و products خودش را دارد (و اختیاری id برای منطق بیرونی مثل tracking).
حریم خصوصی/امنیتی (نکته‌ی مهم این یکی): پیشنهادها معمولاً شخصی‌سازی‌شده و بر پایه‌ی رفتار کاربرند. منطق ساخت پیشنهاد باید در سرور باشد؛ این Component فقط نمایش می‌دهد. «اخیراً دیده‌اید» اگر سمت کلاینت است، به رضایت کاربر (کوکی/consent) و حریم خصوصی حساس است.





نکات مهم:

چرا این جدا از RelatedProducts است؟ (تصمیم معماری) برای اینکه دوباره‌کاری نکنیم، این Component هیچ چیدمان کاروسلی‌ای دوباره نمی‌سازد؛ فقط چند RelatedProducts را با عنوان کلی سازمان می‌دهد. اگر پیشنهادهای تو فقط یک بخش است، اصلاً به این نیازی نداری و مستقیم از RelatedProducts استفاده کن. این Component وقتی ارزش دارد که چند دسته‌ی پیشنهادی روی یک صفحه داری.
Accessibility (نکته‌ی heading — مهم):
ساختار heading دو سطحی است: یک <h2> کلی برای کل ناحیه، و داخل هر RelatedProducts هم یک <h2> برای عنوان آن بخش. این یک ناهماهنگی سلسله‌مراتب است (دو h2 هم‌سطح که یکی باید زیردست دیگری باشد). دو راه‌حل تمیز دارد:
عنوان بخش‌ها در RelatedProducts را قابل‌تنظیم کنیم تا اینجا h3 شوند (نیازمند افزودن prop headingLevel به RelatedProducts).
یا عنوان کلی این ناحیه را بصری پنهان کنیم (.product-recommendations__heading با تکنیک visually-hidden) و فقط برای screen reader بماند تا از نظر بصری تکرار عنوان حس نشود.
پیشنهاد من: گزینه‌ی ۱ درست‌تر است (سلسله‌مراتب واقعی). بگو تا RelatedProducts را با prop headingLevel?: 2 | 3 به‌روزرسانی کنم و اینجا headingLevel={3} پاس بدهم. این تنها نکته‌ای است که برای درستیِ کامل A11y باید نهایی شود.
حریم خصوصی (مهم برای این نوع بخش): «اخیراً دیده‌اید» و «بر اساس علاقه‌ی شما» داده‌ی رفتاری‌اند. مطمئن شو:
جمع‌آوری این داده با consent کاربر است (به‌ویژه اگر کوکی/localStorage استفاده می‌کنی).
منطق شخصی‌سازی و رتبه‌بندی در سرور است؛ فرانت فقط نتیجه‌ی آماده را نمایش می‌دهد.
امنیتی: بدون innerHTML؛ همه‌ی داده‌ها از مسیر ProductCard به‌صورت متن/تصویر امن رندر می‌شوند. مثل قبل، قیمت/موجودی نمایشی‌اند و اعتبارسنجی نهایی در سرور است.
Performance: اگر بخش‌ها زیادند، هر کدام یک نوار محصول با چند تصویر است. برای بخش‌های پایین‌تر صفحه، ProductCard/تصاویر باید loading="lazy" باشند (که در ProductCard رعایت شده) و در صورت نیاز کل بخش‌های پایین را با lazy render (مثلاً هنگام نزدیک‌شدن به viewport via IntersectionObserver) بارگذاری کن تا LCP و هزینه‌ی شبکه بهینه بماند. اگر بخواهی، نسخه‌ای با «lazy mount هر بخش» می‌سازم.
بدون inline style و کاملاً BEM؛ فاصله‌ی عمودی بین بخش‌ها (product-recommendations__section با margin-block)، و استایل عنوان کلی را در CSS با همین کلاس‌ها بساز.
یک هماهنگی لازم (وابستگی واقعی): این Component به RelatedProducts تکیه دارد و برای رفع مشکل سلسله‌مراتب heading، بهتر است RelatedProducts یک prop headingLevel بگیرد. اگر موافقی، در قدم بعد RelatedProducts را با headingLevel به‌روز می‌کنم و این‌جا headingLevel={3} را وصل می‌کنم تا A11y کامل شود.

قدم بعدی پیشنهادی:

به‌روزرسانی RelatedProducts با headingLevel (رفع نکته‌ی بالا).
ReviewForm که هنوز از بحث دیدگاه‌ها باقی مانده.
یا Breadcrumb و سپس مونتاژ نهایی کل صفحه‌ی محصول.