// pages/Cart/Cart.tsx
import {
  Show,
  For,
  Suspense,
  type Component,
} from "solid-js";
import { Title } from "@solidjs/meta";

import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import EmptyCart from "../../components/cart/EmptyCart";
import CartSkeleton from "../../components/cart/CartSkeleton";

import { useCart } from "../../stores/cart";

const Cart: Component = () => {
  const cart = useCart();

  const isEmpty = () => !cart.loading && cart.items.length === 0;

  return (
    <main class="cart" aria-labelledby="cart-title">
      <Title>سبد خرید | فروشگاه</Title>

      <h1 class="cart__title" id="cart-title">
        سبد خرید
        <Show when={cart.items.length > 0}>
          <span class="cart__count">
            {cart.items.length.toLocaleString("fa-IR")} کالا
          </span>
        </Show>
      </h1>

      <Suspense fallback={<CartSkeleton />}>
        <Show
          when={!isEmpty()}
          fallback={<EmptyCart />}
        >
          <div class="cart__layout">
            {/* ستون اقلام */}
            <section class="cart__items" aria-label="اقلام سبد خرید">
              <ul class="cart__list">
                <For each={cart.items}>
                  {(item) => (
                    <li class="cart__list-item">
                      <CartItem
                        item={item}
                        onQuantityChange={(qty) =>
                          cart.updateQuantity(item.id, qty)
                        }
                        onRemove={() => cart.removeItem(item.id)}
                        disabled={cart.mutating}
                      />
                    </li>
                  )}
                </For>
              </ul>

              <div class="cart__actions">
                <a class="cart__continue" href="/products">
                  ادامه‌ی خرید
                </a>
                <button
                  type="button"
                  class="cart__clear"
                  onClick={() => cart.clear()}
                  disabled={cart.mutating}
                >
                  خالی‌کردن سبد
                </button>
              </div>
            </section>

            {/* ستون خلاصه‌ی مالی */}
            <aside class="cart__summary" aria-label="خلاصه‌ی سفارش">
              <CartSummary
                subtotal={cart.subtotal}
                discount={cart.discount}
                shipping={cart.shipping}
                total={cart.total}
                itemCount={cart.items.length}
                onCheckout={() => cart.checkout()}
                loading={cart.mutating}
              />
            </aside>
          </div>
        </Show>
      </Suspense>
    </main>
  );
};

export default Cart;






















// رسیدیم به سبد خرید. این هم یک صفحهٔ ارکستریتور است، ولی با یک تفاوت بنیادی نسبت به ProductsPage و ProductDetails: اینجا داده دیگر فقط‌خواندنی از سرور نیست؛ state قابل‌ویرایش و ماندگارِ کاربر است (اقلام سبد، تعداد، حذف). این یعنی برای اولین بار در پروژه به یک منبع حقیقتِ اشتراکی (store سبد) نیاز داریم که چند صفحه/کامپوننت (همین صفحه، آیکنِ سبد در هدر، دکمهٔ «افزودن به سبد» در ProductInfo) به آن وصل شوند.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو — این‌ها مهم‌اند):

// یک Cart Store سراسری (context/store در stores/cart) وجود دارد که این صفحه فقط مصرف‌کنندهاش است. خودِ صفحه state سبد را نگه نمی‌دارد؛ فقط نمایش می‌دهد و اکشن‌ها را صدا می‌زند. این همان الگوی «صفحه = ارکستریتور» است، ولی این‌بار منبع، store است نه createResource.
// محاسبات مالی (جمع کل، تخفیف، ارسال) در store/سرور انجام می‌شود، نه در UI. صفحه فقط اعداد آماده را نشان می‌دهد.
// زیرمؤلفه‌ها به‌صورت ترکیبی: CartItem, CartSummary, EmptyCart, و احتمالاً CartSkeleton.
// حالت خالی یک مسیر کاملاً جدا و مهم است (نه یک حاشیه) — چون سبد خالی حالت پیش‌فرضِ خیلی از کاربران است.



// زیرمؤلفه‌ها و زیرساخت‌های جدیدی که این صفحه فرض کرده (هنوز ساخته نشده‌اند):

// قطعه	نقش	جنس
// stores/cart (useCart)	منبع حقیقتِ سبد: items، اکشن‌ها، محاسبات	زیرساخت (نه UI) — مهم‌ترین قطعه
// CartItem	یک ردیف کالا: عکس، عنوان، قیمت، تعداد (±)، حذف	متوسط
// CartSummary	خلاصهٔ مالی + دکمهٔ «ادامهٔ ثبت سفارش»	متوسط
// EmptyCart	حالت خالی + CTA به فهرست محصولات	کم
// CartSkeleton	اسکلت بارگذاری	کم











// نکات مهم:

