
// ProductGallery.tsx
import {
  Show,
  For,
  createSignal,
  createMemo,
  type Component,
} from "solid-js";

export interface GalleryImage {
  id: string | number;
  src: string;
  alt: string;
  thumbnailSrc?: string;
}

export interface ProductGalleryProps {
  images: GalleryImage[];
  activeIndex?: number;
  label?: string;
  onActiveIndexChange?: (index: number) => void;
}

const ProductGallery: Component<ProductGalleryProps> = (props) => {
  const [internalIndex, setInternalIndex] = createSignal(0);

  const isControlled = () => props.activeIndex !== undefined;

  const activeIndex = createMemo(() => {
    const raw = isControlled() ? (props.activeIndex as number) : internalIndex();
    const count = props.images.length;
    if (count === 0) return 0;
    // محدودسازی برای جلوگیری از index نامعتبر
    return Math.min(Math.max(raw, 0), count - 1);
  });

  const activeImage = () => props.images[activeIndex()];

  const select = (index: number) => {
    const count = props.images.length;
    if (count === 0) return;
    const next = (index + count) % count; // چرخشی برای Arrow keys
    if (!isControlled()) {
      setInternalIndex(next);
    }
    props.onActiveIndexChange?.(next);
  };

  const handleThumbKeyDown = (event: KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        select(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        select(index - 1);
        break;
      case "Home":
        event.preventDefault();
        select(0);
        break;
      case "End":
        event.preventDefault();
        select(props.images.length - 1);
        break;
    }
  };

  return (
    <Show
      when={props.images.length > 0}
      fallback={
        <div class="product-gallery product-gallery--empty">
          <span class="product-gallery__placeholder" aria-hidden="true" />
        </div>
      }
    >
      <div
        class="product-gallery"
        role="group"
        aria-label={props.label ?? "گالری تصاویر محصول"}
      >
        <div class="product-gallery__stage">
          <img
            class="product-gallery__image"
            src={activeImage().src}
            alt={activeImage().alt}
            decoding="async"
          />
        </div>

        <Show when={props.images.length > 1}>
          <div
            class="product-gallery__thumbs"
            role="tablist"
            aria-label="انتخاب تصویر"
          >
            <For each={props.images}>
              {(image, index) => {
                const isActive = () => index() === activeIndex();
                return (
                  <button
                    class="product-gallery__thumb"
                    classList={{
                      "product-gallery__thumb--active": isActive(),
                    }}
                    type="button"
                    role="tab"
                    aria-selected={isActive() ? "true" : "false"}
                    tabindex={isActive() ? 0 : -1}
                    aria-label={`نمایش ${image.alt}`}
                    onClick={() => select(index())}
                    onKeyDown={(e) => handleThumbKeyDown(e, index())}
                  >
                    <img
                      class="product-gallery__thumb-image"
                      src={image.thumbnailSrc ?? image.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                );
              }}
            </For>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default ProductGallery;





// // ساده (state داخلی)
// <ProductGallery
//   images={[
//     { id: 1, src: "/img/p1-1.webp", alt: "نمای جلوی محصول" },
//     { id: 2, src: "/img/p1-2.webp", alt: "نمای پشت محصول", thumbnailSrc: "/img/p1-2-thumb.webp" },
//     { id: 3, src: "/img/p1-3.webp", alt: "برچسب ارزش غذایی" },
//   ]}
// />

// // کنترل‌شده از بیرون (مثلاً هماهنگ با رنگ انتخابی)
// const [active, setActive] = createSignal(0);
// <ProductGallery images={images} activeIndex={active()} onActiveIndexChange={setActive} />

// این هم ProductGallery، برای نمایش گالری تصاویر محصول در صفحه‌ی محصول (تصویر اصلی بزرگ + بندانگشتی‌ها برای جابه‌جایی). این یکی تعاملی است و A11y مربوط به انتخاب تصویر را جدی گرفتم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// می‌تواند کنترل‌نشده (state داخلی برای تصویر فعال) یا کنترل‌شده از بیرون (activeIndex + onActiveIndexChange) باشد؛ اگر activeIndex ندهی، خودش مدیریت می‌کند.
// هر تصویر یک src, alt (اجباری برای A11y) و thumbnailSrc اختیاری دارد (اگر نباشد از خود src استفاده می‌شود).
// ناوبری بندانگشتی‌ها به‌صورت الگوی tablist/tab پیاده شد تا با کیبورد (Arrow keys) کاملاً قابل استفاده باشد.
// عمداً zoom/lightbox را داخل این Component نگذاشتم تا ساده بماند؛ اگر بخواهی، به‌صورت یک لایه‌ی جدا (با Modal که ساختیم) اضافه می‌کنم.

// نکات مهم:

// Accessibility (نقطه‌ی حساس این Component):
// بندانگشتی‌ها با الگوی tablist/tab پیاده شدند: تب فعال aria-selected="true" و tabindex={0} دارد، بقیه tabindex={-1} — این «roving tabindex» است تا با یک Tab وارد گروه شوی و با Arrow keys بین تصاویر حرکت کنی (Home/End هم پشتیبانی می‌شود).
// alt تصویر اصلی معنادار است؛ اما alt تصاویر داخل دکمه‌های بندانگشتی را "" گذاشتم چون خودِ دکمه aria-label گویا دارد (جلوگیری از خواندن تکراری برای screen reader).
// نکته‌ی الگو: الگوی کامل tabs معمولاً یک tabpanel هم دارد. اینجا چون «استیج تصویر» ماهیت panel دارد ولی ساختار متفاوت است، از role="group" برای کل گالری استفاده کردم و صحنه را ساده نگه داشتم. اگر می‌خواهی دقیقاً به الگوی رسمی tab/tabpanel نزدیک شود (با aria-controls و idهای یکتا via createUniqueId)، بگو تا کامل‌اش کنم.
// کنترل‌شده/نکنترل‌شده: مثل SearchBar/QuantitySelector، هر دو حالت پشتیبانی می‌شود؛ activeIndex با clamp محدود می‌شود تا index نامعتبر ظاهر را خراب نکند.
// بدون inline style و کاملاً BEM؛ چیدمان (استیج بزرگ بالا + نوار بندانگشتی زیر/کنار)، نسبت ابعاد تصویر (aspect-ratio)، حالت فعال بندانگشتی (--active با قاب رنگی)، و responsive بودن را در CSS با همین کلاس‌ها بساز. برای RTL از خاصیت‌های منطقی استفاده کن.
// امنیتی: بدون innerHTML؛ فقط src/alt امن. مطمئن شو منبع تصاویر معتبر است و altها از داده‌ی قابل‌اعتماد می‌آیند.
// Performance: تصویر فعال بدون loading="lazy" است (چون معمولاً above-the-fold و مهم است)، اما بندانگشتی‌ها lazy هستند. اگر می‌خواهی برای تصویر اول fetchpriority="high" بگذارم تا LCP بهتر شود، بگو تا اضافه کنم.
// اگر بخواهی، قدم بعدی می‌تواند اضافه‌کردن zoom روی hover یا lightbox تمام‌صفحه (با همان Modal که ساختیم و focus trap آن) باشد، یا یک ProductInfo/ProductDetails (نام، قیمت با Price، امتیاز با Rating، انتخاب تعداد با QuantitySelector و دکمه‌ی افزودن به سبد) تا صفحه‌ی محصول کامل شود. بگو کدام را ادامه دهم. 🙂