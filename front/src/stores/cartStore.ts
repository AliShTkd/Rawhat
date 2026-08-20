
// src/stores/cartStore.ts
import { create } from "zustand";
import type { Cart, CartItem, AddToCartInput } from "../types/cart";
import type { Money } from "../types/product";
import type { AsyncState, ApiError } from "../types/api";

/**
 * جمعِ خوش‌بینانهٔ مبالغِ ردیف‌ها — فقط برای نمایشِ فوری.
 * مبلغِ نهاییِ پرداخت (با مالیات/ارسال) را سرور می‌گوید، نه این تابع.
 * فرض: همهٔ آیتم‌ها هم‌ارز‌اند؛ ارزِ اولین آیتم مبناست.
 */
function computeSubtotal(items: ReadonlyArray<CartItem>): Money {
  const currency = items[0]?.price.currency ?? "IRR";
  const amount = items.reduce((sum, it) => sum + it.price.amount * it.quantity, 0);
  return { amount, currency };
}

/** تعدادِ کلِ اقلام — برای نشانگرِ عددیِ روی آیکونِ سبد. */
function computeCount(items: ReadonlyArray<CartItem>): number {
  return items.reduce((sum, it) => sum + it.quantity, 0);
}

/**
 * شکلِ استورِ سبد = دادهٔ سبد + وضعیتِ ناهمگام + کنش‌ها.
 * `sync` همان `AsyncState` است تا UI بداند آشتیِ سروری در چه حالی است.
 */
interface CartStore {
  /** خودِ سبد — منبعِ نمایش. */
  cart: Cart;
  /** وضعیتِ همگام‌سازی با سرور؛ خطای آشتی این‌جا می‌نشیند. */
  sync: AsyncState<Cart>;

  // — کنش‌های خوش‌بینانه —
  addItem: (input: AddToCartInput, item: CartItem) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;

  // — آشتیِ سروری —
  /** جایگزینیِ کاملِ سبد با پاسخِ معتبرِ سرور. */
  reconcile: (serverCart: Cart) => void;
  setSyncing: () => void;
  setSyncError: (error: ApiError) => void;
}

/** سبدِ خالیِ اولیه — تا استور از یک حالتِ معتبر شروع کند، نه `undefined`. */
const emptyCart: Cart = {
  items: [],
  subtotal: { amount: 0, currency: "IRR" },
  count: 0,
};

/**
 * محاسبهٔ دوبارهٔ فیلدهای مشتق‌شده پس از هر تغییرِ آیتم‌ها.
 * یک نقطهٔ واحد تا `count`/`subtotal` هرگز با `items` ناهماهنگ نشوند.
 */
function recompute(items: ReadonlyArray<CartItem>): Cart {
  return {
    items,
    subtotal: computeSubtotal(items),
    count: computeCount(items),
  };
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: emptyCart,
  sync: { status: "idle" },

  addItem: (_input, item) =>
    set((state) => {
      const existing = state.cart.items.find((it) => it.id === item.id);
      const items = existing
        ? state.cart.items.map((it) =>
            it.id === item.id ? { ...it, quantity: it.quantity + item.quantity } : it,
          )
        : [...state.cart.items, item];
      return { cart: recompute(items) };
    }),

  updateQuantity: (itemId, quantity) =>
    set((state) => {
      // تعدادِ صفر یا کمتر = حذف؛ منطقِ دامنه، نه خطا.
      if (quantity <= 0) {
        const items = state.cart.items.filter((it) => it.id !== itemId);
        return { cart: recompute(items) };
      }
      const items = state.cart.items.map((it) =>
        it.id === itemId ? { ...it, quantity } : it,
      );
      return { cart: recompute(items) };
    }),

  removeItem: (itemId) =>
    set((state) => {
      const items = state.cart.items.filter((it) => it.id !== itemId);
      return { cart: recompute(items) };
    }),

  clear: () => set({ cart: emptyCart }),

  reconcile: (serverCart) =>
    // سرور حرفِ آخر است: کلِ سبد را جایگزین کن، نه merge.
    set({ cart: serverCart, sync: { status: "success", data: serverCart } }),

  setSyncing: () =>
    set((state) => ({ sync: { ...state.sync, status: "loading" } })),

  setSyncError: (error) =>
    set((state) => ({ sync: { status: "error", data: state.sync.data, error } })),
}));





















