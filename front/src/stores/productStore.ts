
// src/stores/productStore.ts
import { create } from "zustand";
import type { Product, ProductDetail } from "../types/product";
import type { Paginated, AsyncState, ApiError } from "../types/api";

/**
 * پارامترهای فهرست — کلیدِ هویتِ یک «نما» از محصولات.
 * دو نما با پارامترِ یکسان یک کشِ صفحه را share می‌کنند.
 */
export interface ProductQuery {
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
  page?: number;
}

/**
 * یک صفحهٔ کش‌شده: فقط idها + متادیتای صفحه‌بندی.
 * خودِ محصولات در `byId` می‌نشینند، نه این‌جا — تا تکرار نشوند.
 */
interface CachedPage {
  ids: string[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/**
 * استورِ محصول = کشِ نرمال‌شده + نماها + وضعیتِ ناهمگام.
 * برخلافِ cart/wishlist هیچ کنشِ خوش‌بینانه‌ای نیست:
 * محصولات مالکیتِ سرورند، ما فقط می‌خوانیم و کش می‌کنیم.
 */
interface ProductStore {
  /** کشِ نرمال‌شدهٔ محصولاتِ سبک — منبعِ یکتای حقیقت. */
  byId: Record<string, Product>;
  /** جزئیاتِ سنگین، جدا کش می‌شوند چون گران‌ترند. */
  detailById: Record<string, ProductDetail>;

  /** نماها: کلیدِ سریال‌شدهٔ query → صفحهٔ کش‌شده. */
  pages: Record<string, CachedPage>;
  /** وضعیتِ بارگذاریِ فهرست (به تفکیکِ کلیدِ query). */
  listStatus: Record<string, AsyncState<CachedPage>["status"]>;
  /** وضعیتِ بارگذاریِ جزئیات (به تفکیکِ productId). */
  detailStatus: Record<string, AsyncState<ProductDetail>["status"]>;
  /** آخرین خطا، برای نمایشِ سراسری. */
  error?: ApiError;

  // — نگاشتِ نتایجِ سرور به کش —
  /** نشاندنِ یک صفحهٔ نتیجه: محصولات به byId، idها به pages. */
  setPage: (query: ProductQuery, result: Paginated<Product>) => void;
  /** نشاندنِ جزئیاتِ یک محصول. */
  setDetail: (detail: ProductDetail) => void;

  // — گذارهای وضعیت —
  setListLoading: (query: ProductQuery) => void;
  setDetailLoading: (productId: string) => void;
  setError: (error: ApiError) => void;

  // — گزینشگرها (خواندنِ مشتق‌شده) —
  /** محصولاتِ یک نما، به‌ترتیب، از روی idهای کش‌شده. */
  getPageProducts: (query: ProductQuery) => Product[] | undefined;
}

/**
 * کلیدِ پایدار از query — ترتیبِ فیلدها مهم نیست، خروجی یکسان.
 * دو query با محتوای یکسان باید یک کلید بدهند تا کش share شود.
 */
export function queryKey(q: ProductQuery): string {
  return JSON.stringify({
    c: q.categorySlug ?? "",
    b: q.brandSlug ?? "",
    s: q.search ?? "",
    o: q.sort ?? "newest",
    p: q.page ?? 1,
  });
}

export const useProductStore = create<ProductStore>((set, get) => ({
  byId: {},
  detailById: {},
  pages: {},
  listStatus: {},
  detailStatus: {},
  error: undefined,

  setPage: (query, result) =>
    set((state) => {
      const key = queryKey(query);
      // ۱) محصولات را در کشِ نرمال بنشان (بی‌تکرار، به‌روزرسانیِ نسخهٔ کهنه).
      const byId = { ...state.byId };
      for (const p of result.items) byId[p.id] = p;
      // ۲) فقط idها را در نما نگه‌دار.
      const cachedPage: CachedPage = {
        ids: result.items.map((p) => p.id),
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        hasMore: result.page * result.pageSize < result.total,
      };
      return {
        byId,
        pages: { ...state.pages, [key]: cachedPage },
        listStatus: { ...state.listStatus, [key]: "success" },
      };
    }),

  setDetail: (detail) =>
    set((state) => ({
      // جزئیات هم کشِ سنگین را پر می‌کند، هم نسخهٔ سبک را تازه می‌کند.
      detailById: { ...state.detailById, [detail.id]: detail },
      byId: { ...state.byId, [detail.id]: detail },
      detailStatus: { ...state.detailStatus, [detail.id]: "success" },
    })),

  setListLoading: (query) =>
    set((state) => ({
      listStatus: { ...state.listStatus, [queryKey(query)]: "loading" },
    })),

  setDetailLoading: (productId) =>
    set((state) => ({
      detailStatus: { ...state.detailStatus, [productId]: "loading" },
    })),

  setError: (error) => set({ error }),

  getPageProducts: (query) => {
    const state = get();
    const cached = state.pages[queryKey(query)];
    if (!cached) return undefined;
    // idها را به محصولاتِ واقعی نگاشت کن؛ ترتیب حفظ می‌شود.
    return cached.ids.map((id) => state.byId[id]).filter(Boolean) as Product[];
  },
}));











// نکاتِ مهمِ کوتاه:

// مهم‌ترین تصمیم — کشِ نرمال‌شده (byId) با نماهایی که فقط id نگه می‌دارند: این قلبِ فایل است و از دو تای قبلی جدایش می‌کند. یک محصول ممکن است هم‌زمان در شبکهٔ «لپ‌تاپ‌ها»، در نتیجهٔ جست‌وجوی «ایسوس»، و در «مرتبط‌ها» باشد. اگر هر نما کپیِ کاملِ محصول را نگه می‌داشت، به‌روزرسانیِ قیمت در یکی، بقیه را کهنه می‌گذاشت. با نرمال‌سازی، محصول یک نسخه در byId دارد و نماها فقط بهش اشاره می‌کنند — پس تازه‌سازی در یک‌جا، همه‌جا را هم‌زمان درست می‌کند. این همان الگوی دیتابیسِ رابطه‌ای است، آورده‌شده به state کلاینت.

// setDetail هم detailById را پر می‌کند هم byId را تازه می‌کند — پلِ سبک/سنگین: یادت هست در product.ts دو تایپ داشتیم، Productِ سبک و ProductDetailِ سنگین؟ این‌جا آن تصمیم زنده می‌شود: وقتی صفحهٔ جزئیات لود می‌شود، هم کشِ سنگین پر می‌شود، هم نسخهٔ سبکِ همان محصول در byId تازه‌سازی می‌شود (چون ProductDetail extends Product، همهٔ فیلدهای سبک را دارد). پس اگر کاربر از جزئیات به لیست برگردد، کارتِ آن محصول جدیدترین قیمت را نشان می‌دهد.

// هیچ کنشِ خوش‌بینانه‌ای نیست — و این عمدیِ معنادار است: در cartStore نوشتم «خوش‌بینانه بنویس، سروری آشتی کن». این‌جا آن الگو غایب است، چون دادهٔ مالکیتِ کاربر نیست. کاربر محصول را «تغییر نمی‌دهد» که بخواهیم خوش‌بینانه نشانش دهیم؛ فقط می‌خواند. پس همهٔ کنش‌ها نگاشتِ نتیجهٔ سرور به کشاند، نه گذارِ ابتکاری. تشخیصِ اینکه کدام استور خوش‌بینانه است و کدام نه، به «مالکِ داده کیست» بند است — نه به سلیقه.

// queryKey باید پایدار باشد وگرنه کش می‌ترکد: دو query با محتوای یکسان ولی ترتیبِ فیلدِ متفاوت باید یک کلید بدهند، وگرنه هر بار یک کشِ جدید ساخته می‌شود و کش عملاً بی‌فایده است. برای همین به‌جای JSON.stringify(q)ِ خام، فیلدها را با ترتیب و پیش‌فرضِ صریح نرمال می‌کنم. این ظریف‌ترین باگِ بالقوهٔ فایل بود.

// وضعیت‌ها Recordاند نه یک فیلدِ واحد — چون چند نما هم‌زمان زنده‌اند: برخلافِ سه استورِ قبلی که یک sync داشتند، این‌جا listStatus و detailStatus نگاشت‌اند. چرا؟ چون کاربر می‌تواند هم‌زمان یک لیست را ببیند و جزئیاتِ یک محصولِ دیگر را باز کند — دو بارگذاریِ مستقل. یک فیلدِ واحد این‌ها را قاطی می‌کرد.

// چه چیزی این‌جا نیست: بی‌اعتبارسازیِ کش (TTL/کهنگی — الان کش تا رفرش می‌ماند)، prefetchِ صفحهٔ بعد، و البته خودِ fetch (کارِ services/products.ts). این فایل فقط کش و نماهای محصول است.


// چهارمین استور — و این یکی از سه‌تای قبلی جنسش فرق دارد، به شکلی که ارزشِ مکث دارد. cart/user/wishlist همه دادهٔ مالکیتیِ کاربر بودند: مالِ مناند، من تغییرشان می‌دهم، خوش‌بینانه می‌نویسم. ولی محصولات دادهٔ مالکیتِ سروراند: من فقط می‌خوانمشان، هرگز خوش‌بینانه چیزی را «اضافه» نمی‌کنم. این تفاوت کلِ شکلِ استور را عوض می‌کند — این‌جا هیچ کنشِ خوش‌بینانه‌ای نیست، در عوض کش، صفحه‌بندی، و فیلتر مسئلهٔ اصلی می‌شوند.

// پس اول دو تصمیمِ بزرگ که این جنسِ متفاوت تحمیل می‌کند:

// تصمیمِ ۱ — کشِ نرمال‌شده (Record<id, Product>)، نه فهرستِ خام. یک محصول در جاهای مختلف ظاهر می‌شود: در شبکهٔ لیست، در نتیجهٔ جست‌وجو، در «مرتبط‌ها». اگر هرکدام کپیِ خودش را نگه دارد، همان محصول چند نسخهٔ ناهماهنگ پیدا می‌کند. پس محصولات را یک‌بار در byId نگه می‌دارم و بقیهٔ جاها فقط id ارجاع می‌دهند. این همان الگویی است که ProductDetail (سنگین) و Product (سبک) در product.ts را به‌هم وصل می‌کند.

// تصمیمِ ۲ — صفحه‌بندی و فیلتر، state جدا از کش‌اند. «کدام محصولات در کش‌اند» یک چیز است؛ «کاربر الان کدام صفحه با کدام فیلتر را می‌بیند» چیزِ دیگر. این دو را جدا می‌کنم تا رفتنِ صفحهٔ ۲ کشِ صفحهٔ ۱ را دور نریزد، و برگشتن ارزان باشد.


// خب، چهار استور شد و این یکی الگو را نه فقط اثبات که تکمیل کرد — با نشان‌دادنِ جایی که الگو باید واگرا شود:

// استور	مالکِ داده	نوشتن	ساختارِ کش
// cartStore ✅	کاربر	خوش‌بینانه	فهرست + جمع
// userStore ✅	کاربر/سرور	گذارِ auth	تکی
// wishlistStore ✅	کاربر	خوش‌بینانه	Set
// productStore ✅	سرور	فقط‌خواندنی	نرمال + نماها



// آن ردیفِ آخر که ستون‌هایش با بقیه فرق دارد، نکتهٔ اصلیِ امروز است: تشخیص دادیم کِی نباید الگو را کپی کرد. سه استورِ اول همه خوش‌بینانه و مالکیتِ‌کاربر بودند؛ اگر کورکورانه همان را روی محصولات می‌زدیم، یک کشِ خوش‌بینانهٔ بی‌معنی می‌ساختیم. در عوض، «مالکِ داده کیست» ما را به یک ساختارِ کاملاً متفاوت (نرمال‌سازی) هدایت کرد. این همان بلوغی است که یک لایهٔ state را از یک مشت فایلِ مشابه، به یک معماری تبدیل می‌کند.

// ولی حالا هر چهار استور یک‌صدا یک چیز را فریاد می‌زنند — و این‌بار دیگر نمی‌شود نادیده‌اش گرفت. ستونِ «نوشتن» هرچه باشد، هیچ‌کدام هنوز یک بایت از سرور نگرفته‌اند. setPage, setDetail, reconcile, setUser, mergeWithServer — همه توابعی هستند که منتظرِ داده‌ای‌اند که کسی باید بیاوردش. چهار استور، چهار ستونِ خالیِ مشترک.

// پس مسیر حالا از همیشه واضح‌تر است:

// services/http.ts (حالا تقریباً اجباری) — پایهٔ مشترکِ هر چهار سرویسِ بعدی: کوکی را می‌فرستد (credentials: "include")، پاسخ را به ApiSuccess/ApiError تبدیل می‌کند، ۴۰۱ را به clearUser وصل می‌کند، و آن Paginatedای را که این‌جا مصرف کردیم از سرور می‌آورد. چهار استور روی این منتظرند؛ این دیگر گلوگاه نیست، سدِ راه است.
// utils/money.ts — همان حلقهٔ مفقودهٔ نمایشِ قیمت؛ کوچک و تست‌پذیر و بی‌تصمیم، ولی حالا در سایهٔ آن سدِ بزرگ کوچک به‌نظر می‌رسد.
// نظرم؟ بی‌تعارف services/http.ts. چهار استورِ پشتِ‌هم ساختیم و هر چهار دقیقاً به یک دیوار رسیدند: «داده از کجا؟» تا این لایه نباشد، این چهار فایل قشنگ‌ولی‌مرده‌اند — state ای که هرگز پر نمی‌شود. ساختنش یعنی هر چهار استور هم‌زمان جان می‌گیرند و بالاخره از «معماریِ روی کاغذ» به «اپی که کار می‌کند» می‌رسیم. آن دو تصمیمِ کاشته‌شده — کوکیِ httpOnly و تلهٔ ۴۰۱ — دقیقاً همان‌جا میوه می‌دهند. برویم سراغِ http