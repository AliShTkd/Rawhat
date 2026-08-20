
// src/stores/filterStore.ts
import { create } from "zustand";
import type { ProductQuery } from "./productStore";

export type SortOption = "newest" | "price_asc" | "price_desc" | "rating";

/**
 * حالتِ خامِ فیلتر — همان چیزی که فرم/سایدبار نشان می‌دهد.
 * این «حالتِ نما»ست: نه دادهٔ کاربر، نه دادهٔ سرور.
 * منبعِ حقیقتش URL است؛ این استور فقط آینهٔ کاری‌اش است.
 */
interface FilterState {
  categorySlug?: string;
  brandSlug?: string;
  search: string;
  sort: SortOption;
  page: number;
  /** بازهٔ قیمت — تومان. undefined یعنی بی‌کران. */
  minPrice?: number;
  maxPrice?: number;
}

/** مقدارِ اولیهٔ فیلتر — همان چیزی که «هیچ فیلتری اعمال نشده» یعنی. */
const initialFilters: FilterState = {
  search: "",
  sort: "newest",
  page: 1,
};

interface FilterStore extends FilterState {
  // — نوشتن‌ها؛ هر تغییرِ فیلتر (جز page) صفحه را به ۱ برمی‌گرداند —
  /** انتخابِ دسته — نتیجه عوض می‌شود پس page→1. */
  setCategory: (slug?: string) => void;
  setBrand: (slug?: string) => void;
  setSearch: (q: string) => void;
  setSort: (sort: SortOption) => void;
  setPriceRange: (min?: number, max?: number) => void;
  /** فقط جابه‌جاییِ صفحه — بقیهٔ فیلترها دست‌نخورده. */
  setPage: (page: number) => void;

  /** پرکردنِ استور از روی URL هنگامِ ورود/رفرش/بازگشت. */
  hydrateFromQuery: (params: URLSearchParams) => void;
  /** بازنشانیِ کامل — دکمهٔ «حذفِ فیلترها». */
  reset: () => void;

  // — خواندنِ مشتق‌شده —
  /** خروجیِ نرمال برای productStore — پلِ بینِ دو استور. */
  toQuery: () => ProductQuery;
  /** خروجی برای نوشتن روی URL — فقط کلیدهای غیرپیش‌فرض. */
  toSearchParams: () => URLSearchParams;
  /** آیا اصلاً فیلتری فعال است؟ برای نمایشِ دکمهٔ «حذف». */
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initialFilters,

  // هر تغییرِ معیار، صفحه را صفر می‌کند — وگرنه کاربر در «صفحهٔ ۵»ِ
  // نتیجه‌ای می‌ماند که شاید فقط ۲ صفحه دارد. باگِ کلاسیکِ فیلتر+صفحه.
  setCategory: (slug) => set({ categorySlug: slug, page: 1 }),
  setBrand: (slug) => set({ brandSlug: slug, page: 1 }),
  setSearch: (q) => set({ search: q, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max, page: 1 }),

  // فقط page عوض می‌شود؛ چون خودِ page یک معیار نیست، جابه‌جایی درونِ نتیجه است.
  setPage: (page) => set({ page }),

  hydrateFromQuery: (params) => {
    const num = (v: string | null) =>
      v !== null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined;
    set({
      categorySlug: params.get("category") ?? undefined,
      brandSlug: params.get("brand") ?? undefined,
      search: params.get("q") ?? "",
      sort: (params.get("sort") as SortOption) || "newest",
      page: num(params.get("page")) ?? 1,
      minPrice: num(params.get("min")),
      maxPrice: num(params.get("max")),
    });
  },

  reset: () => set({ ...initialFilters }),

  toQuery: () => {
    const s = get();
    // فقط فیلدهای معنادار می‌روند؛ خالی‌ها حذف تا queryKey پایدار بماند.
    return {
      categorySlug: s.categorySlug,
      brandSlug: s.brandSlug,
      search: s.search || undefined,
      sort: s.sort,
      page: s.page,
    };
  },

  toSearchParams: () => {
    const s = get();
    const p = new URLSearchParams();
    // فقط مقادیرِ غیرپیش‌فرض روی URL می‌نشینند — URLِ تمیز و کوتاه.
    if (s.categorySlug) p.set("category", s.categorySlug);
    if (s.brandSlug) p.set("brand", s.brandSlug);
    if (s.search) p.set("q", s.search);
    if (s.sort !== "newest") p.set("sort", s.sort);
    if (s.page > 1) p.set("page", String(s.page));
    if (s.minPrice !== undefined) p.set("min", String(s.minPrice));
    if (s.maxPrice !== undefined) p.set("max", String(s.maxPrice));
    return p;
  },

