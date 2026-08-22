


// ProductInfo.tsx
import {
  Show,
  createSignal,
  createMemo,
  type Component,
  type JSX,
} from "solid-js";
import Price from "./Price";
import Rating from "./Rating";
import QuantitySelector from "./QuantitySelector";
import Button from "./Button";
import Divider from "./Divider";

export interface ProductInfoData {
  id: string | number;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  inStock?: boolean;
  maxQuantity?: number;
}

export interface ProductInfoProps {
  product: ProductInfoData;
  quantity?: number;
  addToCartIcon?: JSX.Element;
  formatPrice?: (value: number, currency?: string) => string;
  onQuantityChange?: (quantity: number) => void;
  onAddToCart?: (quantity: number) => void;
  addToCartLabel?: string;
  loading?: boolean;
}

const ProductInfo: Component<ProductInfoProps> = (props) => {
  const product = () => props.product;
  const isOutOfStock = () => product().inStock === false;

  const [internalQty, setInternalQty] = createSignal(1);
  const isControlled = () => props.quantity !== undefined;
  const quantity = createMemo(() =>
    isControlled() ? (props.quantity as number) : internalQty()
  );

  const changeQuantity = (q: number) => {
    if (!isControlled()) setInternalQty(q);
    props.onQuantityChange?.(q);
  };

  const hasRating = () =>
    product().rating !== undefined && product().rating! > 0;

  return (
    <div class="product-info">
      <Show when={product().brand}>
        <div class="product-info__brand">{product().brand}</div>
      </Show>

      <h1 class="product-info__name">{product().name}</h1>

      <Show when={hasRating()}>
        <div class="product-info__rating">
          <Rating value={product().rating as number} readonly />
          <Show when={product().reviewCount !== undefined}>
            <span class="product-info__review-count">
              ({product().reviewCount} دیدگاه)
            </span>
          </Show>
        </div>
      </Show>

      <div class="product-info__price">
        <Price
          price={product().price}
          originalPrice={product().originalPrice}
          currency={product().currency}
          showDiscountPercent
          formatPrice={props.formatPrice}
        />
      </div>

      <Divider />

      <Show when={product().description}>
        <p class="product-info__description">{product().description}</p>
      </Show>

      <div class="product-info__stock">
        <Show
          when={!isOutOfStock()}
          fallback={
            <span class="product-info__stock-badge product-info__stock-badge--out">
              ناموجود
            </span>
          }
        >
          <span class="product-info__stock-badge product-info__stock-badge--in">
            موجود در انبار
          </span>
        </Show>
      </div>

      <Show when={!isOutOfStock()}>
        <div class="product-info__purchase">
          <div class="product-info__quantity">
            <QuantitySelector
              value={quantity()}
              min={1}
              max={product().maxQuantity}
              label="تعداد"
              onChange={changeQuantity}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={props.addToCartIcon}
            loading={props.loading}
            onClick={() => props.onAddToCart?.(quantity())}
          >
            {props.addToCartLabel ?? "افزودن به سبد خرید"}
          </Button>
        </div>
      </Show>
    </div>
  );
};

export default ProductInfo;









// <ProductInfo
//   product={{
//     id: 1,
//     name: "پروتئین وی گلد استاندارد",
//     brand: "Optimum Nutrition",
//     price: 3200000,
//     originalPrice: 3800000,
//     rating: 4.5,
//     reviewCount: 128,
//     description: "پروتئین وی با کیفیت بالا برای عضله‌سازی و ریکاوری.",
//     inStock: true,
//     maxQuantity: 10, // فقط UX؛ موجودی واقعی در Backend
//   }}
//   addToCartIcon={<CartIcon />}
//   onAddToCart={(qty) => addToCart(productId, qty)}
// />


