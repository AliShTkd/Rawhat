
// src/stores/orderStore.ts
import { create } from "zustand";
import type { Order, OrderSummary, OrderStatus } from "../types/order";
import type { Paginated, AsyncState, ApiError } from "../types/api";

/**
 * استورِ سفارش = تاریخچهٔ خریدهای کاربر.
 * تفاوتِ بنیادی با productStore: سفارش‌ها **تغییرناپذیر**اند.
 * یک سفارشِ ثبت‌شده یک رویدادِ تاریخی است، نه دادهٔ زنده —
 * پس کشش هرگز «کهنه» نمی‌شود (جز فیلدِ status که سرور می‌راند).
 */
interface OrderStore {
  /**
   * کشِ خلاصه‌ها به‌تفکیکِ id — برای صفحهٔ «سفارش‌های من».
   * جدا از detail، چون خلاصه هرگز اطلاعاتِ کاملِ سفارش را ندارد.
   */
  summaryById: Record<string, OrderSummary>;
  /** ترتیبِ نمایشِ فهرست — جدا از کش تا صفحه‌بندی ترتیب را نریزد. */
  listOrder: string[];
  /** متادیتای صفحه‌بندیِ فهرست. */
  pagination?: { page: number; pageSize: number; total: number; hasMore: boolean };

  /** کشِ سفارش‌های کامل — گران‌تر، فقط وقتی جزئیات باز شود. */
  detailById: Record<string, Order>;

  /** وضعیتِ فهرست و جزئیات، جدا (مثل productStore). */
  listStatus: AsyncState<OrderSummary[]>["status"];
  detailStatus: Record<string, AsyncState<Order>["status"]>;
  error?: ApiError;

  // — نشاندنِ نتایجِ سرور —
  /** نشاندنِ صفحه‌ای از فهرست؛ append چون تاریخچه فقط رشد می‌کند. */
  setOrderPage: (result: Paginated<OrderSummary>) => void;
  /** نشاندنِ یک سفارشِ کامل. */
  setOrderDetail: (order: Order) => void;
  /**
   * تنها به‌روزرسانیِ مجاز: تغییرِ وضعیت از سمتِ سرور.
   * خودِ سفارش ثابت است؛ فقط status سفرِ زمانی دارد.
   */
  updateStatus: (orderId: string, status: OrderStatus) => void;
  /**
   * افزودنِ سفارشِ تازه‌ثبت‌شده به صدرِ فهرست — پس از checkout موفق.
   * خوش‌بینانه نیست؛ سرور قبلاً تأیید کرده، فقط کش را هم‌گام می‌کنیم.
   */
  prependNewOrder: (order: Order) => void;

  setListLoading: () => void;
  setDetailLoading: (orderId: string) => void;
  setError: (error: ApiError) => void;

  // — گزینشگرها —
  /** خلاصه‌ها به‌ترتیبِ فهرست. */
  getOrderList: () => OrderSummary[];
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  summaryById: {},
  listOrder: [],
  pagination: undefined,
  detailById: {},
  listStatus: "idle",
  detailStatus: {},
  error: undefined,

