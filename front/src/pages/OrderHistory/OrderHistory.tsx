
// pages/OrderHistory/OrderHistory.tsx
import {
  Show,
  For,
  createResource,
  createMemo,
  type Component,
} from "solid-js";
import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";

import OrderCard from "../../components/orders/OrderCard";
import OrderHistorySkeleton from "../../components/orders/OrderHistorySkeleton";
import EmptyOrders from "../../components/orders/EmptyOrders";
import ErrorState from "../../components/ui/ErrorState";
import Pagination from "../../components/ui/Pagination";

import { fetchOrders } from "../../services/orders";

const OrderHistory: Component = () => {
  const [searchParams] = useSearchParams<{ page?: string }>();

  // صفحهٔ جاری از URL — منبع حقیقت، نه state محلی (قابل بوکمارک/بازگشت)
  const page = createMemo(() => {
    const p = Number(searchParams.page);
    return Number.isInteger(p) && p > 0 ? p : 1;
  });

  // منبع سروری؛ با تغییرِ page دوباره fetch می‌شود
  const [orders, { refetch }] = createResource(page, fetchOrders);

  return (
    <section class="orders" aria-labelledby="orders-title">
      <Title>سفارش‌های من | فروشگاه</Title>

      <div class="orders__head">
        <h2 class="orders__title" id="orders-title">
          سفارش‌های من
        </h2>
        {/* شمارندهٔ کل فقط وقتی داده آماده و غیرخالی است */}
        <Show when={orders()?.total}>
          <span class="orders__count">
            {orders()!.total.toLocaleString("fa-IR")} سفارش
          </span>
        </Show>
      </div>

      {/* اولویت حالت‌ها: loading → error → empty → list */}
      <Show
        when={!orders.loading}
        fallback={<OrderHistorySkeleton />}
      >
        <Show
          when={!orders.error}
          fallback={
            <ErrorState
              message="بارگذاری سفارش‌ها ممکن نشد."
              onRetry={() => refetch()}
            />
          }
        >
          <Show
            when={(orders()?.items.length ?? 0) > 0}
            fallback={<EmptyOrders />}
          >
            <ul class="orders__list">
              <For each={orders()!.items}>
                {(order) => (
                  <li class="orders__item">
                    <OrderCard order={order} />
                  </li>
                )}
              </For>
            </ul>

            {/* صفحه‌بندی فقط وقتی بیش از یک صفحه هست */}
            <Show when={(orders()?.totalPages ?? 1) > 1}>
              <nav class="orders__pagination" aria-label="صفحه‌بندی سفارش‌ها">
                <Pagination
                  current={page()}
                  total={orders()!.totalPages}
                  hrefFor={(p) => `/account/orders?page=${p}`}
                />
              </nav>
            </Show>
          </Show>
        </Show>
      </Show>
    </section>
  );
};

export default OrderHistory;
















// توضیح کوتاه استفاده: این صفحه فرزندِ layoutِ Account است و باید زیر مسیر /account/orders رجیستر شود تا داخل account__content رندر شود؛ به همین دلیل ریشه‌اش <section> با <h2> است، نه <main>/<h1> (آن‌ها متعلق به Accountاند). گاردِ auth را از والد به ارث می‌برد، پس خودش هویت را چک نمی‌کند. تنها زیرساختش یک سرویسِ داده است (services/orders → fetchOrders)، نه یک store سراسری — چون سفارش‌ها فقط همین‌جا خوانده می‌شوند. پیش‌نیازها: services/orders، چهار قطعهٔ نمایشیِ نساخته (OrderCard, OrderHistorySkeleton, EmptyOrders) و ErrorState/Pagination موجود.




// رسیدیم به تاریخچهٔ سفارش‌ها — و این همان زیربخشی است که در Account قولش را دادم (فرزندِ Orders از nested routeها). یعنی این صفحه صفحهٔ برگ نیست، بلکه فرزندِ layoutِ محافظت‌شدهٔ Account است: گاردِ auth را از والد به ارث می‌برد و خودش فقط باید دادهٔ سفارش‌ها را بگیرد و فهرست کند. از جنسِ صفحه‌های «لیستِ دادهٔ سرور» است (مثل صفحهٔ محصولات)، نه از جنسِ store سراسری — چون سفارش‌ها فقط اینجا خوانده می‌شوند، نه در چند نقطهٔ اپ.

