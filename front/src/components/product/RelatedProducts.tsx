// @ts-nocheck


// RelatedProducts.tsx
import {
  Show,
  For,
  createUniqueId,
  type Component,
} from "solid-js";
import ProductCard, { type ProductCardData } from "./ProductCard";

export interface RelatedProductsProps {
  products: ProductCardData[];
  title?: string;
  loading?: boolean;
  skeletonCount?: number;
  formatPrice?: (value: number, currency?: string) => string;
  onAddToCart?: (productId: string | number) => void;
  onProductClick?: (productId: string | number) => void;
  prevLabel?: string;
  nextLabel?: string;
}

const RelatedProducts: Component<RelatedProductsProps> = (props) => {
  const titleId = createUniqueId();
  let trackRef: HTMLUListElement | undefined;

  const hasProducts = () => props.products.length > 0;

  // مقدار اسکرول: تقریباً یک «صفحه» از عرض نوار
  const scrollByDir = (dir: 1 | -1) => {
    if (!trackRef) return;
    const amount = trackRef.clientWidth * 0.8 * dir;
    // برای RTL هم درست کار می‌کند چون scrollBy نسبی است
    trackRef.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <Show when={props.loading || hasProducts()}>
      <section class="related-products" aria-labelledby={titleId}>
        <div class="related-products__header">
          <h2 class="related-products__title" id={titleId}>
            {props.title ?? "محصولات مرتبط"}
          </h2>

          <Show when={!props.loading && hasProducts()}>
            <div class="related-products__nav" aria-hidden="false">
              <button
                class="related-products__nav-btn related-products__nav-btn--prev"
                type="button"
                aria-label={props.prevLabel ?? "محصولات قبلی"}
                onClick={() => scrollByDir(-1)}
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                class="related-products__nav-btn related-products__nav-btn--next"
                type="button"
                aria-label={props.nextLabel ?? "محصولات بعدی"}
                onClick={() => scrollByDir(1)}
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </Show>
        </div>

        {/* حالت loading: اسکلت */}
        <Show when={props.loading}>
          <ul class="related-products__track" aria-hidden="true">
            <For each={Array.from({ length: props.skeletonCount ?? 4 })}>
              {() => (
                <li class="related-products__item">
                  <div class="related-products__skeleton" />
                </li>
              )}
            </For>
          </ul>
        </Show>

        {/* حالت داده */}
        <Show when={!props.loading && hasProducts()}>
          <ul
            class="related-products__track"
            ref={trackRef}
            tabindex="0"
            aria-label={props.title ?? "محصولات مرتبط"}
          >
            <For each={props.products}>
              {(product) => (
                <li class="related-products__item">
                  <ProductCard
                    product={product}
                    formatPrice={props.formatPrice}
                    onAddToCart={() => props.onAddToCart?.(product.id)}
                    onClick={() => props.onProductClick?.(product.id)}
                  />
                </li>
              )}
            </For>
          </ul>
        </Show>
      </section>
    </Show>
  );
};

export default RelatedProducts;


















// <RelatedProducts
//   title="محصولات مشابه"
//   products={relatedList}      // آرایه‌ای از ProductCardData
//   onAddToCart={(id) => addToCart(id, 1)}
//   onProductClick={(id) => navigate(`/product/${id}`)}
// />

// // حالت loading
// <RelatedProducts loading skeletonCount={4} products={[]} />


// این هم RelatedProducts، بخش «محصولات مرتبط / پیشنهادی» که معمولاً پایین صفحه‌ی محصول می‌نشیند. این یکی کاملاً ترکیب‌کننده است: چیدمان یک لیست از ProductCard (که قبلاً ساختیم) به‌صورت یک کاروسل افقی قابل اسکرول با A11y مناسب.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// از ProductCard که قبلاً ساختیم برای هر آیتم استفاده می‌کنم (فرض بر آماده‌بودنش). این Component فقط چیدمان + عنوان بخش + ناوبری اسکرول را اضافه می‌کند.
// الگوی نمایش: نوار افقی قابل اسکرول (نه grid)، چون «محصولات مرتبط» معمولاً افقی مرور می‌شوند. دکمه‌های «قبلی/بعدی» برای اسکرول با ماوس/کیبورد اضافه شد؛ خودِ نوار هم با اسکرول لمسی/ترک‌پد کار می‌کند.
// رویدادها (onAddToCart, onProductClick) صرفاً به بیرون پاس داده می‌شوند — منطق سبد/ناوبری بیرون از این Component است.
// حالت loading با تعداد مشخصی اسکلت (skeleton) اختیاری است.
// tsx




