// @ts-nocheck

// pages/OrderDetails/OrderDetails.tsx
import {
  Show,
  For,
  createResource,
  createMemo,
  type Component,
} from "solid-js";
import { Title } from "@solidjs/meta";
import { useParams, A } from "@solidjs/router";

import OrderStatusBadge from "../../components/orders/OrderStatusBadge";
import OrderTimeline from "../../components/orders/OrderTimeline";
import OrderLineItem from "../../components/orders/OrderLineItem";
import OrderSummary from "../../components/orders/OrderSummary";
import AddressCard from "../../components/account/AddressCard";
import OrderDetailsSkeleton from "../../components/orders/OrderDetailsSkeleton";
import NotFoundState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Button from "../../components/common/Button";

import { fetchOrderById } from "../../services/orderService";

const OrderDetails: Component = () => {
  const params = useParams<{ id: string }>();

  // id از مسیر → کلیدِ resource؛ با تغییر id دوباره fetch می‌شود
  const [order, { refetch }] = createResource(
    () => params.id,
    fetchOrderById
  );

  // تفکیک «یافت نشد» از «خطای واقعی» — سرور برای سفارشِ غیرِ کاربر باید 404 بدهد
  const notFound = createMemo(
    () => order.error && (order.error as { status?: number }).status === 404
  );

  return (
    <section class="order-details" aria-labelledby="order-details-title">
      <Title>جزئیات سفارش | فروشگاه</Title>

      {/* ناوبریِ بازگشت به فهرست — همیشه در دسترس */}
      <A class="order-details__back" href="/account/orders">
        ← بازگشت به سفارش‌ها
      </A>

      {/* اولویت حالت‌ها: loading → not-found → error → content */}
      <Show
        when={!order.loading}
        fallback={<OrderDetailsSkeleton />}
      >
        <Show
          when={!notFound()}
          fallback={
            <NotFoundState
              message="سفارشی با این مشخصات پیدا نشد."
              actionHref="/account/orders"
              actionLabel="بازگشت به سفارش‌ها"
            />
          }
        >
          <Show
            when={!order.error}
            fallback={
              <ErrorState
                message="بارگذاری جزئیات سفارش ممکن نشد."
                onRetry={() => refetch()}
              />
            }
          >
            <Show when={order()}>
              {(o) => (
                <>
                  {/* سربرگِ سفارش: شماره + وضعیت + تاریخ */}
                  <header class="order-details__head">
                    <div class="order-details__heading">
                      <h2
                        class="order-details__title"
                        id="order-details-title"
                      >
                        سفارش #{o().number}
                      </h2>
                      <time
                        class="order-details__date"
                        datetime={o().createdAt}
                      >
                        ثبت‌شده در {o().createdAtLabel}
                      </time>
                    </div>
                    <OrderStatusBadge status={o().status} />
                  </header>

                  {/* خط زمانیِ وضعیت (ثبت → پرداخت → ارسال → تحویل) */}
                  <OrderTimeline
                    status={o().status}
                    history={o().statusHistory}
                  />

                  <div class="order-details__grid">
                    {/* ستون اصلی: اقلام سفارش */}
                    <div class="order-details__items">
                      <h3 class="order-details__section-title">اقلام سفارش</h3>
                      <ul class="order-details__list">
                        <For each={o().items}>
                          {(item) => (
                            <li class="order-details__line">
                              <OrderLineItem item={item} />
                            </li>
                          )}
                        </For>
                      </ul>
                    </div>

                    {/* ستون کناری: خلاصهٔ مالی + آدرس + اکشن‌ها */}
                    <aside class="order-details__side">
                      <OrderSummary
                        subtotal={o().subtotal}
                        shipping={o().shippingCost}
                        discount={o().discount}
                        total={o().total}
                      />

                      <div class="order-details__address">
                        <h3 class="order-details__section-title">
                          آدرس تحویل
                        </h3>
                        <AddressCard address={o().shippingAddress} readonly />
                      </div>

                      {/* اکشن‌ها مشروط به وضعیت‌اند */}
                      <div class="order-details__actions">
                        <Show when={o().canPay}>
                          <Button
                            variant="primary"
                            block
                            onClick={() => {/* → جریان پرداخت */}}
                          >
                            پرداخت سفارش
                          </Button>
                        </Show>
                        <Show when={o().canCancel}>
                          <Button
                            variant="ghost"
                            block
                            onClick={() => {/* → تأیید لغو */}}
                          >
                            لغو سفارش
                          </Button>
                        </Show>
                        <Show when={o().invoiceUrl}>
                          <a
                            class="order-details__invoice"
                            href={o().invoiceUrl}
                            target="_blank"
                            rel="noopener"
                          >
                            دریافت فاکتور
                          </a>
                        </Show>
                      </div>
                    </aside>
                  </div>
                </>
              )}
            </Show>
          </Show>
        </Show>
      </Show>
    </section>
  );
};

