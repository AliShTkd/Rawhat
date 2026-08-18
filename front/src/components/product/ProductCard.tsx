// ProductCard.tsx
import { Show, type Component } from "solid-js";

export interface Product {
  id: string | number;
  name: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  inStock?: boolean;
  isNew?: boolean;
}

export interface ProductCardProps {
  product: Product;
  formatPrice?: (value: number, currency?: string) => string;
  addToCartLabel?: string;
  outOfStockLabel?: string;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: Component<ProductCardProps> = (props) => {
  const product = () => props.product;

  const isOutOfStock = () => product().inStock === false;

  const hasDiscount = () =>
    product().originalPrice !== undefined &&
    product().originalPrice! > product().price;

  const formatPrice = (value: number) =>
    props.formatPrice
      ? props.formatPrice(value, product().currency)
      : `${value.toLocaleString("fa-IR")} ${product().currency ?? "تومان"}`;

  const handleAddToCart = () => {
    if (isOutOfStock()) return;
    props.onAddToCart?.(product());
  };

  return (
    <article class="product-card">
      <a class="product-card__link" href={product().href}>
        <div class="product-card__media">
          <img
            class="product-card__image"
            src={product().imageSrc}
            alt={product().imageAlt}
            loading="lazy"
            decoding="async"
          />

          <Show when={product().isNew}>
            <span class="product-card__badge product-card__badge--new">
              جدید
            </span>
          </Show>

          <Show when={hasDiscount()}>
            <span class="product-card__badge product-card__badge--sale">
              تخفیف
            </span>
          </Show>
        </div>

        <h3 class="product-card__name">{product().name}</h3>
      </a>

      <div class="product-card__pricing">
        <span class="product-card__price">{formatPrice(product().price)}</span>

        <Show when={hasDiscount()}>
          <span class="product-card__original-price">
            {formatPrice(product().originalPrice!)}
          </span>
        </Show>
      </div>

      <div class="product-card__footer">
        <Show
          when={!isOutOfStock()}
          fallback={
            <span class="product-card__stock product-card__stock--out">
              {props.outOfStockLabel ?? "ناموجود"}
            </span>
          }
        >
          <button
            class="product-card__add"
            type="button"
            onClick={handleAddToCart}
          >
            {props.addToCartLabel ?? "افزودن به سبد"}
          </button>
        </Show>
      </div>
    </article>
  );
};

export default ProductCard;










// <ProductCard
//   product={{
//     id: 1,
//     name: "پروتئین وی گلد استاندارد",
//     href: "/products/on-gold-standard",
//     imageSrc: "/images/products/on-gold.webp",
//     imageAlt: "پروتئین وی گلد استاندارد اپتیموم",
//     price: 3200000,
//     originalPrice: 3800000,
//     inStock: true,
//     isNew: true,
//   }}
//   onAddToCart={(p) => addToCart(p.id)} // منطق واقعی سبد در لایه‌ی بالاتر/Backend
// />


// این هم ProductCard که در بخش‌های قبلی (Featured/BestSellers/NewArrivals) از آن استفاده کردیم. چون این کارت قلب فروشگاه است و قبلاً از import ProductCard, { type Product } استفاده کرده بودیم، اینجا هم همان Type Product را تعریف و export می‌کنم تا همه‌ی بخش‌ها با هم سازگار بمانند.

// چند نکته‌ی مهم قبل از کد:

// چون مدل دقیق محصول را نداده بودی، یک Type حداقلی و منطقی می‌سازم. اگر مدل واقعی Product را داری، بده تا دقیق هماهنگ کنم؛ فعلاً بیش از این حدس نمی‌زنم.
// امنیتی/معماری (مهم): قیمت، تخفیف و موجودی صرفاً نمایشی هستند و Source of Truth نیستند. «افزودن به سبد» را با callback onAddToCart به بیرون سپردم؛ خودِ کارت هیچ منطق قیمت‌گذاری/موجودی/سبد را نهایی نمی‌کند. اعتبارسنجی واقعی باید در Backend باشد.
// فرمت قیمت را هم به‌صورت اختیاری از بیرون (formatPrice) گرفتم تا واحد پول/جداکننده‌ها یکجا در پروژه مدیریت شود و اینجا حدس نزنم.



// نکات مهم:

// سازگاری با بخش‌ها: این همان Product و همان ProductCard‌ای است که در FeaturedProductsSection، BestSellersSection و NewArrivalsSection import کردیم. توجه کن که آن Sectionها <ProductCard product={product} /> را بدون prop‌های دیگر صدا می‌زدند؛ اگر می‌خواهی onAddToCart/formatPrice هم به کارت برسد، باید آن‌ها را از طریق همان Sectionها pass-through کنیم. بگو تا امضای آن Sectionها را برای عبور دادن این prop‌ها به‌روزرسانی کنم (یک تغییر کوچک است).
// امنیتی: قیمت/تخفیف/موجودی فقط نمایشی‌اند؛ هنگام افزودن به سبد، فقط product به بیرون داده می‌شود و قیمت و موجودی نهایی باید سمت سرور در زمان افزودن/پرداخت دوباره اعتبارسنجی شود (کاربر می‌تواند داده‌ی Frontend را دستکاری کند). بدون innerHTML و بدون اعتماد به داده‌ی سمت کلاینت.
// Accessibility: از <article> برای کارت، <a> واقعی برای لینک محصول، <h3> برای نام (سازگار با سلسله‌مراتب <h2> بخش‌ها)، و <button type="button"> برای افزودن به سبد استفاده شد تا با کیبورد کاملاً قابل استفاده باشد. alt تصویر اجباری است.
// نکته‌ی ریز A11y: بج‌های «جدید/تخفیف» متن واقعی دارند و خوانده می‌شوند. اگر می‌خواهی صرفاً بصری باشند و اطلاعات از جای دیگر منتقل شود، بگو تا aria-hidden کنم.
// بدون inline style و کاملاً BEM؛ استایل قیمت خط‌خورده (product-card__original-price با text-decoration: line-through)، موقعیت بج‌ها (product-card__media را position: relative کن)، و responsive بودن را در CSS بساز.
// دو تصمیمی که خوب است بگیری:

// آیا می‌خواهی کارت درصد تخفیف را هم نشان دهد (مثلاً «۱۵٪»)؟ اگر بله، بگو تا یک المان و کلاس برایش اضافه کنم (محاسبه‌ی نمایشی است، نه منبع حقیقت).
// آیا دکمه‌ای برای علاقه‌مندی‌ها (wishlist) روی کارت می‌خواهی؟ اگر بله، آن را با یک callback جدا اضافه می‌کنم تا مستقل بماند. 🙂