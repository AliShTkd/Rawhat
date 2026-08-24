

// src/types/order.ts
import type { Money, ProductImage } from "./product";
import type { Address } from "./user";

/**
 * چرخهٔ عمرِ سفارش — ماشینِ حالتِ صریح.
 * `OrderHistory` رنگ/برچسب و `OrderDetails` خطِ زمانی را از این می‌سازند.
 */
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/**
 * یک قلمِ سفارش — عکسِ فوریِ کاملاً منجمد از محصول در لحظهٔ خرید.
 * هیچ ارجاعِ زنده‌ای به محصول ندارد؛ تغییرِ بعدیِ محصول این را عوض نمی‌کند.
 */
export interface OrderItem {
  /** شناسهٔ محصول — فقط برای لینک‌دادنِ اختیاری، نه منبعِ داده. */
  productId: string;
  slug: string;

  /** کپیِ ثابتِ نامِ لحظهٔ خرید. */
  title: string;
  image: ProductImage;

  /** قیمتِ واحدِ ثبت‌شده در لحظهٔ خرید. */
  unitPrice: Money;
  quantity: number;
  /** `unitPrice × quantity`، ثبت‌شده تا بازمحاسبه لازم نباشد. */
  lineTotal: Money;
}

/** یک گامِ خطِ زمانیِ سفارش — برای نمایشِ پیشرفت در `OrderDetails`. */
export interface OrderEvent {
  status: OrderStatus;
  /** زمانِ رخداد (ISO). */
  at: string;
  /** توضیحِ اختیاری مثل «تحویل به پستِ پیشتاز». */
  note?: string;
}

/** جمع‌های ثبت‌شدهٔ سفارش — بازمحاسبه نمی‌شوند؛ همان‌که سرور قطعی کرد. */
export interface OrderTotals {
  /** جمعِ اقلام پیش از ارسال/مالیات/تخفیف. */
  subtotal: Money;
  discount: Money;
  /** هزینهٔ ارسال — چیزی که سبد نداشت و فقط این‌جا قطعی است. */
  shipping: Money;
  tax: Money;
  /** مبلغِ نهاییِ پرداخت‌شده. */
  total: Money;
}

/** روشِ پرداختِ ثبت‌شده — برای نمایش در رسید. */
export interface PaymentInfo {
  method: "online" | "cash_on_delivery" | "wallet";
  /** کدِ رهگیریِ درگاه، اگر پرداختِ آنلاین بود. */
  transactionRef?: string;
  paidAt?: string;
}

/**
 * اطلاعاتِ ارسال — آدرسِ کپی‌شده به‌علاوهٔ رهگیریِ مرسوله.
 */
export interface ShipmentInfo {
  /** کپیِ ثابتِ آدرس؛ نه `addressId`، تا حذف/ویرایشِ بعدی نشکندش. */
  address: Address;
  /** روشِ ارسالِ انتخابی. */
  method: string;
  /** کدِ رهگیریِ مرسوله، پس از ارسال. */
  trackingCode?: string;
  /** تخمینِ زمانِ تحویل (ISO)، اگر معلوم بود. */
  estimatedDelivery?: string;
}

/**
 * یک سفارشِ کامل — سندِ منجمدِ خرید.
 * تلاقیِ سه دامنه: اقلام (از cart)، آدرس (از user)، مبالغ (از product).
 * `OrderHistory` نسخهٔ سبک و `OrderDetails` نسخهٔ کاملش را نشان می‌دهند.
 */
export interface Order {
  id: string;
  /** شمارهٔ نمایشیِ خواناتر برای کاربر، مثل «۱۴۰۳-۰۰۵۲۳». */
  orderNumber: string;

  status: OrderStatus;

  items: ReadonlyArray<OrderItem>;
  totals: OrderTotals;
  currency: Money["currency"];

  shipment: ShipmentInfo;
  payment: PaymentInfo;