// بزرگ‌ترین تصمیم — Cart Store (زیرساخت، نه UI): تا الان همهٔ صفحات فقط از سرور می‌خواندند. سبد فرق دارد: می‌نویسد و باید ماندگار باشد (رفرش صفحه نباید سبد را پاک کند) و در چند جای اپ مشترک است (آیکن سبد در Header، دکمهٔ افزودن در ProductInfo، همین صفحه). برای همین state سبد نباید داخل این صفحه باشد؛ باید یک store سراسری باشد. این تصمیم روی چند قطعهٔ قبلی اثر پس‌رو دارد:
// دکمهٔ «افزودن به سبد» در ProductInfo باید cart.addItem(...) را صدا بزند.
// Header باید تعداد اقلام سبد را از همین store بخواند (بَجِ روی آیکن سبد).
// پیشنهاد جدی: قبل از ساختِ CartItem/CartSummary، اول stores/cart را طراحی کنیم (شکل state، اکشن‌ها، persist، و اینکه سمت سرور است یا فقط localStorage). بگو مدل سبد سمت سرور است (کاربر لاگین‌کرده، سبد در دیتابیس) یا محلی (localStorage تا زمان checkout) — این انتخاب کل امضای useCart را تعیین می‌کند.
// optimistic update و حالت mutating: تغییر تعداد یا حذف باید فوری در UI دیده شود (خوش‌بینانه)، بعد با سرور هماهنگ شود. برای همین disabled={cart.mutating} را گذاشتم تا هنگام درخواست، دکمه‌ها قفل شوند و از کلیک دوباره جلوگیری شود. اگر مدل سبد محلی (localStorage) باشد، mutating تقریباً بی‌معنی می‌شود (همه‌چیز آنی است) و می‌توان حذفش کرد. این هم به همان انتخابِ سرور/محلی گره خورده.
// حالت خالی، یک مسیر درجه‌یک: EmptyCart را یک قطعهٔ جدا کردم نه یک <p> ساده، چون این صفحه بیشترِ اوقات ممکن است خالی باشد و این حالت به CTA، طراحی و پیام تشویقی نیاز دارد (نه فقط «سبد خالی است»). تفکیک isEmpty() از loading هم عمدی است تا هنگام بارگذاری، لحظه‌ای پیام «سبد خالی» فلش نزند (همان ظرافتی که در ProductDetails برای not-found داشتیم).
// A11y و ساختار:
// از <main> با aria-labelledby به h1 استفاده کردم؛ h1 صفحه یک‌بار و همان «سبد خرید» است.
// دو ناحیهٔ اصلی (اقلام و خلاصه) aria-label جدا دارند تا صفحه‌خوان بین‌شان تفکیک کند.
// نکتهٔ مهمی که جایش در CartItem/CartSummary است: وقتی تعداد عوض می‌شود یا کالایی حذف می‌شود، تغییرِ جمع کل باید با یک ناحیهٔ aria-live="polite" اعلام شود (دقیقاً همان الگوی ProductResultsCount). پیشنهادم این است که این live-region داخل CartSummary باشد (چون آنجا عدد کل تغییر می‌کند). موقع ساختش این را رعایت می‌کنم.
// حذف کالا و مدیریت فوکوس: وقتی یک CartItem حذف می‌شود، فوکوس نباید «بیفتد». باید بعد از حذف، فوکوس به آیتم بعدی (یا «خالی‌کردن سبد» یا خودِ EmptyCart) منتقل شود. این جزئیات را در CartItem/Cart هماهنگ می‌کنیم؛ الان صرفاً علامت‌گذاری‌اش کردم که فراموش نشود.
// محاسبات مالی کجاست: عمداً subtotal/discount/shipping/total را آماده از store گرفتم و در UI حساب نکردم. دلیل: قیمت‌گذاری (مالیات، کوپن، هزینهٔ ارسال بر اساس آدرس) منطق حساسی است که نباید در چند جا تکرار شود و باید با سرور یکی باشد. CartSummary فقط نمایش‌دهنده است. اگر «کد تخفیف/کوپن» هم داریم، ورودی‌اش داخل CartSummary می‌نشیند و یک اکشن cart.applyCoupon(code) می‌خواهد — بگو تا در طراحی store و CartSummary لحاظش کنم.
// checkout صرفاً یک شروع است: onCheckout احتمالاً باید به مسیر /checkout ناوبری کند (یا اگر تک‌صفحه‌ای است، مرحله را جلو ببرد). فعلاً به store سپردم تا صفحه از جزئیاتش بی‌خبر بماند؛ اگر ناوبری ساده است، می‌توانیم مستقیم از useNavigate هم استفاده کنیم. بگو کدام.
// بدون inline style و کاملاً BEM؛ نکات CSS: cart__layout را در دسکتاپ دوستونه کن (display: grid; grid-template-columns: minmax(0, 1fr) 320px) و در موبایل تک‌ستون؛ cart__summary را در دسکتاپ position: sticky; inset-block-start کن تا هنگام اسکرول لیستِ بلندِ اقلام، خلاصه و دکمهٔ ثبت سفارش در دید بماند (همان الگوی sticky که برای ProductInfo پیشنهاد دادم)؛ در موبایل، CartSummary را می‌توان به پایین چسباند یا زیر لیست گذاشت؛ از خاصیت‌های منطقی برای RTL استفاده کن.