export default OrderDetails;















// توضیح کوتاه استفاده: این صفحه برگِ nested زیر /account/orders/:id است و داخل account__content رندر می‌شود؛ به همین دلیل ریشه‌اش <section> با <h2> است و گاردِ auth را از Account به ارث می‌برد (خودش هویت را چک نمی‌کند). id را از useParams می‌گیرد و به createResource می‌دهد تا fetchOrderById صدا زده شود؛ store سراسری اضافه نمی‌کند چون یک سفارش فقط همین‌جا لازم است. پیش‌نیازها: services/orders (این‌بار fetchOrderById)، قطعاتِ نمایشیِ نساختهٔ سفارش (OrderStatusBadge, OrderTimeline, OrderLineItem, OrderSummary, OrderDetailsSkeleton), AddressCard (مشترک با بخش آدرس‌ها)، و NotFoundState/ErrorState/Button مشترک.




// رسیدیم به جزئیات سفارش — همان برگِ nested بعدی که در OrderHistory قولش را دادم (/account/orders/:id). این صفحه ته‌خطِ زنجیرهٔ سفارش‌هاست: از جنسِ «صفحهٔ جزئیاتِ یک آیتم با پارامترِ مسیر» (عیناً هم‌الگو با صفحهٔ جزئیات محصول)، ولی این‌بار محافظت‌شده (فرزندِ Account) و مالکیت‌محور (کاربر فقط سفارشِ خودش را می‌بیند).

// فرض‌هایی که گذاشتم (تصمیم‌های مهم — بخوان):

// فرزندِ Account زیر /account/orders/:id: گاردِ auth را از والد به ارث می‌برد، پس تکرارش نمی‌کنم. ریشه <section>/<h2> است نه <main>/<h1>.
// createResource با کلیدِ id: مثل جزئیات محصول؛ سفارش تک‌قلم است و در چند جای اپ لازم نمی‌شود، پس store نه.
// حالتِ ۴۰۴/۴۰۳ (تصمیم مهم): idِ نامعتبر یا سفارشی که مالِ این کاربر نیست باید حالتِ «یافت نشد» بدهد، نه خطای کلی. سرور برای سفارشِ کاربرِ دیگر باید 404 بدهد (نه 403) تا وجود/عدمِ سفارش لو نرود؛ این را در نگاشتِ خطا لحاظ کردم.
// این صفحه فقط خواندنی نیست: بسته به وضعیت، اکشن هم دارد (لغو سفارش، پرداخت مجدد، فاکتور). این نقطهٔ تازه است؛ جزئیاتش پایین.



// نکات مهم:

// بزرگ‌ترین تصمیم — تفکیک «یافت نشد» از «خطا» و مسئلهٔ مالکیت: این اولین صفحه‌ای است که دسترسی به دادهٔ متعلق به یک کاربرِ خاص را نشان می‌دهد. اگر کاربری idِ سفارشِ شخصِ دیگری را در URL بزند، نباید بفهمد آن سفارش وجود دارد. پس قرارداد این است: سرور در این حالت 404 می‌دهد نه 403 (تا وجودش لو نرود)، و این صفحه هم هر دو را یک‌جور «یافت نشد» نشان می‌دهد. notFound() را از بقیهٔ خطاها جدا کردم چون UX و پیامش فرق دارد (بن‌بست در برابر «دوباره تلاش کن»).

