
// src/stores/wishlistStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AsyncState, ApiError } from "../types/api";

/**
 * لیستِ علاقه = مجموعه‌ای از productIdها.
 * برخلافِ سبد، نه تعداد دارد نه قیمت — فقط «عضویت».
 * پس هسته `Set<string>` است: toggle در O(1)، تکراری ذاتاً ناممکن.
 */
interface WishlistStore {
  /** شناسه‌های محصولاتِ موردعلاقه. Set برای معناشناسیِ عضویت. */
  ids: Set<string>;
  /**
   * وضعیتِ همگام‌سازی با سرور.
   * چون مهمان هم مجاز است، sync فقط پس از لاگین معنا پیدا می‌کند.
   */
  sync: AsyncState<Set<string>>;

  // — کنش‌های خوش‌بینانه (کار می‌کنند چه مهمان چه لاگین) —
  /** افزودن/حذفِ یک محصول — کنشِ اصلی. برمی‌گرداند حالتِ جدید را. */
  toggle: (productId: string) => void;
  /** افزودنِ صریح — برای دکمهٔ «افزودن به علاقه‌مندی‌ها». */
  add: (productId: string) => void;
  /** حذفِ صریح — برای دکمهٔ حذف در صفحهٔ لیست. */
  remove: (productId: string) => void;
  clear: () => void;

  // — ادغام و آشتیِ سروری —
  /**
   * ادغامِ لیستِ محلیِ مهمان با لیستِ سرور هنگامِ ورود.
   * اجتماع (union)، نه جایگزینی — هیچ آرزویی گم نمی‌شود.
   */
  mergeWithServer: (serverIds: ReadonlyArray<string>) => void;
  setSyncing: () => void;
  setSyncError: (error: ApiError) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: new Set<string>(),
      sync: { status: "idle" },

      toggle: (productId) =>
        set((state) => {
          // همیشه Setِ جدید می‌سازیم؛ mutateِ درجا را React نمی‌بیند.
          const ids = new Set(state.ids);
          if (ids.has(productId)) {
            ids.delete(productId);
          } else {
            ids.add(productId);
          }
          return { ids };
        }),

      add: (productId) =>
        set((state) => {
          if (state.ids.has(productId)) return state; // بی‌تغییر = بی‌رندرِ اضافه
          const ids = new Set(state.ids);
          ids.add(productId);
          return { ids };
        }),

      remove: (productId) =>
        set((state) => {
          if (!state.ids.has(productId)) return state;
          const ids = new Set(state.ids);
          ids.delete(productId);
          return { ids };
        }),

      clear: () => set({ ids: new Set<string>() }),

      mergeWithServer: (serverIds) =>
        set((state) => {
          // اجتماع: محلیِ مهمان + سروری. هیچ‌کدام قربانی نمی‌شود.
          const ids = new Set(state.ids);
          for (const id of serverIds) ids.add(id);
          return { ids, sync: { status: "success", data: ids } };
        }),

      setSyncing: () =>
        set((state) => ({ sync: { ...state.sync, status: "loading" } })),

      setSyncError: (error) =>
        set((state) => ({ sync: { status: "error", data: state.sync.data, error } })),
    }),
    {
      name: "wishlist",
      // Set در JSON سریال نمی‌شود؛ دستی به آرایه و برعکس تبدیل می‌کنیم.
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          const parsed = JSON.parse(raw) as { state: { ids: string[] } };
          return {
            state: {
              ...parsed.state,
              ids: new Set(parsed.state.ids),
            },
          } as never;
        },
        setItem: (name, value) => {
          const v = value as unknown as { state: { ids: Set<string> } };
          localStorage.setItem(
            name,
            JSON.stringify({
              state: { ...v.state, ids: Array.from(v.state.ids) },
            }),
          );
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      // فقط `ids` ماندگار شود، نه `sync` (که حالتِ گذرای شبکه است).
      partialize: (state) => ({ ids: state.ids }) as never,
    },
  ),
);
