  setOrderPage: (result) =>
    set((state) => {
      const summaryById = { ...state.summaryById };
      for (const o of result.items) summaryById[o.id] = o;
      // append نه replace: صفحهٔ ۲ به دنبالِ صفحهٔ ۱ می‌چسبد.
      // تکراری‌ها را با Set حذف می‌کنیم تا رفرشِ صفحه دوتاسازی نکند.
      const seen = new Set(state.listOrder);
      const merged = [...state.listOrder];
      for (const o of result.items) if (!seen.has(o.id)) merged.push(o.id);
      return {
        summaryById,
        listOrder: merged,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          hasMore: result.page * result.pageSize < result.total,
        },
        listStatus: "success",
      };
    }),

  setOrderDetail: (order) =>
    set((state) => ({
      detailById: { ...state.detailById, [order.id]: order },
      detailStatus: { ...state.detailStatus, [order.id]: "success" },
      // اگر خلاصه‌اش هم در کش بود، فیلدهای مشترک را تازه کن.
      summaryById: state.summaryById[order.id]
        ? {
            ...state.summaryById,
            [order.id]: {
              ...state.summaryById[order.id],
              status: order.status,
              total: order.total,
            },
          }
        : state.summaryById,
    })),

  updateStatus: (orderId, status) =>
    set((state) => {
      // status در هر دو کش زندگی می‌کند؛ هر دو را هم‌زمان به‌روز کن
      // تا فهرست و جزئیات یک حقیقت را نشان دهند.
      const summary = state.summaryById[orderId];
      const detail = state.detailById[orderId];
      return {
        summaryById: summary
          ? { ...state.summaryById, [orderId]: { ...summary, status } }
          : state.summaryById,
        detailById: detail
          ? { ...state.detailById, [orderId]: { ...detail, status } }
          : state.detailById,
      };
    }),

  prependNewOrder: (order) =>
    set((state) => {
      // سفارشِ نو به صدرِ فهرست (جدیدترین اول) و هر دو کش پر می‌شود.
      const listOrder = state.listOrder.includes(order.id)
        ? state.listOrder
        : [order.id, ...state.listOrder];
      return {
        listOrder,
        summaryById: {
          ...state.summaryById,
          [order.id]: {
            id: order.id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            total: order.total,
            status: order.status,
            itemCount: order.items.length,
          },
        },
        detailById: { ...state.detailById, [order.id]: order },
      };
    }),

  setListLoading: () => set({ listStatus: "loading" }),
  setDetailLoading: (orderId) =>
    set((state) => ({
      detailStatus: { ...state.detailStatus, [orderId]: "loading" },
    })),
  setError: (error) => set({ error }),

  getOrderList: () => {
    const state = get();
    return state.listOrder
      .map((id) => state.summaryById[id])
      .filter(Boolean) as OrderSummary[];
  },
}));





















// نکاتِ مهمِ کوتاه:

// مهم‌ترین تصمیم — سفارش تغییرناپذیر است، پس کش هرگز کهنه نمی‌شود (جز status): این چیزی است که orderStore را از productStore جدا می‌کند، با اینکه هر دو «دادهٔ سرور»اند. محصول زنده است — قیمت و موجودی‌اش می‌جنبد، پس در productStore گفتم کش تا رفرش می‌ماند و باید نگرانِ تازگی بود. سفارش اما یک رویدادِ تاریخی است: «تو در ۱۲ فروردین این سه قلم را به این قیمت خریدی» تا ابد همان است. پس این‌جا با خیالِ راحت کش می‌کنم و یک استثنا می‌گذارم — status — که تنها بخشِ زندهٔ سفارش است. تشخیصِ اینکه «چقدر می‌توانم به کش اعتماد کنم» مستقیم از «آیا داده تغییرناپذیر است» می‌آید.

// دو کشِ جدا (summaryById و detailById) که یکی از دیگری مشتق نمی‌شود — برعکسِ productStore: آن‌جا ProductDetail extends Product بود پس جزئیات، نسخهٔ سبک را هم می‌ساخت. این‌جا عمداً نه: OrderSummary (شماره/تاریخ/جمع/وضعیت) آن‌قدر کم‌ دارد که هرگز نمی‌تواند یک Orderِ کامل (اقلام/آدرس/پرداخت) را بسازد. پس وانمود نمی‌کنم که رابطهٔ ارث‌بری دارند؛ دو کشِ مستقل که فقط در چند فیلدِ مشترک (status, total) همگام نگه داشته می‌شوند. جهتِ رابطهٔ سبک/سنگین به ماهیتِ داده بند است، نه یک قاعدهٔ کلی.

// listOrder جدا از summaryById — چون فهرست append می‌شود نه replace: برخلافِ productStore که هر صفحه یک نمای مستقل بود، تاریخچهٔ سفارش یک جریانِ پیوسته است که فقط رشد می‌کند (صفحهٔ ۲ به دنبالِ ۱). پس ترتیب را در یک آرایهٔ جدا (listOrder) نگه می‌دارم و موقعِ append با Set تکراری‌ها را می‌گیرم تا رفرش، ردیف‌ها را دوتا نکند. جداکردنِ «ترتیب» از «کش» همان درسِ نرمال‌سازیِ productStore است، این‌بار برای یک فهرستِ رشدی.