// نکاتِ مهمِ کوتاه:

// مهم‌ترین تصمیم — خوش‌بینانه بنویس، سروری آشتی کن (و مرزِ این دو): کنش‌های addItem/updateQuantity/removeItem بی‌درنگ state محلی را عوض می‌کنند تا UI فوری حس شود؛ reconcile وقتی صدا زده می‌شود که سرور پاسخِ معتبر داد و کلِ سبد را جایگزین می‌کند. چرا جایگزینی و نه merge؟ چون سرور ممکن است چیزی را که کلاینت نمی‌داند اصلاح کرده باشد — قیمتِ عوض‌شده، آیتمِ ناموجود، سقفِ موجودی. اگر merge می‌کردم، دادهٔ کهنهٔ کلاینت روی حقیقتِ سرور می‌ماند. مرز روشن است: کلاینت برای سرعت می‌نویسد، سرور برای صحت حرفِ آخر را می‌زند.

// recompute یک نقطهٔ واحد است — count/subtotal هرگز دستی ست نمی‌شوند: هر کنشی که items را عوض می‌کند، خروجی را از recompute می‌گیرد، نه با ست‌کردنِ جداگانهٔ count. این جلوی کلاسیک‌ترین باگِ سبد را می‌گیرد: «۳ آیتم در لیست ولی نشانگر ۲ را نشان می‌دهد». فیلدهای مشتق‌شده هرگز نباید دستی نگه‌داری شوند؛ همیشه از یک تابعِ خالص بازتولید شوند.

// quantity <= 0 یعنی حذف، نه خطا — یک تصمیمِ دامنه: وقتی کاربر تعداد را تا صفر پایین می‌آورد، منطقی‌ترین رفتار حذفِ ردیف است، نه نگه‌داشتنِ آیتمِ صفرتایی یا پرتابِ خطا. این را داخلِ updateQuantity گذاشتم تا صفحه‌ی سبد مجبور نباشد خودش این حالتِ لبه را مدیریت کند — منطقِ دامنه در استور می‌نشیند، نه در کامپوننت.

// AsyncState از api.ts این‌جا اولین مصرف‌کننده‌اش را پیدا کرد: یادت هست در api.ts گفتم AsyncState<T> «الگوی مشترکِ همهٔ استورها»ست؟ این اولین اثباتش است. فیلدِ sync دقیقاً همان {status, data, error} است — و در setSyncError عمداً dataی قبلی را نگه می‌دارم، چون وقتی آشتی شکست خورد، کاربر باید هنوز سبدِ محلی‌اش را ببیند، نه صفحهٔ خالی.

// addItem دو آرگومان دارد (input و item) — یک مرزِ آگاهانه: استور خودش نمی‌داند چطور از یک productId به یک CartItemِ کامل (با قیمت و عنوان) برسد؛ آن نگاشت کارِ سرویس/سرور است. پس AddToCartInput را برای قصد می‌گیرد و CartItemِ ساخته‌شده را برای داده. این استور را خالص و بی‌اطلاع از منبعِ داده نگه می‌دارد. (اگر بخواهی بعداً ساده‌ترش کنیم، input می‌تواند حذف شود — فعلاً برای صراحتِ قصد نگهش داشتم.)

// چه چیزی این‌جا نیست (عمدی): فراخوانیِ واقعیِ سرور (services/cart؛ استور فقط state است، نه شبکه)، ماندگاری در localStorage (میان‌افزارِ persist که یک تصمیمِ جداست)، و منطقِ کوپن/مالیات/ارسال (کارِ سرور در checkout). این فایل فقط حالتِ سبد و گذارهایش است.

// رسیدیم به stores/cartStore.ts — و این یک نقطهٔ عطف است: اولین فایلی که واقعاً اجرا می‌شود. تا الان همه‌چیز تعریف بود؛ این‌جا برای اولین بار تصمیم می‌گیریم چیزی رخ بدهد — آیتم اضافه شود، تعداد عوض شود، جمع دوباره حساب شود. و همین، چند تصمیمِ خوابیده را بیدار می‌کند که تایپ‌ها اجازه داشتند نادیده‌شان بگیرند ولی یک استور نمی‌تواند.