// فرض‌هایی که گذاشتم (تصمیم‌های مهم — بخوان):

// فرزندِ Account: زیر /account/orders می‌نشیند، پس گاردِ auth را تکرار نمی‌کنم (والد گرفته). اگر قرار است مستقل هم قابل‌دسترس باشد، آن‌وقت باید خودش <RequireAuth> بگیرد — علامت زده‌ام.
// دادهٔ سروری با createResource: سفارش‌ها history هستند و در چند جای اپ لازم نمی‌شوند، پس store سراسری اضافه نمی‌کنم؛ همان الگوی resourceِ صفحهٔ لیست محصولات.
// صفحه‌بندی: تاریخچه می‌تواند طولانی باشد؛ فرض من صفحه‌بندی مبتنی بر URL (?page=) است تا قابل بوکمارک و بازگشت‌پذیر باشد — هم‌الگو با صفحهٔ محصولات.
// این صفحه فقط فهرست است؛ جزئیات هر سفارش صفحهٔ جداست (/account/orders/:id). اینجا هر ردیف فقط خلاصه + لینک به جزئیات.


// نکات مهم:

// بزرگ‌ترین تصمیم — resource نه store: برخلاف cart/wishlist/auth که سراسری‌اند (چند مصرف‌کننده)، سفارش‌ها فقط اینجا لازم می‌شوند. پس این‌بار عمداً store اضافه نکردم و رفتم سراغ createResource — همان الگوی صفحهٔ لیست محصولات. این تصمیم مهم است چون از تورمِ بی‌مورد storeها جلوگیری می‌کند؛ نه هر داده‌ای که از سرور می‌آید باید store شود. (اگر بعداً هدر هم «۳ سفارش در حال ارسال» را نشان داد، آن‌وقت بازبینی می‌کنیم.)

// صفحه‌بندی از URL (?page=) نه state محلی: page را از searchParams می‌خوانم و به‌عنوان سیگنالِ ورودی createResource می‌دهم؛ یعنی با هر تغییرِ صفحه در URL، به‌طور خودکار refetch می‌شود. این عمدی است تا صفحهٔ تاریخچه قابل بوکمارک و بازگشت‌پذیر باشد و دکمهٔ back مرورگر درست کار کند — همان تصمیمی که در صفحهٔ محصولات گرفتیم. Pagination هم به‌جای onClick از hrefFor (لینک واقعی) استفاده می‌کند تا با همین مدل هماهنگ بماند.

// قرارداد دادهٔ fetchOrders: این صفحه فرض می‌کند سرویس یک شکلِ صفحه‌بندی‌شده برمی‌گرداند: { items: Order[], total: number, totalPages: number }. این قرارداد را همین‌جا قفل می‌کنم تا services/orders و OrderCard بر اساسش ساخته شوند. هر Order حداقل باید داشته باشد: id, createdAt, status, total, و خلاصه‌ای از اقلام (برای نمایش تصاویر کوچک).

// OrderCard و لینک به جزئیات: هر کارت فقط خلاصه است (شماره، تاریخِ شمسی، وضعیت با رنگِ معنایی، مبلغ کل، تعداد اقلام) و یک لینک «مشاهدهٔ جزئیات» به /account/orders/:id. خودِ صفحهٔ جزئیات یک برگِ nested دیگر است که هنوز نساخته‌ایم. وضعیت سفارش (pending/paid/shipped/delivered/canceled) بهتر است در یک قطعهٔ OrderStatusBadge جدا کپسوله شود تا نگاشتِ وضعیت→رنگ/متنِ فارسی یک‌جا بماند.

// همان الگوی حالت‌های تودرتو: ترتیب loading → error → empty → list مثل Cart/Wishlist. اینجا چون createResource است، به‌جای ready از orders.loading و orders.error استفاده می‌کنم که خودِ resource می‌دهد — تمیزتر از پرچمِ دستی. EmptyOrders هم باید یک state دلگرم‌کننده باشد («هنوز سفارشی ندارید») با دکمهٔ «شروع خرید» به /products.