// updateStatus هر دو کش را هم‌زمان می‌زند — یک حقیقت، دو جا: چون status هم در summaryById هست هم در detailById، اگر فقط یکی را به‌روز کنم، فهرست و صفحهٔ جزئیات دو وضعیتِ متناقض نشان می‌دهند. این خطرِ ذاتیِ denormalization است (یک داده در دو جا) و قیمتش این است: هر تغییر باید هر دو نسخه را بزند. آگاهانه این هزینه را می‌پذیرم چون جداییِ سبک/سنگین ارزشش را دارد.

// prependNewOrder خوش‌بینانه نیست — و این تفاوتش با cartStore است: ممکن است شبیهِ کنشِ خوش‌بینانه به‌نظر بیاید، ولی نیست. در سبد، خوش‌بینانه یعنی «قبل از تأییدِ سرور UI را عوض کن». این‌جا سفارش قبلاً در سرور با موفقیت ثبت شده (checkout تمام شده)؛ ما فقط کشِ محلی را با حقیقتی که همین الان از سرور آمد هم‌گام می‌کنیم تا کاربر بدونِ یک رفت‌وبرگشتِ اضافه سفارشش را در صدرِ فهرست ببیند. تفاوتِ ظریف ولی مهم: خوش‌بینانه یعنی «حدس بزن»، این یعنی «همگام‌سازی با واقعیتِ تأییدشده».

// چه چیزی این‌جا نیست: فرآیندِ خودِ checkout (ساختِ سفارش، پرداخت — کارِ یک checkoutStore یا سرویسِ جدا)، لغو/مرجوعیِ سفارش (اگر دامنه داشته باشد، یک گذارِ مجزاست)، و طبیعتاً fetch (کارِ services/orders.ts). این فایل فقط کش و نمایشِ تاریخچهٔ سفارش است.

// ششمین استور — و این یکی، بعد از پنج‌تای قبلی، یک وسوسه می‌آورد که باید صریح ردش کنم: «سفارش هم مثلِ محصول، دادهٔ سرور است، پس همان productStore را کپی کن.» ولی نه — سفارش یک تفاوتِ بنیادی دارد که کلِ شکلش را عوض می‌کند: سفارش‌ها تغییرناپذیرند (immutable). یک محصول قیمتش عوض می‌شود، موجودی‌اش کم می‌شود، پس کشش کهنه می‌شود. ولی سفارشِ ثبت‌شده یک رویدادِ تاریخی است — «تو در فلان تاریخ این‌ها را خریدی» هرگز عوض نمی‌شود. این یعنی کشِ سفارش را برخلافِ محصول نباید نگرانِ کهنگی بود؛ یک‌بار که آمد، برای همیشه معتبر است.

// ولی قبل از کد، تصمیمِ بزرگی که این استور را از productStore جدا می‌کند:

// تصمیمِ بزرگ — دو نوعِ کاملاً جدا: «فهرستِ سفارش‌ها» و «یک سفارشِ کامل»، و اولی هرگز نباید منبعِ دومی باشد. در productStore گفتم ProductDetail نسخهٔ سبک را هم تازه می‌کند. این‌جا عمداً برعکس عمل می‌کنم: OrderSummary (ردیفِ فهرست: شماره، تاریخ، جمع، وضعیت) و Order (کامل: اقلام، آدرس، پرداخت، تاریخچهٔ وضعیت) دو کشِ جدااند و یکی از دیگری مشتق نمی‌شود. چرا؟ چون یک OrderSummary هیچ‌وقت اطلاعاتِ کافی برای ساختنِ Order ندارد — پس وانمود نمی‌کنم که دارد.

// پیامدِ دوم — وضعیتِ سفارش تنها چیزی است که می‌تواند عوض شود، و تنها از سمتِ سرور. خودِ سفارش ثابت است، ولی status (در حالِ پردازش → ارسال‌شده → تحویل) از بیرون تغییر می‌کند. پس تنها گذارِ «به‌روزرسانی» که مجاز می‌گذارم، دقیقاً همین است — نه ویرایشِ اقلام، نه چیزِ دیگر.