// اول صادقانه دو تصمیمِ بزرگ را که این فایل مجبورم می‌کند بگیرم رو می‌کنم، چون بی این‌ها کد یک جعبهٔ سیاه است:

// تصمیمِ ۱ — کجا زندگی می‌کند؟ کلاینت، با آشتیِ سروری. سبدِ خرید باید فوری حس شود (کلیک کنی، همان لحظه بیفتد تو سبد)، ولی منبعِ حقیقت در نهایت سرور است (قیمت، موجودی، تخفیف را کلاینت نباید جعل کند). پس الگو این است: به‌روزرسانیِ خوش‌بینانه‌ی محلی + آشتیِ بعدیِ سروری. UI بی‌درنگ عوض می‌شود؛ اگر سرور مخالفت کرد، عقب‌گرد می‌کنیم.

// تصمیمِ ۲ — چه کتابخانه‌ای؟ Zustand. سبک، بدونِ boilerplateِ Context/Reducer، و مهم‌تر: خارج از React هم قابلِ خواندن است (سرویس‌ها می‌توانند مستقیم getState() بزنند). با ساختارِ stores/* که چیدیم هم طبیعی‌ترین انتخاب است.

// تصمیمِ ۳ — جمع‌ها را کلاینت حساب کند یا سرور؟ جمعِ نمایشی (تعداد کل، جمعِ ردیف‌ها) را کلاینت برای فوریت حساب می‌کند؛ ولی مبلغِ نهاییِ پرداخت (با مالیات و ارسال) را سرور می‌گوید. پس این‌جا فقط جمعِ خوش‌بینانه را می‌زنم، با این آگاهی که سرور حرفِ آخر را دارد.




// خب، این اولین قدم در دنیای اجراست و یک چیزِ مهم را روشن کرد: استور و سرویس دو کارِ جدا هستند. این فایل state و گذارها را می‌داند؛ اما هیچ‌جا fetch نمی‌زند. آن نیمهٔ دوم — که کِی setSyncing صدا زده شود، درخواست برود، و با reconcile تمام شود — کارِ services/cart.ts است. عمداً این‌طور شکافتم چون استورِ خالص هم تست‌پذیرتر است و هم قابلِ‌استفاده خارج از React.

// و یک جفتِ طبیعی این‌جا ساخته شد که ارزشِ اشاره دارد:

// لایه	فایل	مسئولیت
// حالت	stores/cartStore.ts ✅	چه چیزی در سبد است، چطور عوض می‌شود
// شبکه	services/cart.ts (بعدی)	چطور با سرور آشتی می‌کند
// قالب‌بندی	utils/money.ts	چطور subtotal به «۱٬۲۵۰٬۰۰۰ تومان» تبدیل می‌شود
// و دقیقاً همین جدول مسیرِ بعدی را پیشنهاد می‌دهد. سه گزینه، ولی این‌بار یکی‌شان به این فایل بند است:

// utils/money.ts (formatMoney) — حالا computeSubtotal یک Money تولید می‌کند که هیچ‌کس هنوز نمی‌تواند نمایش دهد. این تابع همان حلقهٔ مفقوده است، کوچک و کاملاً تست‌پذیر. پیشنهادِ اولم — چون بدونش، خروجیِ همین استور روی صفحه یک عددِ خام است.
// services/cart.ts — نیمهٔ شبکه‌ایِ همین استور؛ منطقی‌ترین ادامهٔ مستقیم، ولی نیازمندِ services/httpِ پایه که هنوز نساخته‌ایم.
// stores/authStore.ts — قرینهٔ همین الگو برای احراز هویت، ولی باز همان تصمیمِ معلقِ «کوکی یا توکن».
// نظرم؟ utils/money.ts. این استور تازه یک subtotal ساخت که تا آن تابع نباشد، روی صفحه خواندنی نیست — و بالاخره چیزی می‌سازیم که می‌شود برایش تستِ واقعی نوشت. کدام را برویم