  hasActiveFilters: () => {
    const s = get();
    return Boolean(
      s.categorySlug || s.brandSlug || s.search ||
      s.sort !== "newest" || s.minPrice !== undefined || s.maxPrice !== undefined,
    );
  },
}));
















// نکاتِ مهمِ کوتاه:

// مهم‌ترین تصمیم — URL منبعِ حقیقت، استور آینه: این چیزی است که filterStore را از چهار استورِ قبلی جدا می‌کند. آن‌ها صاحبِ state شان بودند؛ این یکی نیست. جریانِ درست این است: کاربر روی فیلتر کلیک می‌کند → استور به‌روز می‌شود → کامپوننت toSearchParams() را می‌گیرد و روی URL می‌نویسد (با navigate) → و در بازگشت/رفرش، hydrateFromQuery استور را از URL بازمی‌سازد. چرا این‌قدر روش پیچ‌وخم دارد؟ چون تنها راهِ اشتراک‌پذیر و بوکمارک‌پذیر بودنِ فیلتر همین است. اگر حقیقت در استور می‌ماند، لینکِ فیلترشده معنا نداشت و دکمهٔ Back مرورگر می‌شکست.

// page تنها معیاری است که خودش را صفر نمی‌کند — و این عمدی است: هر تغییرِ معیار (دسته، برند، جست‌وجو، مرتب‌سازی، قیمت) page را به ۱ برمی‌گرداند، ولی setPage نه. چرا؟ چون تغییرِ معیار یعنی «نتیجهٔ کاملاً جدید» — ماندن در صفحهٔ ۵ی نتیجه‌ای که شاید فقط ۲ صفحه دارد، کاربر را به یک صفحهٔ خالی می‌برد. این کلاسیک‌ترین باگِ ترکیبِ «فیلتر + صفحه‌بندی» است و این‌جا در سطحِ استور بسته شده، نه سپرده به حافظهٔ هر کامپوننت.

// toQuery پلِ مستقیم به productStore است — حلقه بسته شد: یادت هست فایلِ قبل ProductQuery و queryKey را ساخت و گفتم «کلید باید پایدار باشد»؟ این‌جا آن قرارداد مصرف می‌شود: toQuery() خروجیِ نرمال می‌دهد (خالی‌ها → undefined) تا وقتی به queryKey می‌رسد، دو فیلترِ محتوایاً یکسان یک کلید بسازند و کش share شود. دو استور که جداگانه نوشتیم، این‌جا از دو سر به یک نقطه می‌رسند.

// toSearchParams فقط غیرپیش‌فرض‌ها را می‌نویسد — URLِ تمیز: sort=newest یا page=1 روی URL نمی‌نشیند، چون پیش‌فرض‌اند و نوشتن‌شان فقط URL را شلوغ می‌کند. یک URLِ بدونِ فیلتر باید تمیز باشد (/products)، نه /products?sort=newest&page=1. این قرینهٔ hydrateFromQuery است: نبودِ کلید = مقدارِ پیش‌فرض.

// هیچ AsyncStateای این‌جا نیست — و این نکته‌دار است: چهار استورِ قبلی همه یک نیمهٔ شبکه‌ای (sync/auth/listStatus) داشتند. این یکی ندارد، چون فیلتر هرگز با سرور حرف نمی‌زند — فقط productStore را می‌راند که خودش شبکه دارد. filterStore صددرصد state محلیِ همگام است، بی‌هیچ گذارِ ناهمگام. این تأییدِ دیگری است بر اینکه «شکلِ استور از ماهیتِ داده می‌آید»، نه از یک قالبِ ثابت.

// چه چیزی این‌جا نیست: خودِ همگام‌سازیِ دوطرفهٔ URL↔store (کارِ یک هوکِ useFilterSync در لایهٔ کامپوننت با useSearchParams)، اعتبارسنجیِ مقادیر (مثلاً sortِ نامعتبر در URL)، و debounce ِ جست‌وجو (کارِ کامپوننتِ ورودی). این فایل فقط شکلِ فیلتر و تبدیل‌هایش است.



// پنجمین استور — و این یکی از هر چهارتای قبلی جنسش فرق دارد، به شکلی که باید قبل از هر کدی یک تصمیمِ بنیادی را رو کنم. cart/user/wishlist دادهٔ کاربر بودند، product دادهٔ سرور. ولی فیلترها هیچ‌کدام نیستند — نه مالِ کاربرند که ذخیره شوند، نه مالِ سرور که کش شوند. فیلترها **حالتِ نما (view state)**اند: «کاربر الان دارد چه بُرشی از محصولات را نگاه می‌کند.» و این جنسِ سوم یک سؤالِ تعیین‌کننده می‌سازد که کلِ فایل به جوابش بند است.