// نکاتِ مهمِ کوتاه:

// مهم‌ترین تصمیم — Set در هسته، و تولیدِ Setِ جدید در هر گذار: انتخابِ Set<string> مستقیماً از معناشناسیِ دامنه می‌آید — «عضویت»، نه «فهرست». این toggle/has را O(1) می‌کند و تکراری را ذاتاً ناممکن. ولی نکتهٔ ظریف: هرگز state.ids.add() درجا نمی‌زنم؛ همیشه new Set(state.ids) می‌سازم. چون React/Zustand تغییر را با مقایسهٔ مرجع می‌فهمند — اگر همان Set را mutate کنم، مرجع عوض نمی‌شود و UI رندر نمی‌گیرد. این کلاسیک‌ترین باگِ «state عوض شد ولی صفحه تکان نخورد» است.

// mergeWithServer اجتماع است نه جایگزینی — و این تفاوتِ بنیادی با cartStore است: یادت هست در سبد گفتم reconcile کلِ سبد را جایگزین می‌کند چون سرور حرفِ آخر را در قیمت/موجودی می‌زند؟ این‌جا برعکس: لیستِ علاقه هیچ دادهٔ حساسی ندارد، فقط آرزوست. اگر مهمان سه چیز را پسندیده و بعد لاگین کند و سرور دو چیزِ دیگر داشته باشد، هر پنج‌تا باید بمانند. جایگزینی یعنی گم‌شدنِ آرزوهای مهمان — رفتارِ آزاردهنده. پس union. این نشان می‌دهد استراتژیِ آشتی به ماهیتِ داده بند است، نه یک قاعدهٔ کلی.

// persist این‌جا هست ولی در cartStore نبود — عمدی: لیستِ علاقهٔ مهمان باید بینِ بازدیدها بماند (کاربر امروز می‌پسندد، هفتهٔ بعد می‌خرد)، پس localStorage منطقی است. سبد را عمداً persist نکردم چون قیمت/موجودیش کهنه می‌شود و سرور باید تازه‌سازی کند. باز هم: تصمیمِ ماندگاری به ماهیتِ داده بند است.

// سریال‌سازیِ دستیِ Set — چون JSON آن را نمی‌شناسد: JSON.stringify(new Set([...])) یک {}ِ خالی می‌دهد! پس در storage سفارشی، موقعِ ذخیره Array.from و موقعِ خواندن new Set(...) می‌زنم. این هزینهٔ انتخابِ Set است — کمی boilerplateِ سریال‌سازی — ولی در برابرِ O(1) بودنِ toggle و امنیتِ تکراری، می‌ارزد.

// partialize فقط ids را ذخیره می‌کند: sync یک حالتِ گذرای شبکه است (loading/error)؛ ذخیره‌کردنش در localStorage بی‌معنی و حتی خطرناک است — تصور کن اپ با یک sync: loadingِ یخ‌زدهٔ دیروز بالا بیاید. پس فقط دادهٔ واقعی (ids) ماندگار می‌شود.

// چه چیزی این‌جا نیست: فراخوانیِ سرور (services/wishlist)، و مهم‌تر — چه‌زمان mergeWithServer صدا زده شود. آن یک اثرِ جانبیِ لاگین است: وقتی userStore به authenticated می‌رسد، باید ادغام رخ دهد. این هماهنگی کارِ لایهٔ سرویس یا یک افکت است، نه خودِ استور.


// سومین استور — و این یکی هم یک تصمیمِ معلق را که از فهرستِ «تصمیم‌های بنیادیِ باز» مانده بود مجبورمان می‌کند ببندیم: «لیستِ علاقهٔ مهمان چه می‌شود؟» ولی قبل از تصمیم، یک نکتهٔ مهم که این استور را از دو تای قبلی جدا می‌کند: لیستِ علاقه از نظرِ ساختارِ داده ساده‌ترین‌شان است — نه تعداد دارد، نه قیمت، نه جمع. هر محصول یا داخلش هست یا نیست. یعنی معناشناسیِ مجموعه (Set)، نه فهرست. و کنشِ اصلی‌اش هم یکی است: toggle.