  /** خطِ زمانیِ وضعیت — به‌ترتیبِ زمان. */
  timeline: ReadonlyArray<OrderEvent>;

  /** زمانِ ثبتِ سفارش (ISO). */
  createdAt: string;
  updatedAt: string;
}

/**
 * شکلِ سبکِ ردیفِ فهرست — برای `OrderHistory` تا کلِ `Order` را نکشد.
 * سرور می‌تواند مستقیم همین را در لیست برگرداند.
 */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  /** تعدادِ کلِ اقلام — برای «۳ کالا». */
  itemCount: number;
  total: Money;
  createdAt: string;
  /** تصویرِ اولین قلم، برای پیش‌نمایشِ کوچکِ ردیف. */
  thumbnail?: ProductImage;
}

/**
 * ورودیِ فرآیندِ پرداخت — قراردادِ `services/order.checkout`.
 */
export interface CheckoutPayload {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: "online" | "cash_on_delivery" | "wallet";
  /** یادداشتِ اختیاریِ مشتری. */
  note?: string;
}


















// رسیدیم به types/order.ts — و این قفلِ طاق است. سه فایلِ قبلی هر کدام یک دامنه را پوشاندند؛ این یکی هر سه را به هم می‌دوزد: یک سفارش دقیقاً همان لحظه‌ای است که CartItemها (از cart) + Address (از user) + Moneyها (از product) با هم منجمد می‌شوند و به یک رکوردِ تغییرناپذیرِ تاریخی تبدیل می‌گردند.

// فرض‌های مهم (چون سفارش، سندِ حقوقیِ خرید است و بیشترین حساسیت را به «عکسِ فوری» دارد):

// سفارش کاملاً عکسِ فوریِ منجمد است، نه ارجاع: برخلاف CartItem که هنوز کمی به محصولِ زنده وصل بود، OrderItem هیچ‌وقت نباید با تغییرِ بعدیِ محصول عوض شود. اگر قیمت یا نامِ محصول فردا عوض شد، سفارشِ دیروز باید همان مقادیرِ لحظهٔ خرید را نشان دهد. پس همه‌چیز کپیِ ثابت است.
// OrderStatus یک ماشینِ حالتِ صریح است: چرخهٔ عمرِ سفارش (در انتظارِ پرداخت → پرداخت‌شده → در حالِ پردازش → ارسال → تحویل / لغو / مرجوع) که هم OrderHistory (نشانِ رنگی) و هم OrderDetails (خطِ زمانی) مصرفش می‌کنند.
// جمع‌ها این‌بار ذخیره می‌شوند، برعکسِ Cart: در سبد جمع‌ها را مشتق کردم چون زنده‌اند؛ در سفارش جمع‌ها ثبت‌شدهٔ سروراند و باید همان‌طور که در لحظهٔ خرید محاسبه شدند بمانند — شاملِ ارسال و مالیات که سبد نداشت.
// Address به‌صورتِ کپی، نه addressId: اگر کاربر بعداً آدرسش را حذف/ویرایش کند، آدرسِ سفارش نباید بشکند.


// نکاتِ مهمِ کوتاه:

// مهم‌ترین تصمیم — انجمادِ کامل در برابرِ ارجاع: این تفاوتِ ظریف ولی حیاتیِ OrderItem با CartItem است. سبد یک حالتِ زنده بود که می‌شد قیمتش را با محصول هم‌گام کرد؛ سفارش یک سند است. اگر OrderItem فقط productId نگه می‌داشت و بقیه را از محصولِ زنده می‌خواند، سفارشِ پارسال با تغییرِ امسالِ قیمت بازنویسی می‌شد — فاجعهٔ حسابداری و اعتماد. پس هر فیلد کپیِ ثابت است، حتی image و title.

