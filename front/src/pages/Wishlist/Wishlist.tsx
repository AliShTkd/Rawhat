// @ts-nocheck

// pages/Wishlist/Wishlist.tsx
import {
  Show,
  For,
  type Component,
} from "solid-js";
import { Title } from "@solidjs/meta";

import WishlistItem from "../../components/wishlist/WishlistItem";
import WishlistSkeleton from "../../components/wishlist/WishlistSkeleton";
import EmptyWishlist from "../../components/wishlist/EmptyWishlist";
import ErrorState from "../../components/common/ErrorState";
import Button from "../../components/common/Button";

import { useWishlist } from "../../stores/wishlistStore";
import { useCart } from "../../stores/cartStore";

const Wishlist: Component = () => {
  const wishlist = useWishlist();
  const cart = useCart();

  const handleAddToCart = (productId: string) => {
    cart.addItem(productId, 1);
    // تصمیم UX: بعد از افزودن، آیتم در wishlist بماند یا منتقل شود؟
    // فرض من: بماند (کاربر ممکن است چند بار بخرد). «انتقال» را جدا می‌کنیم.
  };

  const handleMoveToCart = (productId: string) => {
    cart.addItem(productId, 1);
    wishlist.remove(productId);
  };

  return (
    <main class="wishlist" aria-labelledby="wishlist-title">
      <Title>علاقه‌مندی‌ها | فروشگاه</Title>

      <div class="wishlist__head">
        <h1 class="wishlist__title" id="wishlist-title">
          فهرست علاقه‌مندی‌ها
        </h1>
        {/* شمارنده فقط وقتی داده آماده و غیرخالی است */}
        <Show when={wishlist.ready && wishlist.count() > 0}>
          <span class="wishlist__count">
            {wishlist.count().toLocaleString("fa-IR")} کالا
          </span>
        </Show>
      </div>

      {/* اولویت حالت‌ها: loading → error → empty → list */}
      <Show
        when={wishlist.ready}
        fallback={<WishlistSkeleton />}
      >
        <Show
          when={!wishlist.error}
          fallback={
            <ErrorState
              message="بارگذاری فهرست علاقه‌مندی‌ها ممکن نشد."
              onRetry={() => wishlist.reload()}
            />
          }
        >
          <Show
            when={wishlist.count() > 0}
            fallback={<EmptyWishlist />}
          >
            <>
              <ul class="wishlist__list">
                <For each={wishlist.items()}>
                  {(item) => (
                    <li class="wishlist__item">
                      <WishlistItem
                        item={item}
                        onRemove={() => wishlist.remove(item.productId)}
                        onAddToCart={() => handleAddToCart(item.productId)}
                        onMoveToCart={() => handleMoveToCart(item.productId)}
                      />
                    </li>
                  )}
                </For>
              </ul>

              {/* اکشن‌های کلی روی کل فهرست */}
              <div class="wishlist__actions">
                <Button
                  variant="ghost"
                  onClick={() => wishlist.clear()}
                >
                  خالی کردن فهرست
                </Button>
              </div>
            </>
          </Show>
        </Show>
      </Show>
    </main>
  );
};

export default Wishlist;
















// توضیح کوتاه استفاده: این یک ارکستریتورِ نمایشِ علاقه‌مندی‌ها است؛ خودش داده‌ای نگه نمی‌دارد، فقط از stores/wishlist می‌خواند و بین چهار حالت (اسکلت/خطا/خالی/فهرست) سوییچ می‌کند. آن را زیر مسیر /wishlist رجیستر کن. چون wishlist سراسری است، این صفحه فقط یکی از سه مصرف‌کنندهٔ آن است (بقیه: آیکن قلب روی ProductCard و شمارندهٔ Header). دو store مصرف می‌کند: stores/wishlist (خواندن/حذف/خالی‌کردن) و stores/cart (پلِ «افزودن/انتقال به سبد»). پیش‌نیازها: stores/wishlist، سه قطعهٔ نمایشیِ نساخته (WishlistItem, WishlistSkeleton, EmptyWishlist) و ErrorState/Button موجود.