// تصمیمِ بزرگ — لیستِ علاقهٔ مهمان مجاز است، محلی‌محور، و در ورود ادغام می‌شود. برخلافِ سبد که سرور حرفِ آخر را در قیمت/موجودی می‌زد، لیستِ علاقه هیچ ریسکِ صحتِ داده ندارد — فقط مجموعه‌ای از آرزوهاست. پس منطقی است که مهمان هم بتواند بدونِ لاگین چیزی را ذخیره کند (در localStorage)، و وقتی وارد شد، آن مجموعهٔ محلی با مجموعهٔ سروری اجتماع (union) شود، نه جایگزینی. این دقیقاً نقطهٔ تفاوتش با cartStore است و باید صریح باشد.

// پیامدِ ساختاری — Set<string> در هسته، نه آرایه. چون معناشناسی «عضویت» است، هستهٔ state یک مجموعه از productIdهاست. این toggle را O(1) می‌کند و تکراری‌ها را ذاتاً غیرممکن. ولی چون Zustand و React با تغییرِ مرجع کار می‌کنند، هر گذار یک Setِ جدید می‌سازم، نه mutate.



// خب، سومین استور تمام شد و حالا الگو سه‌بار اثبات‌شده است — دیگر یک حدس نیست، یک قاعده است:

// استور	هسته	ماندگاری	استراتژیِ آشتی
// cartStore ✅	Cart (فهرست+جمع)	❌ (سرور تازه‌سازی)	جایگزینی
// userStore ✅	User | null	❌ (کوکیِ httpOnly)	—
// wishlistStore ✅	Set<string>	✅ (localStorage)	اجتماع
// و نکتهٔ جالب این جدول این است که با اینکه ساختارشان یکی است (داده + AsyncState + کنش)، تصمیم‌های‌شان هرکدام از ماهیتِ دادهٔ خودشان آمد — ماندگاری و آشتی سه جواب متفاوت گرفتند. این یعنی الگو را کورکورانه کپی نکردیم؛ فهمیدیم کجا باید واگرا شود.

// ولی همان ستونِ آخرِ جدول یک حقیقتِ ناراحت‌کننده را داد می‌زند: سه استور داریم و هر سه یک ستونِ خالیِ مشترک دارند — هیچ‌کدام هنوز با سرور حرف نمی‌زنند. reconcile, setUser, mergeWithServer همه منتظرِ داده‌ای هستند که کسی باید از سرور بیاورد. و هر سه به یک لایهٔ مشترک بند‌ند که هنوز نساخته‌ایم.


// پس مسیرِ بعدی حالا واضح‌تر از همیشه است:

// services/http.ts (قوی‌ترین پیشنهاد) — پایهٔ مشترکِ هر سه سرویسِ بعدی: کوکی را خودکار می‌فرستد (credentials: "include"، همان تصمیمِ userStore)، پاسخ را به ApiSuccess/ApiError تبدیل می‌کند، و ۴۰۱ را به clearUser وصل می‌کند. سه استور به‌معنای واقعی روی این منتظرند. بدونش هیچ‌کدام از این استورها هرگز داده نمی‌بینند.
// utils/money.ts — هنوز آن حلقهٔ مفقودهٔ نمایشِ subtotal؛ کوچک، تست‌پذیر، بی‌تصمیم.
// نظرم؟ این‌بار قاطعانه services/http.ts. سه استور پشتِ سرِ هم ساختیم و هر سه دقیقاً به یک نقطه رسیدند: «حالا داده از کجا بیاید؟» ساختنِ لایهٔ http یعنی هر سه استور هم‌زمان زنده می‌شوند و بالاخره از دنیای «state خالص» به «اپِ واقعی که با سرور حرف می‌زند» می‌رویم. آن تصمیمِ کوکی هم که در userStore گرفتیم دقیقاً همان‌جا باید کاشته شود. برویم سراغش؟