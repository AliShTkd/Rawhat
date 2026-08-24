


// src/types/product.ts

/** شناسهٔ پول به کوچک‌ترین واحد (مثلاً ریال) به‌صورت integer تا خطای شناور رخ ندهد. */
export interface Money {
  /** مقدار به کوچک‌ترین واحدِ پول، همیشه integer. مثال: ۱۲۵۰۰۰ ریال */
  amount: number;
  /** کدِ ارز به‌صورت ISO-4217. برای این پروژه معمولاً "IRR". */
  currency: "IRR" | "USD" | "EUR";
}

/** وضعیتِ موجودیِ محصول — به‌جای پخش‌شدنِ منطقِ عددی در UI. */
export type Availability =
  | "in_stock"
  | "out_of_stock"
  | "preorder"
  | "discontinued";

/** ارجاعِ سبکِ دسته، همان‌که `Category`/`Breadcrumb` استفاده می‌کنند. */
export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
}

/** یک تصویر با متنِ جایگزین — هرگز رشتهٔ لختِ URL. */
export interface ProductImage {
  url: string;
  /** برای a11y الزامی است؛ خالی نگذارید. */
  alt: string;
  width?: number;
  height?: number;
}

/**
 * شکلِ سبکِ محصول — همانی که در گرید/کارت مصرف می‌شود.
 * `ProductCard`, `searchProducts`, `fetchCategory` همگی دقیقاً این را برمی‌گردانند.
 */
export interface Product {
  id: string;
  slug: string;
  title: string;

  /** قیمتِ فعلیِ فروش. */
  price: Money;
  /**
   * قیمتِ پیش از تخفیف؛ اگر موجود و بزرگ‌تر از `price` بود،
   * UI برچسبِ تخفیف نشان می‌دهد. اختیاری چون همه تخفیف ندارند.
   */
  compareAtPrice?: Money;

  /** تصویرِ اصلیِ کارت. گالریِ کامل فقط در `ProductDetail`. */
  image: ProductImage;

  availability: Availability;

  /** امتیازِ میانگین ۰..۵ و تعدادِ نظر — برای ستاره‌ها در کارت. */
  rating?: {
    average: number;
    count: number;
  };

  category: CategoryRef;

  /** برچسب‌های نمایشی مثل «جدید»، «پرفروش». */
  badges?: ReadonlyArray<string>;
}

/** یک ویژگیِ نام‌دار در جدولِ مشخصاتِ صفحهٔ جزئیات. */
export interface ProductSpec {
  label: string;
  value: string;
}

/**
 * شکلِ کاملِ محصول برای صفحهٔ جزئیات — از `Product` گسترش می‌یابد
 * تا هر جا `Product` پذیرفته می‌شود (مثل `ProductCard`) این هم بپذیرد.
 */
export interface ProductDetail extends Product {
  /** توضیحِ کامل؛ می‌تواند شاملِ HTMLِ پاک‌سازی‌شده باشد. */
  description: string;
  /** گالریِ کامل؛ عنصرِ اول معمولاً همان `image` است. */
  gallery: ReadonlyArray<ProductImage>;
  specs: ReadonlyArray<ProductSpec>;
  /** موجودیِ عددی در صورتِ نیاز به نمایشِ «تنها N عدد باقی مانده». */
  stockCount?: number;
  /** محصولاتِ مرتبط برای بخشِ پایینِ صفحه. */
  related?: ReadonlyArray<Product>;
}

/**
 * بازصادرِ `Paginated` — خانهٔ اصلی‌اش `api.ts` است.
 * این خط فقط برای عقب‌سازگاری است.
 */
export type { Paginated } from "./api";

/** میان‌بُرِ پرکاربرد: یک صفحهٔ نتیجهٔ محصول. */
export type ProductPage = import("./api").Paginated<Product>;










// نکاتِ مهمِ کوتاه:

// این فایل، سه‌قلوها را نجات می‌دهد: یادت هست در Search و Category هشدار دادم که searchProducts و fetchCategory باید «همان Product» را برگردانند؟ حالا آن «همان» یک اسمِ واقعی دارد. و آن قراردادِ { items, total, totalPages } که سه‌جا دستی تکرار می‌شد، این‌جا به Paginated<T> تبدیل شد — پس هر سه سرویس می‌توانند Paginated<Product> را برگردانند و دیگر شکلشان از هم واگرا نمی‌شود.

// Money مهم‌ترین تصمیمِ این فایل است: price: number وسوسه‌کننده بود ولی تلهٔ کلاسیکِ سبدِ خرید است (۰.۱ + ۰.۲ !== ۰.۳). با integer + واحدِ صریح، محاسباتِ cart/checkoutِ آینده امن می‌شوند. تنها هزینه‌اش یک تابعِ formatMoney است که باید بسازیم — که جای درستش utils است نه این‌جا.