// نکات مهم:

// ترکیب‌کننده (Composition): این Component چیز بصری جدیدی از صفر نمی‌سازد؛ فقط ProductCardها را در یک نوار افقی می‌چیند و ناوبری اسکرول + عنوان بخش را اضافه می‌کند. همان یکدستی‌ای که در ProductInfo هم داشتیم.
// Accessibility:
// نوار اسکرول (__track) خودش tabindex="0" و aria-label دارد تا کاربر کیبورد بتواند فوکوس کند و با کلیدهای جهت‌دار اسکرول کند (رفتار پیش‌فرض مرورگر برای ناحیه‌ی قابل اسکرول). دکمه‌های «قبلی/بعدی» صرفاً میان‌بر هستند، نه تنها راه ناوبری — این مهم است، چون اگر ناوبری فقط با دکمه‌های جهت بصری ممکن باشد، برای صفحه‌خوان/کیبورد مشکل‌ساز می‌شود.
// دکمه‌های ناوبری aria-label متنی دارند (چیزی که داخلشان است فقط ‹/› تزئینی با aria-hidden است).
// اسکلت‌های loading با aria-hidden="true" از دید صفحه‌خوان پنهان‌اند (محتوای واقعی نیستند).
// از <section aria-labelledby> و لیست معنایی <ul>/<li> استفاده شد تا ساختار «مجموعه‌ای از آیتم‌ها» درست منتقل شود.
// RTL: برای اسکرول از scrollBy({ left, behavior }) به‌صورت نسبی استفاده کردم که در RTL هم درست عمل می‌کند (بدون محاسبه‌ی دستی جهت). در CSS از خاصیت‌های منطقی و scroll-snap-type: inline mandatory + scroll-snap-align: start روی آیتم‌ها استفاده کن تا اسکرول تمیز و مرتب باشد.
// دو نکته‌ی احتیاطی که بهتر است خودت تصمیم بگیری:
// مخفی‌کردن دکمه‌های ناوبری در نبود سرریز: اگر تعداد محصولات کم باشد و اسکرول لازم نباشد، بهتر است دکمه‌های «قبلی/بعدی» یا غیرفعال یا پنهان شوند. این نیاز به اندازه‌گیری عرض (via ResizeObserver یا بررسی scrollWidth > clientWidth) دارد که عمداً برای ساده‌ماندن نگذاشتم. اگر بخواهی، نسخه‌ای با تشخیص خودکار سرریز و غیرفعال‌شدن دکمه‌ها در ابتدا/انتهای اسکرول می‌سازم.
// گزینه‌ی grid به‌جای کاروسل: اگر ترجیح می‌دهی به‌جای نوار افقی، یک شبکه‌ی responsive (مثلاً ۲ ستون موبایل، ۴ ستون دسکتاپ) باشد، فقط CSS تغییر می‌کند و کل بخش ناوبری حذف می‌شود. بگو کدام الگو را می‌خواهی.
// بدون inline style و کاملاً BEM؛ عرض ثابت هر آیتم (مثلاً inline-size: 15rem روی __item)، پنهان‌کردن اسکرول‌بار در صورت تمایل (با نگه‌داشتن قابلیت اسکرول)، ابعاد اسکلت، و استایل دایره‌ای دکمه‌های ناوبری را در CSS با همین کلاس‌ها بساز.
// یک هشدار هماهنگی: فرض کردم ProductCard با تایپ ProductCardData و propهای product, onAddToCart, onClick, formatPrice قبلاً ساخته شده. اگر امضای ProductCard تو فرق دارد (مثلاً propها جدا هستند نه داخل یک آبجکت product)، بگو تا این فراخوانی را دقیقاً با همان تطبیق بدهم.

// قدم بعدی پیشنهادی:

// ReviewForm (که از بحث ProductReviews عقب افتاد) برای کامل‌کردن چرخه‌ی دیدگاه‌ها.
// یا Breadcrumb (مسیر ناوبری بالای صفحه‌ی محصول: خانه ← دسته ← محصول) با نشانه‌گذاری معنایی و A11y مناسب.
// یا مونتاژ نهایی کل صفحه‌ی محصول با کنار هم گذاشتن Breadcrumb + ProductGallery + ProductInfo + ProductTabs(توضیحات/مشخصات/دیدگاه‌ها) + RelatedProducts.