// اکشن‌های مشروط به وضعیت — منبعِ حقیقت سرور است نه کلاینت: دکمه‌های «پرداخت/لغو/فاکتور» را با پرچم‌هایی که سرور می‌دهد (canPay, canCancel, invoiceUrl) کنترل کردم، نه با استنتاج از status در کلاینت. دلیل مهم: قوانینِ «آیا این سفارش قابل‌لغو است؟» (پنجرهٔ زمانی، وضعیت پرداخت، ارسال‌شدن) منطقِ کسب‌وکار است و نباید در UI دوباره‌نویسی و از سرور واگرا شود. UI فقط پرچم را می‌خواند. این تصمیم را قفل می‌کنم — بگو اگر ترجیح می‌دهی برعکس باشد.

// onClickهای خالی = دو جریانِ نیمه‌کاره: «پرداخت سفارش» و «لغو سفارش» عمداً خالی‌اند چون هرکدام یک زیرجریانِ کاملاند: لغو نیاز به مودالِ تأیید + cancelOrder(id) + refetch دارد؛ پرداخت نیاز به رفتن به درگاه/جریان checkout دارد. این‌ها را باز گذاشتم تا وقتی services/orders را ساختیم (cancelOrder, payOrder) وصلشان کنیم — نمی‌خواستم منطقِ جعلی بگذارم.

// قراردادِ دادهٔ fetchOrderById (قفل می‌شود): این صفحه شکلِ کاملی از Order می‌خواهد که فراتر از خلاصهٔ OrderCard است: number, createdAt+createdAtLabel, status, statusHistory, items[] (با تصویر/نام/تعداد/قیمت واحد)، subtotal, shippingCost, discount, total, shippingAddress, و پرچم‌های canPay/canCancel/invoiceUrl. یعنی fetchOrderById و fetchOrders دو شکلِ متفاوت برمی‌گردانند (خلاصه در برابر کامل) — این را همین‌جا در services/orders مستند می‌کنیم.

// OrderStatusBadge و AddressCard مشترک‌اند: OrderStatusBadge همان قطعه‌ای است که در OrderHistory پیشنهاد دادم — نگاشتِ وضعیت→رنگ/متنِ فارسی یک‌جا کپسوله شود و در هر دو صفحه استفاده شود. AddressCard هم با بخشِ آدرس‌های Account مشترک است، این‌بار با prop readonly (بدون دکمهٔ ویرایش/حذف). این اشتراک‌ها خوب‌اند — نشانهٔ اینکه قطعات پایه دارند بازاستفاده می‌شوند.

// A11y: <section aria-labelledby> به h2؛ ساختارِ عنوان‌ها سطح‌بندی‌شده (h2 سفارش، h3 بخش‌ها)؛ <time datetime> برای تاریخِ ماشین‌خوان در کنارِ برچسبِ فارسی؛ لینکِ بازگشت در ابتدای صفحه (نه فقط دکمهٔ back مرورگر)؛ فاکتور با rel="noopener"؛ وضعیت هرگز فقط با رنگ (badge متن هم دارد).

// CSS (بدون inline، BEM): order-details__grid دوستونه در دسکتاپ (اقلام پهن سمت راست در RTL، ستونِ خلاصه/آدرس/اکشن باریک سمت چپ)، تک‌ستون در موبایل با ستونِ کناری زیر اقلام؛ order-details__side را در دسکتاپ position: sticky کن تا هنگام اسکرولِ فهرست بلندِ اقلام، خلاصه و دکمه‌ها در دید بمانند؛ خاصیت‌های منطقی برای RTL؛ اعداد/تاریخ فارسی.