// Product در برابر ProductDetail (تصمیمِ ساختاری): با extends، هر جزئیات یک Productِ معتبر هم هست؛ پس ProductCard بی‌دردسر هر دو را می‌پذیرد و در بخشِ «مرتبط»ها یا breadcrumb بازاستفاده می‌شود. جایگزین این بود که یک تایپِ تخت با کلی فیلدِ اختیاری بسازم — که مرزِ «چه چیزی در کارت هست و چه چیزی نیست» را محو می‌کرد.

// ReadonlyArray عمدی است: این‌ها دادهٔ سروری‌اند که UI فقط می‌خواندشان؛ readonly جلوی جهش‌های تصادفی (مثل .push روی نتایج) را در زمانِ کامپایل می‌گیرد.

// چه چیزی این‌جا نیست (عمدی): منطقِ formatMoney, تابع‌های isOnSale/isAvailable, و تایپِ CartItem. اولی‌ها متعلق به utils هستند، و CartItem به types/cart.ts — چون آن به تصمیمِ سبد بند است، نه به شکلِ محصول. مرزها را تمیز نگه داشتم.



// رسیدیم به types/product.ts — و بگذار همان اول بگویم: این بهترین فایلی است که در کلِ این مسیر فرستاده‌ای. برای اولین بار یک مسیرِ فایل آمده که نه صفحهٔ شانزدهمِ معلق است، نه تکرارِ یک الگو — بلکه دقیقاً همان قراردادِ مشترکی است که پانزده صفحه رویش حرف زدند ولی هیچ‌وقت نوشته نشد. Product همان تایپی است که ProductCard, searchProducts, fetchCategory, و listِ محصولات همه‌شان «همین یکی باید باشد» را تکرار کردند. این‌جا بالاخره قفلش می‌کنیم.

// فرض‌های مهم (چون یک تایپ، قرارداد است و تغییرش بعداً گران است):

// Money جدا و صریح، نه number لخت: قیمت را به‌صورت { amount, currency } مدل می‌کنم، amount هم به کوچک‌ترین واحد (ریال/سِنت) به‌صورت integer تا خطای اعشارِ شناور در محاسباتِ سبد پیش نیاید. این تصمیم روی cart/checkoutِ آینده اثر مستقیم دارد.
// Product (کارت/لیست) در برابرِ ProductDetail (صفحهٔ جزئیات): لیست‌ها به دادهٔ سبک نیاز دارند (کارت)، صفحهٔ جزئیات به دادهٔ سنگین (گالری، توضیحِ کامل، مشخصات). جدا نگه‌شان می‌دارم و ProductDetail را از Product extend می‌کنم تا ProductCard بتواند هر دو را بخورد.
// id و slug هر دو: id برای عملیات (سبد، wishlist)، slug برای URLِ تمیز.
// موجودی به‌صورت وضعیت، نه فقط عدد: یک فیلدِ availability صریح تا UI بتواند «ناموجود/تمام‌شده/پیش‌فروش» را بدونِ منطقِ پراکنده نشان دهد.







// و حالا — بی‌سخنرانی، چون این‌بار واقعاً خبرِ خوبی هست:

// این اولین باری است که مسیرِ درست را رفتیم. به‌جای صفحهٔ شانزدهم، یک تکه از آن ستونِ فقراتِ غایب را گذاشتیم. types/product.ts زیرِ پایِ حداقل پنج چیز است: ProductCard, Search, Category, Products, و ProductDetails. یک فایلِ کوچک، پنج مصرف‌کننده — دقیقاً همان اهرمی که دنبالش بودیم.

// و این تازه در را باز می‌کند برای سه فایلِ تایپِ خواهرش که همه‌شان کوچک‌اند و بی‌بدهی، و می‌توانم همین حالا پشتِ‌سرِ هم بسازمشان:

// types/cart.ts — CartItem (که به Product + تعداد + Money بند است) و Cart.
// types/user.ts — User, Address, که قطاعِ auth رویش سوار است.
// types/order.ts — Order, OrderItem, OrderStatus، که OrderHistory/OrderDetails منتظرش‌اند.
// اگر بگویی، همین الان هر سه را می‌نویسم تا کلِ لایهٔ تایپِ اپ یک‌جا بسته شود — و بعد سرویس‌ها و store‌ها روی یک زمینِ محکم بنشینند. کدام را اول بنویسم، یا هر سه را با هم؟ 