// رسیدیم به علاقه‌مندی‌ها — و این یک زیرساختِ عرضیِ سومِ واقعی می‌آورد: stores/wishlist، هم‌خانوادهٔ stores/cart و stores/auth. تا الان دو حالت داشتیم: صفحه‌هایی که دادهٔ سرور می‌گرفتند (لیست/جزئیات)، و صفحه‌هایی که فرم بودند (login/register). Wishlist از جنس cart است: یک مجموعهٔ کوچکِ سراسری که چند نقطهٔ اپ (کارت محصول با آیکن قلب، هدر، همین صفحه) به‌طور مشترک می‌خوانند و می‌نویسند.

// فرض‌هایی که گذاشتم (تصمیم‌های بزرگ — بخوان):

// یک stores/wishlist سراسری وجود دارد و این صفحه فقط مصرف‌کننده/نمایش‌دهندهاش است؛ خودش لیست را نگه نمی‌دارد. دلیل: آیکن قلب روی ProductCard و شمارندهٔ هدر هم به همین store گیر می‌کنند — دقیقاً مثل سبد.
// مهمان در برابر کاربر (تصمیم مهم): آیا مهمان می‌تواند wishlist داشته باشد؟ فرض من: بله، در localStorage و هنگام ورود با wishlistِ سرور ادغام می‌شود — عیناً همان مسئلهٔ «ادغام سبد مهمان» که در Login مطرح شد. این wishlist را از Account جدا نگه می‌دارد (نیازی به لاگین برای دیدنش نیست).
// حالت‌های چندگانه: loading (اسکلت) / خطا / خالی (empty state) / پُر. همان الگوی «تفکیک loading از empty» که در Cart داشتیم.
// پل به سبد: از هر آیتم می‌شود مستقیم «افزودن به سبد» زد (رفتار کلاسیک wishlist)؛ این نقطهٔ تلاقی stores/wishlist و stores/cart است.



// نکات مهم:

// بزرگ‌ترین تصمیم — stores/wishlist زیرساختِ عرضیِ جدید است: درست مثل سبد، wishlist نباید در این صفحه زندگی کند چون سه مصرف‌کننده دارد: (۱) همین صفحه، (۲) دکمهٔ قلب روی ProductCard/ProductInfo که toggle می‌کند و باید بداند آیتم داخل لیست هست یا نه (wishlist.has(id))، (۳) شمارندهٔ هدر. پس امضای پیشنهادی: { ready, error, items(), count(), has(id), add(id), remove(id), toggle(id), clear(), reload() }.

// تصمیم مهم — مهمان یا فقط کاربر؟ این همان دوراهیِ سبد است. دو مدل:

// wishlist مهمان در localStorage (فرض من): بدون لاگین کار می‌کند و هنگام ورود با سرور ادغام می‌شود. تجربهٔ بهتر، ولی همان پیچیدگیِ merge را می‌آورد.
// فقط کاربرِ لاگین‌کرده: ساده‌تر (فقط سرور)، ولی آن‌وقت این صفحه هم مثل Account باید گاردِ auth بگیرد و مهمان را به /login?redirect=/wishlist بفرستد.
// این انتخاب تعیین می‌کند wishlist کجا ذخیره می‌شود و آیا این صفحه محافظت‌شده است یا نه. بگو کدام.

// پلِ wishlist → cart (تلاقی دو store): دو اکشن جدا گذاشتم چون دو رفتار متفاوتِ UX هستند و نباید قاطی شوند:

// onAddToCart: به سبد اضافه کن، در wishlist بمان (شاید باز هم بخواهد).
// onMoveToCart: به سبد اضافه کن و از wishlist حذف کن (انتقال).
// کدام‌شان دکمهٔ اصلیِ WishlistItem باشد یک تصمیم UX است؛ فعلاً هر دو را باز گذاشتم تا موقع ساخت WishlistItem انتخاب کنیم.