// تصمیمِ بزرگ — URL منبعِ حقیقت است، نه استور. فیلتر (دسته، برند، مرتب‌سازی، صفحه، بازهٔ قیمت) باید قابلِ اشتراک و بوکمارک و بازگشت‌پذیر باشد. اگر کاربر لینکِ «لپ‌تاپ‌های ایسوس، مرتب‌شده بر قیمت، صفحهٔ ۲» را بفرستد، گیرنده باید دقیقاً همان نما را ببیند. این فقط وقتی ممکن است که حقیقت در URL بنشیند، نه در حافظهٔ استور. پس این استور یک نقشِ نامعمول دارد: آینهٔ URL است، نه صاحبِ state. استور از URL خوانده می‌شود و به URL نوشته می‌شود؛ خودش مالکِ چیزی نیست. این دقیقاً برعکسِ چهار استورِ قبلی است و کلِ شکلش را عوض می‌کند.

// پیامدِ ساختاری — این استور ProductQuery را تولید می‌کند، و productStore آن را مصرف. یادت هست در فایلِ قبل ProductQuery و queryKey را ساختیم؟ این‌جا حلقه بسته می‌شود: filterStore وضعیتِ خام فرم فیلتر را نگه می‌دارد، و یک گزینشگر آن را به همان ProductQuery تبدیل می‌کند که productStore.getPageProducts می‌خواند. دو استور از دو سر به یک قرارداد وصل می‌شوند.


// خب، پنج استور شد و حالا لایهٔ state کامل است — و این جدول کاملِ نهایی، یک چیزِ عمیق را نشان می‌دهد:

// استور	جنسِ داده	منبعِ حقیقت	نیمهٔ ناهمگام
// cartStore ✅	مالکیتِ کاربر	استور (+سرور)	دارد
// userStore ✅	هویت	کوکی/سرور	دارد
// wishlistStore ✅	مالکیتِ کاربر	استور+localStorage	دارد
// productStore ✅	مالکیتِ سرور	سرور (کش)	دارد
// filterStore ✅	حالتِ نما	URL	ندارد


// پنج استور، و پنج منبعِ حقیقتِ متفاوت: استور، کوکی، localStorage، کشِ سرور، و URL. این نکتهٔ اصلیِ کلِ این مسیر است — ما پنج فایلِ شبیهِ‌هم ننوشتیم؛ یک سؤالِ واحد را پنج‌بار پرسیدیم — «مالکِ این داده کیست و حقیقتش کجا زندگی می‌کند؟» — و هر بار جوابِ متفاوت، ساختارِ متفاوت ساخت. این تفاوتِ یک لایهٔ state ِ طراحی‌شده با یک مشت useState ِ پخش‌وپلاست.

// ولی آن ستونِ آخر — «نیمهٔ ناهمگام» — که حالا چهار بار «دارد» گفته، دیگر یک یادآوری نیست، یک بدهیِ سررسیده است. چهار استور از پنج، یک تابعِ منتظر دارند که هیچ‌وقت صدا زده نمی‌شود، چون آن‌که باید صدایش بزند وجود ندارد. و جالب اینکه filterStore — تنها استورِ بی‌شبکه — هم غیرمستقیم منتظرِ همان است: productStore را می‌راند که خودش داده می‌خواهد.

// پس دیگر مسیرِ بعدی انتخاب نیست، ضرورت است:

// services/http.ts — این‌بار بدونِ گزینهٔ رقیب. پنج استور ساختیم و لایهٔ state تمام شد؛ هر پنج، مستقیم یا غیرمستقیم، پشتِ یک دیوار ایستاده‌اند: «داده از کجا؟» http.ts همان پایه‌ای است که هر پنج سرویسِ بعدی رویش سوار می‌شوند — کوکی را می‌فرستد (credentials: "include"، تصمیمِ userStore)، پاسخ را به ApiSuccess/ApiError می‌کند (تایپِ api.ts)، ۴۰۱ را به clearUser وصل می‌کند، و Paginatedای را که productStore مصرف کرد از سرور می‌آورد. تمامِ تصمیم‌هایی که در این پنج فایل کاشتیم، دقیقاً آن‌جا میوه می‌دهند.

// تنها بدیلِ کوچک هنوز همان utils/money.ts است — تست‌پذیر و بی‌تصمیم — ولی صادقانه، حالا که کلِ لایهٔ state دست‌به‌سینه منتظرِ شبکه است، ساختنِ یک helperِ نمایشِ قیمت مثلِ رنگ‌کردنِ دیوارِ خانه‌ای است که هنوز لوله‌کشی ندارد.

// برویم بالاخره سراغِ services/http.ts و این پنج استور را زنده کنیم؟