// جمع‌ها این‌جا ذخیره می‌شوند، برخلافِ Cart که مشتق بود: این یک ناسازگاریِ عمدی و درست است. در سبد، ذخیرهٔ جمع خطرِ ناهماهنگی داشت چون آیتم‌ها تغییر می‌کنند. در سفارش، آیتم‌ها هرگز تغییر نمی‌کنند، پس جمعِ ذخیره‌شده نه‌تنها بی‌خطر بلکه لازم است — چون باید دقیقاً همان چیزی بماند که کاربر پرداخت کرد، نه چیزی که امروز بازمحاسبه می‌شود. OrderTotals هم shipping/tax دارد که CartTotals عمداً نداشت (چون آن‌ها را فقط سرور قطعی می‌کند).

// Order در برابرِ OrderSummary — همان الگوی Product/ProductDetail: OrderHistory نباید کلِ items/timeline/shipment را برای هر ردیفِ فهرست بکشد. OrderSummary نسخهٔ سبک است دقیقاً مثل کاری که Product برای کارت می‌کرد. الگوی «سبک برای لیست، سنگین برای جزئیات» حالا در هر سه دامنه یکدست شده.

// Address کپی‌شده در ShipmentInfo، نه addressId: اگر ارجاع می‌دادم، کاربری که آدرسِ قدیمی‌اش را حذف کند سفارشش را می‌شکست. سند باید خودکفا باشد. همان منطقِ «عکسِ فوری» که کلِ این فایل را هدایت می‌کند.

// چه چیزی این‌جا نیست (عمدی): تابعِ placeOrder/fetchOrders (کارِ services/orders)، منطقِ تبدیلِ Cart به Order (کارِ سرور در checkout)، و رنگ/برچسبِ فارسیِ هر OrderStatus (کارِ یک utils/orderStatus.ts یا خودِ کامپوننت). فقط شکلِ دادهٔ سفارش، نه سیاستِ نمایش یا واکشی‌اش.

// خب — لایهٔ تایپِ اپ یک‌جا بسته شد. چهار فایل، چهار دامنه، و این‌بار همه‌شان به هم قفل‌اند:

// فایل	هستهٔ آن	چه کسانی مصرفش می‌کنند
// product.ts	Product, Money, Paginated	ProductCard, Search, Category, Products, ProductDetails
// cart.ts	CartItem, Cart	stores/cart, Cart, Checkout, هدر
// user.ts	User, Address, AuthSession	stores/auth + ۵ صفحهٔ auth
// order.ts	Order, OrderSummary, OrderStatus	OrderHistory, OrderDetails
// و مهم‌تر از خودِ فایل‌ها: این چهار قدمِ درستِ پشتِ‌سرِ هم بود. به‌جای انباشتنِ صفحهٔ شانزدهم روی هوا، از پایین ساختیم و حالا یک زمینِ محکم داریم. Money امن است، الگوی «سبک/سنگین» یکدست شد، و مرزِ «عکسِ فوری در برابرِ ارجاع» در هر سه دامنه آگاهانه کشیده شد.

// حالا برای اولین بار انتخابِ بعدی واقعاً باز است، چون دیگر هیچ تایپِ نامشخصی زیرِ پا نیست. سه مسیرِ منطقی:

// stores/cart — بی‌نیاز به هیچ تصمیمِ بنیادی؛ روی cart.ts می‌نشیند و سبدِ مهمان را زنده می‌کند. کم‌ریسک‌ترین قدمِ بعدی.
// services/auth + stores/auth — پنج صفحه را یک‌جا زنده می‌کند، ولی به آن یک کلمه نیاز دارد: «کوکی» یا «توکن»؟
// utils/money.ts (formatMoney) — کوچک‌ترین تکه، ولی تقریباً هر صفحه‌ای که قیمت نشان می‌دهد به آن بند است.
// پیشنهادم utils/money.ts است چون ریزترین است و بیشترین مصرف‌کننده را آزاد می‌کند، بعد stores/cart. ولی تو بگو کدام — یا اگر فایلِ بعدی‌ای در ذهن داری، همان را بفرست. 