// همان الگوی حالت‌های تودرتوی Cart: ترتیبِ Showها عمدی است — loading → error → empty → list. wishlist.ready جداکنندهٔ «هنوز نمی‌دانیم» از «واقعاً خالی است»؛ بدون این، هنگام رفرش یک لحظه EmptyWishlist اشتباهاً فلش می‌زند. این دقیقاً بحثی است که در Cart و Account هم داشتیم.

// A11y: فهرست را با <ul>/<li> معنایی زدم (نه صرفاً <div>)، چون واقعاً یک فهرست است؛ h1 یک‌بار و «فهرست علاقه‌مندی‌ها»؛ wishlist__count صرفاً بصری است ولی چون کنار عنوان است، screen reader هم آن را در جریان می‌خواند. دکمهٔ حذف داخل WishlistItem باید aria-label گویا داشته باشد («حذف [نام کالا] از علاقه‌مندی‌ها»).

// CSS (بدون inline، BEM): wishlist__head را با display:flex; justify-content:space-between; align-items:baseline بچین (عنوان + شمارنده)؛ wishlist__list را grid کن (چند ستون در دسکتاپ، تک‌ستون در موبایل) یا اگر WishlistItem ردیفی است، تک‌ستونِ فاصله‌دار؛ wishlist__actions را در انتها با justify-content:flex-end؛ خاصیت‌های منطقی برای RTL.



// قطعات جدیدی که این صفحه اضافه کرد:

// قطعه	وضعیت
// Wishlist (page)	✅ (همین حالا)
// stores/wishlist	⛔ زیرساختِ عرضیِ سوم
// WishlistItem	⛔ (جدید)
// WishlistSkeleton	⛔ (جدید)
// EmptyWishlist	⛔ (جدید)
// ErrorState	⛔ (اگر هنوز نساخته‌ایم — قطعهٔ مشترکِ پرتکرار)

// هشدار صادقانه (حالا هشت صفحهٔ ارکستریتور داریم و این مورد جدی‌تر است): Wishlist یک زیرساختِ عرضیِ سوم (stores/wishlist) اضافه کرد در حالی که هنوز هیچ‌کدام از دو زیرساخت قبلی (stores/cart, stores/auth) ساخته نشده‌اند. ما الان سه store انتزاعی، سه مسئلهٔ ادغامِ مهمان→کاربر (سبد، wishlist، و سشن)، و یک پشتهٔ عظیم از قطعات نمایشیِ نساخته داریم که همه روی فرض‌های تأییدنشده بنا شده‌اند. اگر یکی از تصمیم‌های بنیادی (مثلاً کوکی/توکن، یا مهمان/کاربر) عوض شود، باید در چند store هم‌زمان بازنویسی کنیم.

// پیشنهاد قاطعم — که حالا دیگر یک درخواست است — این است که هیچ صفحهٔ جدیدی نسازیم تا وقتی حداقل یک زیرساخت واقعی زیر پایمان باشد. اولویت پیشنهادی:

// تصمیم‌های بنیادی را قطعی کن (این‌ها همچنان بی‌جواب مانده‌اند و هر سه store به آن‌ها بند است):
// سشن: کوکی httpOnly یا توکن؟
// مهمان→کاربر: ادغامِ سبد/wishlist سمت سرور است یا کلاینت؟
// wishlist: مهمان مجاز است یا فقط کاربر؟
// stores/auth را بساز (چهار-پنج صفحه به آن قفل‌اند).
// بعد stores/cart و stores/wishlist (هم‌الگو با auth، مسئلهٔ merge مشترک).
// یک صفحه را end-to-end ببند تا بالاخره یک مسیر واقعاً کار کند.
// می‌خواهی الان همان سه تصمیم بنیادی را با هم نهایی کنیم و بعد stores/auth را بسازم (با فرضِ کوکی httpOnly + /me + ready)؟ یا اصرار داری روی صفحهٔ بعدی برویم؟ من صادقانه توصیه می‌کنم این‌بار توقف کنیم و عمق بسازیم. 🙂