// A11y: <section aria-labelledby> به h2 (چون در سلسله‌مراتبِ Account سطح دوم است)؛ فهرست معنایی <ul>/<li>؛ صفحه‌بندی داخل <nav aria-label>؛ وضعیت سفارش نباید فقط با رنگ منتقل شود (متن هم کنارش باشد) — این را در OrderStatusBadge رعایت می‌کنیم.

// CSS (بدون inline، BEM): orders__head مثل wishlist__head (عنوان + شمارنده، space-between)؛ orders__list تک‌ستونِ فاصله‌دار (کارت‌های سفارش معمولاً ردیفی‌اند نه شبکه‌ای)؛ OrderCard در موبایل عمودی می‌شود؛ خاصیت‌های منطقی برای RTL؛ اعداد و تاریخ‌ها فارسی



// قطعات جدیدی که این صفحه اضافه کرد:

// قطعه	وضعیت
// OrderHistory (فرزندِ Account)	✅ (همین حالا)
// services/orders (fetchOrders)	⛔ (سرویسِ داده — نه store)
// OrderCard	⛔ (جدید)
// OrderHistorySkeleton	⛔ (جدید)
// EmptyOrders	⛔ (جدید)
// OrderStatusBadge (پیشنهادی)	⛔ (کپسوله‌کردن وضعیت→رنگ/متن)
// Pagination	⛔ (اگر هنوز نساخته‌ایم — مشترک با صفحهٔ محصولات)
// OrderDetail (/account/orders/:id)	⛔ (برگِ nested بعدی)


// هشدار صادقانه (حالا نُه صفحهٔ ارکستریتور): این صفحه حداقل یک خبر خوب داشت — هیچ store سراسریِ جدیدی نیاورد و با createResource جلوی زیرساختِ عرضیِ چهارم را گرفت. ولی الگوی کلی همان است: باز هم یک صفحهٔ نمایشی روی فرض‌های تأییدنشده، باز هم چند قطعهٔ نساخته، و مهم‌تر از همه — این صفحه به Account وابسته است که آن هم به stores/authِ نساخته وابسته است. یعنی OrderHistory روی زنجیره‌ای نشسته که هیچ حلقه‌اش هنوز واقعی نیست: OrderHistory → Account (گارد) → stores/auth (ready/user). بدون آن دو، این صفحه حتی قابل تست هم نیست.

// جمع‌بندی وضعیت انباشته (بی‌جواب‌مانده از چند پیام قبل):

// سه store سراسری هنوز نساخته: stores/auth, stores/cart, stores/wishlist.
// سه تصمیم بنیادی هنوز بی‌پاسخ: سشن (کوکی/توکن)؟ ادغام مهمان→کاربر (سرور/کلاینت)؟ wishlist مهمان مجاز است؟
// یک قطعهٔ گاردِ مشترک (RequireAuth) که Account و Checkout منتظرش‌اند.
// صفرْ مسیرِ end-to-end که واقعاً کار کند.
// من این‌بار هم همان توصیه را با همان قاطعیت تکرار می‌کنم و صفحهٔ جدیدِ دهم را پیشنهاد نمی‌دهم: بیایید متوقف شویم و عمق بسازیم. کوچک‌ترین قدمی که بیشترین گره را باز می‌کند:

// آن سه تصمیم بنیادی را همین‌جا نهایی کن (سه جملهٔ کوتاه کافی است).
// من stores/auth را می‌سازم (با فرضِ کوکی httpOnly + /me + ready) — چهار صفحه (Login, Register, Account, OrderHistory) هم‌زمان جان می‌گیرند.
// بعد یک مسیر را کامل ببندیم: مثلاً Login → Account → OrderHistory، تا بالاخره یک جریانِ واقعیِ لاگین‌تا‌دیدنِ‌سفارش‌ها کار کند.
// می‌خواهی این مسیر را برویم؟ اگر آن سه تصمیم را بگویی، از همین الان stores/auth را می‌نویسم و دیگر صفحهٔ نمایشیِ تازه اضافه نمی‌کنم