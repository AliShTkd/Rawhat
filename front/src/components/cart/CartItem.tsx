// CartItem.tsx
import { Show, type Component, type JSX } from "solid-js";
import Price from "./Price";
import QuantitySelector from "./QuantitySelector";
import IconButton from "./IconButton";

export interface CartItemData {
  id: string | number;
  name: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  quantity: number;
  maxQuantity?: number;
  inStock?: boolean;
}

export interface CartItemProps {
  item: CartItemData;
  removeIcon: JSX.Element;
  removeLabel?: string;
  formatPrice?: (value: number, currency?: string) => string;
  onQuantityChange?: (id: CartItemData["id"], quantity: number) => void;
  onRemove?: (id: CartItemData["id"]) => void;
}

const CartItem: Component<CartItemProps> = (props) => {
  const item = () => props.item;

  const isOutOfStock = () => item().inStock === false;

  const lineTotal = () => item().price * item().quantity;

  return (
    <div
      class="cart-item"
      classList={{ "cart-item--out-of-stock": isOutOfStock() }}
    >
      <a class="cart-item__media" href={item().href}>
        <img
          class="cart-item__image"
          src={item().imageSrc}
          alt={item().imageAlt}
          loading="lazy"
          decoding="async"
        />
      </a>

      <div class="cart-item__info">
        <a class="cart-item__name" href={item().href}>
          {item().name}
        </a>

        <Show when={isOutOfStock()}>
          <span class="cart-item__stock-warning">ناموجود</span>
        </Show>

        <div class="cart-item__unit-price">
          <Price
            price={item().price}
            originalPrice={item().originalPrice}
            currency={item().currency}
            formatPrice={props.formatPrice}
          />
        </div>
      </div>

      <div class="cart-item__quantity">
        <QuantitySelector
          value={item().quantity}
          min={1}
          max={item().maxQuantity}
          disabled={isOutOfStock()}
          label="تعداد"
          onChange={(q) => props.onQuantityChange?.(item().id, q)}
        />
      </div>

      <div class="cart-item__total">
        <span class="cart-item__total-label">جمع</span>
        <Price
          price={lineTotal()}
          currency={item().currency}
          formatPrice={props.formatPrice}
        />
      </div>

      <div class="cart-item__actions">
        <IconButton
          label={props.removeLabel ?? `حذف ${item().name}`}
          icon={props.removeIcon}
          variant="ghost"
          size="sm"
          onClick={() => props.onRemove?.(item().id)}
        />
      </div>
    </div>
  );
};

export default CartItem;







// <CartItem
//   item={{
//     id: 1,
//     name: "پروتئین وی گلد استاندارد",
//     href: "/products/on-gold-standard",
//     imageSrc: "/images/products/on-gold.webp",
//     imageAlt: "پروتئین وی گلد استاندارد",
//     price: 3200000,
//     originalPrice: 3800000,
//     quantity: 2,
//     maxQuantity: 10, // فقط UX؛ موجودی واقعی در Backend
//     inStock: true,
//   }}
//   removeIcon={<TrashIcon />}
//   onQuantityChange={(id, q) => updateCartQuantity(id, q)}
//   onRemove={(id) => removeFromCart(id)}
// />

// این هم CartItem، برای نمایش یک ردیف کالا در سبد خرید. این یکی از جاهایی است که می‌توانیم primitiveهای قبلی (Price, QuantitySelector, IconButton) را کنار هم استفاده کنیم تا هماهنگی پروژه حفظ شود.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// کنترل‌شده از بیرون: تغییر تعداد و حذف، از طریق callbackها (onQuantityChange, onRemove) به بیرون داده می‌شوند؛ خودِ این Component منطق سبد را نهایی نمی‌کند.
// از Price و QuantitySelector و IconButton که قبلاً ساختیم استفاده می‌کنم (ساخته‌شده‌اند؛ فقط import و استفاده). برای آیکون حذف، طبق الگوی قبلی یک JSX.Element از بیرون می‌گیرم تا به کتابخانه‌ی آیکون وابسته نشویم.
// مدل داده را با یک CartItemData مستقل تعریف می‌کنم (نزدیک به Product اما مخصوص سبد، چون quantity دارد). اگر می‌خواهی از همان Product مشترک ارث ببرد، بگو تا هماهنگ کنم.
// امنیتی/معماری (مهم): قیمت، مجموع ردیف، و سقف موجودی (maxQuantity) صرفاً نمایشی‌اند و Source of Truth نیستند؛ محاسبه‌ی مبلغ نهایی و اعتبار موجودی باید در Backend هنگام مشاهده‌ی سبد/پرداخت دوباره انجام شود.

// نکات مهم:

// استفاده‌ی مجدد از primitiveها: به‌جای بازنویسی قیمت/تعداد/دکمه، از Price، QuantitySelector و IconButton که قبلاً ساختیم استفاده شد تا رفتار و ظاهر در کل پروژه یکدست بماند. مدل داده (CartItemData) را اینجا مستقل نگه داشتم؛ اگر فایل مشترک types.ts داری، بگو تا منتقلش کنم.
// امنیتی (مهم): lineTotal (قیمت × تعداد) صرفاً نمایشی است. مبلغ نهایی قابل پرداخت، اعتبار قیمت و سقف موجودی باید در Backend محاسبه و اعتبارسنجی شود؛ کاربر می‌تواند مقادیر Frontend را دستکاری کند. بدون innerHTML.
// Accessibility:
// تصویر و نام هر دو لینک به صفحه‌ی محصول‌اند؛ alt تصویر اجباری است. اگر نمی‌خواهی تصویر هم لینک جدا باشد (برای جلوگیری از دو لینک متوالی به یک مقصد که برای screen reader کمی تکراری است)، بگو تا تصویر را alt="" تزئینی کنم و فقط نام لینک بماند.
// دکمه‌ی حذف از IconButton است که label اجباری و گویا دارد (شامل نام محصول، تا کاربر screen reader بداند کدام مورد حذف می‌شود).
// هشدار «ناموجود» به‌صورت متن واقعی نمایش داده می‌شود.
// بدون inline style و کاملاً BEM؛ چیدمان (grid افقی در دسکتاپ: تصویر | اطلاعات | تعداد | جمع | حذف، و چیدمان فشرده‌ی عمودی در موبایل) را در CSS با همین کلاس‌ها بساز. cart-item--out-of-stock را برای کم‌رنگ‌کردن ردیف ناموجود استفاده کن.
// دو تصمیمی که ممکن است بخواهی بگیری:

// می‌خواهی گزینه‌ی «ذخیره برای بعد / انتقال به علاقه‌مندی‌ها» هم روی هر ردیف باشد؟ اگر بله، با یک IconButton/callback دیگر اضافه می‌کنم.
// اگر ترجیح می‌دهی به‌جای «جمع ردیف»، تخفیف هر ردیف یا مقدار صرفه‌جویی هم نشان داده شود، بگو تا با Price (و prop درصد/صرفه‌جویی) اضافه کنم. 🙂
// اگر بخواهی، قدم بعدی می‌تواند ساخت CartSummary (جمع کل، تخفیف، هزینه‌ی ارسال، مبلغ نهایی و دکمه‌ی «ادامه‌ی خرید») باشد تا صفحه‌ی سبد خرید کامل شود. 🙂