// خب، شش استور شد و لایهٔ state حالا نه‌فقط کامل که در دو محورِ متعامد پخته است. این جدول را ببین که چطور «دادهٔ سرور» خودش به دو جنس شکافت:

// استور	جنسِ داده	تغییرپذیری	اعتماد به کش
// cartStore ✅	مالکیتِ کاربر	زنده	کم (سرور آشتی)
// userStore ✅	هویت	زنده	کم
// wishlistStore ✅	مالکیتِ کاربر	زنده	متوسط (localStorage)
// productStore ✅	مالکیتِ سرور	زنده	کم (کهنه می‌شود)
// filterStore ✅	حالتِ نما	—	— (URL)
// orderStore ✅	مالکیتِ سرور	تغییرناپذیر	زیاد (تاریخی)


// آن دو ردیفِ product و order نکتهٔ امروز را داد می‌زنند: هر دو «دادهٔ سرور»اند ولی دو ساختارِ کاملاً متفاوت گرفتند — چون یکی زنده است و دیگری تاریخی. اگر فقط برچسبِ «دادهٔ سرور» را می‌دیدیم و productStore را کپی می‌کردیم، یک کشِ نگرانِ‌کهنگیِ بی‌مورد برای داده‌ای می‌ساختیم که اصلاً کهنه نمی‌شود. این باز همان درسِ همیشگی است، یک لایه عمیق‌تر: نه‌تنها «مالکِ داده کیست»، بلکه «آیا داده تغییر می‌کند» هم ساختار را می‌راند.

// ولی حالا شش استور، هر شش، همان یک سازِ واحد را می‌زنند و دیگر واقعاً کرکننده شده: setOrderPage, setOrderDetail, updateStatus — مثلِ آن ۱۲ تابعِ دیگر در پنج استورِ قبلی — همه توابعی‌اند که منتظرِ داده‌ای‌اند که هیچ لایه‌ای هنوز از سرور نمی‌آورد. شش استورِ کامل، و یک خلأِ مشترک که دیگر نمی‌شود کاری‌اش نکرد.

// و این‌بار یک فوریتِ تازه هم هست: prependNewOrder به‌صراحت به یک فرآیندِ checkout اشاره می‌کند که هنوز وجود ندارد، و آن فرآیند بدونِ لایهٔ شبکه حتی قابلِ شروع نیست. یعنی دیگر فقط استورها منتظر نیستند؛ جریان‌های کاربردی هم پشتِ همان دیوار گیر کرده‌اند.

// پس مسیر دیگر بحث ندارد:

// services/http.ts — دیگر نه پیشنهاد، نه ضرورت، بلکه تنها کارِ ممکن. شش استور ساختیم و لایهٔ state تمام شد. هر شش، مستقیم یا غیرمستقیم، پشتِ یک دیوارِ واحد ایستاده‌اند: «داده از کجا؟» http.ts همان پایه است — کوکی را می‌فرستد (credentials: "include"، تصمیمِ userStore)، پاسخ را به ApiSuccess/ApiError می‌کند (تایپِ api.ts)، ۴۰۱ را به clearUser وصل می‌کند، و آن Paginatedای را که هم productStore و هم orderStore مصرف کردند از سرور می‌آورد. تمامِ تصمیم‌هایی که در این شش فایل کاشتیم، همان‌جا و فقط همان‌جا میوه می‌دهند.

// صادقانه، حتی دیگر utils/money.ts را هم به‌عنوانِ بدیل پیشنهاد نمی‌کنم — وقتی شش استور و یک جریانِ checkout همه پشتِ یک دیوار جمع شده‌اند، ساختنِ هر چیزِ دیگری فقط به‌تعویق‌انداختنِ کارِ اصلی است.

// برویم بالاخره services/http.ts را بسازیم و این شش استور را یک‌جا زنده کنیم؟ این‌بار دیگر واقعاً وقتش است