// این هم ProductInfo، بخش اطلاعات و خرید در صفحه‌ی محصول (کنار ProductGallery). این یکی از بهترین جاها برای مونتاژ primitiveهای قبلی است: Price, Rating, QuantitySelector, Button, Divider و... . سعی کردم آن را ترکیب‌کننده (composition) نگه دارم، نه بازنویسی.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// این Component ترکیب‌کننده است: منطق سبد/موجودی را نهایی نمی‌کند، فقط داده را نمایش می‌دهد و رویدادها (onAddToCart, onQuantityChange) را به بیرون می‌دهد.
// تعداد می‌تواند کنترل‌شده (quantity+onQuantityChange) یا داخلی باشد (اگر ندهی، خودش با state داخلی مدیریت می‌کند).
// از Rating که قبلاً ساختیم استفاده می‌کنم (فرض بر ساخته‌شدنش). اگر هنوز نساختیم، بگو تا اول آن را بسازم؛ فعلاً import شده.
// امنیتی/معماری (مهم): قیمت، موجودی و امتیاز صرفاً نمایشی‌اند. اعتبار قیمت، موجودی واقعی و مجاز بودن افزودن به سبد باید در Backend بررسی شود؛ کاربر می‌تواند داده‌ی Frontend را دستکاری کند.


// نکات مهم:

// ترکیب‌کننده (Composition): این Component عملاً چیز جدیدی از صفر نمی‌سازد؛ Price، Rating، QuantitySelector، Button و Divider را کنار هم می‌چیند. این دقیقاً همان یکدستی‌ای است که در کل پروژه دنبالش بودیم — منطق قیمت/تخفیف/تعداد یکجا مدیریت می‌شود.
// کنترل‌شده/نکنترل‌شده: تعداد مثل ProductGallery/QuantitySelector هر دو حالت را پشتیبانی می‌کند؛ اگر quantity ندهی، state داخلی از ۱ شروع می‌کند.
// Accessibility:
// نام محصول <h1> است چون در صفحه‌ی محصول معمولاً عنوان اصلی صفحه است. اگر جای دیگری (مثل quick-view داخل Modal) استفاده می‌کنی که نباید <h1> باشد، بگو تا سطح heading را قابل‌تنظیم کنم (مهم برای سلسله‌مراتب درست صفحه).
// Rating را readonly گذاشتم (نمایشی، نه ثبت امتیاز). مطمئن شو خودِ Rating مقدار را برای screen reader گویا اعلام می‌کند (مثلاً «۴.۵ از ۵»).
// وضعیت موجودی به‌صورت متن واقعی نمایش داده می‌شود (نه فقط رنگ)، که برای دسترس‌پذیری مهم است.
// وقتی ناموجود است، بخش خرید (تعداد + دکمه) اصلاً رندر نمی‌شود؛ اگر ترجیح می‌دهی دکمه بماند ولی disabled باشد (مثلاً برای «اطلاع‌رسانی موجود شدن»)، بگو تا تغییر دهم.
// امنیتی: بدون innerHTML. تأکید دوباره: قیمت/موجودی/سقف تعداد نمایشی‌اند؛ onAddToCart فقط نیت کاربر را می‌فرستد و سرور باید موجودی و قیمت را در لحظه‌ی افزودن/پرداخت اعتبارسنجی کند.
// بدون inline style و کاملاً BEM؛ فاصله‌ها، برجستگی قیمت، رنگ بج موجود/ناموجود (سبز/قرمز + متن)، و چیدمان بخش خرید (تعداد کنار دکمه در دسکتاپ، تمام‌عرض در موبایل) را در CSS با همین کلاس‌ها بساز.
// یک هشدار کوچک هماهنگی: من فرض کردم Rating را قبلاً ساخته‌ایم و آماده است. اگر هنوز نساختیم، بگو تا Rating را (نمایشی + قابلیت تعاملی اختیاری برای ثبت امتیاز، با A11y مناسب مثل aria-label گویا و پشتیبانی کیبورد) بسازم تا این import واقعی شود.

// قدم بعدی پیشنهادی برای کامل‌کردن صفحه‌ی محصول:

// ProductTabs (توضیحات / مشخصات فنی / دیدگاه‌ها) با الگوی tab/tabpanel کامل و A11y.
// یا AddToCartBar چسبان در موبایل (نوار پایین صفحه با قیمت + دکمه‌ی افزودن).