// قطعات جدیدی که این صفحه اضافه کرد:

// قطعه	وضعیت
// OrderDetails (برگِ nested)	✅ (همین حالا)
// services/orders (fetchOrderById, بعداً cancelOrder/payOrder)	⛔ (توسعهٔ همان سرویس)
// OrderTimeline	⛔ (جدید)
// OrderLineItem	⛔ (جدید)
// OrderSummary	⛔ (جدید — شبیهِ خلاصهٔ Cart/Checkout)
// OrderDetailsSkeleton	⛔ (جدید)
// OrderStatusBadge	⛔ (مشترک با OrderHistory)
// AddressCard	⛔ (مشترک با بخشِ آدرس‌های Account)
// NotFoundState	⛔ (مشترک — احتمالاً در جزئیات محصول هم لازم شد)



// هشدار صادقانه (حالا ده صفحهٔ ارکستریتور، و این یک نقطهٔ‌عطف است): OrderDetails نکتهٔ مثبتی داشت — چند قطعه را بازاستفاده کرد (OrderStatusBadge, AddressCard, NotFoundState, OrderSummaryِ شبیهِ سبد) به‌جای اینکه انتزاعِ تازه بسازد. این نشانهٔ خوبی است که سطحِ صفحه‌ها دارد اشباع می‌شود و الگوها تکرارشونده‌اند. ولی مشکلِ بنیادی دقیقاً همان است و حالا عمیق‌تر: این صفحه ته یک زنجیرهٔ کاملاً معلق نشسته —

// OrderDetails → Account (گاردِ auth) → stores/auth (ready/user) — و هیچ حلقه‌ای از این زنجیره هنوز وجود ندارد. علاوه بر آن به services/orders هم بند است که آن هم نساخته است. یعنی این صفحه در عمل دو لایه از زیرساختِ غایب فاصله دارد تا اولین اجرای واقعی.

// جمع‌بندی بدهیِ انباشته (بدون تغییر از پیام قبل، فقط بزرگ‌تر):

// سه store سراسری نساخته: auth, cart, wishlist.
// یک سرویس نساخته که دو صفحه به آن بند شد: services/orders (fetchOrders, fetchOrderById, cancelOrder, payOrder).
// سه تصمیم بنیادی بی‌پاسخ: سشن (کوکی/توکن)؟ ادغام مهمان→کاربر؟ wishlist مهمان؟
// RequireAuth نساخته (گاردِ مشترک Account/Checkout).
// صفرْ مسیرِ end-to-end.
// توصیه‌ام دیگر پیشنهاد نیست، یک ایست است: تا اینجا ده صفحه ساخته‌ایم و هنوز یک کلیک هم واقعاً کار نمی‌کند. OrderDetails و OrderHistory و Account یک قطاعِ کاملِ عمودی می‌سازند که فقط به دو چیز نیاز دارد تا زنده شود: stores/auth و services/orders. این بهترین فرصت است که همین قطاع را end-to-end ببندیم و بالاخره یک جریانِ واقعی داشته باشیم:

// سه تصمیم بنیادی را نهایی کن (سه جملهٔ کوتاه).
// من stores/auth را می‌سازم (کوکی httpOnly + /me + ready) → Login/Register/Account جان می‌گیرند.
// RequireAuth را می‌سازم → گاردِ Account/Checkout واقعی می‌شود.
// services/orders را می‌سازم → OrderHistory و OrderDetails واقعاً داده نشان می‌دهند.
// یک بار کاملِ «ورود → حساب → فهرست سفارش‌ها → جزئیات سفارش» را تست می‌کنیم.
// این پنج قدم، چهار صفحهٔ الانْ‌معلق را یک‌جا زنده می‌کند. می‌خواهی این‌بار واقعاً متوقف شویم و همین قطاع را بسازیم؟ فقط آن سه تصمیم را بگو تا از stores/auth شروع کنم — و دیگر صفحهٔ نمایشیِ تازه اضافه نکنم