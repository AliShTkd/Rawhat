// @ts-nocheck

// pages/Account/Account.tsx
import {
  Show,
  createEffect,
  type Component,
  type ParentComponent,
} from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate, useLocation } from "@solidjs/router";

import AccountNav from "../../components/account/AccountNav";
import AccountSkeleton from "../../components/account/AccountSkeleton";

import { useAuth } from "../../stores/userStore";

const Account: ParentComponent = (props) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // گاردِ مسیرِ محافظت‌شده — reactive، نه یک‌بار در onMount
  // چون وضعیت auth ممکن است async مشخص شود، و اگر وسط کار logout شد هم باید واکنش دهد
  createEffect(() => {
    if (auth.ready && !auth.isAuthenticated) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect}`, { replace: true });
    }
  });

  return (
    <main class="account" aria-labelledby="account-title">
      <Title>حساب کاربری | فروشگاه</Title>

      <h1 class="account__title" id="account-title">
        حساب کاربری
      </h1>

      {/* تا وقتی auth مشخص نشده، نه محتوا نه ریدایرکت — فقط اسکلت */}
      <Show when={auth.ready} fallback={<AccountSkeleton />}>
        {/* اگر لاگین نیست، createEffect دارد ریدایرکت می‌کند؛ اینجا چیزی نکش */}
        <Show when={auth.isAuthenticated}>
          <div class="account__layout">
            {/* ستون ناوبری حساب */}
            <aside class="account__nav" aria-label="بخش‌های حساب کاربری">
              <AccountNav
                user={auth.user}
                currentPath={location.pathname}
                onLogout={() => auth.logout()}
              />
            </aside>

            {/* ستون محتوا — زیربخش‌ها از nested route می‌آیند */}
            <section class="account__content">
              {props.children}
            </section>
          </div>
        </Show>
      </Show>
    </main>
  );
};

export default Account;












// توضیح کوتاه استفاده: این یک layout محافظت‌شده برای کل بخش /account/* است، نه یک صفحهٔ برگ. آن را به‌صورت مسیر والد رجیستر کن و زیربخش‌ها (/account، /account/orders، /account/addresses، …) را به‌عنوان مسیرهای فرزند داخلش بگذار؛ محتوای هر فرزند از طریق props.children در account__content رندر می‌شود. تنها زیرساختی که مصرف می‌کند stores/auth است (ready، isAuthenticated، user، logout). چون خودش گاردِ auth دارد، هر فرزندی که زیرش بگذاری خودبه‌خود محافظت‌شده است — منطق ریدایرکت را یک‌بار اینجا نوشتیم تا در تک‌تک زیرصفحه‌ها تکرار نشود.




// رسیدیم به حساب کاربری — و این اولین صفحهٔ محافظت‌شده‌ای است که واقعاً «متعلق به کاربر» است (نه یک فرمِ بی‌هویت مثل login/register). تا الان stores/auth را فقط برای «ورود/ثبت‌نام» مصرف کردیم؛ اینجا برای خواندن هویت و گارد کردن دسترسی مصرفش می‌کنیم. این صفحه یک ارکستریتورِ داشبورد است: خودش داده‌ای ندارد، فقط بخش‌های حساب را کنار هم می‌چیند و ناوبری داخلی‌شان را مدیریت می‌کند.

// فرض‌هایی که گذاشتم (تصمیم‌های بزرگ — بخوان):

// صفحهٔ محافظت‌شده: کاربر ناشناس اینجا کاری ندارد → اگر لاگین نیست به /login?redirect=/account می‌رود. این همان گاردِ مسیر است که در Checkout هم لازم داشتیم؛ پس منطقش را یک‌بار می‌نویسم و بعداً به یک <RequireAuth> مشترک تبدیلش می‌کنیم.
// layout داشبوردی: یک ستون ناوبری کنار (AccountNav: پروفایل، سفارش‌ها، آدرس‌ها، خروج) + یک ستون محتوا. زیربخش‌ها مسیرهای تودرتو (nested routes) هستند، نه state محلی — چون هرکدام URL و داده و loading خودشان را دارند.
// auth ممکن است async باشد: تا وقتی وضعیت هویت «مشخص» نشده، نه فرم را نشان می‌دهیم نه بیرونش می‌کنیم — همان الگوی «تفکیک loading از empty» که در Cart/Checkout داشتیم، اینجا به شکل «آیا auth هنوز در حال بررسی است؟».



// نکات مهم:

// بزرگ‌ترین تصمیم — گارد به‌صورت createEffect نه onMount: برخلاف Checkout که آنجا onMount گذاشتم، اینجا عمداً createEffect است. دلیل: (۱) وضعیت auth ممکن است async باشد (بعد از چک /me مشخص شود)، پس باید منتظر auth.ready بمانیم؛ (۲) اگر کاربر وسط کار logout کند (مثلاً از تب دیگر یا از خود AccountNav)، این effect فوراً واکنش می‌دهد و بیرونش می‌کند. پیشنهاد: این دقیقاً همان الگوی گاردی است که Checkout هم باید داشته باشد؛ بیایید هر دو را به یک <RequireAuth redirect={...}> مشترک تبدیل کنیم تا در یک‌جا نگه‌داری شود. بگو تا آن wrapper را طراحی کنم.

// auth.ready — قطعهٔ گمشدهٔ امضای stores/auth: این صفحه نشان داد که stores/auth علاوه بر isAuthenticated/user حتماً به یک پرچم ready (یا loading) نیاز دارد تا «هنوز نمی‌دانیم» را از «قطعاً مهمان است» جدا کند. بدون آن، هر صفحهٔ محافظت‌شده هنگام رفرش یک لحظه کاربر را اشتباهاً بیرون می‌اندازد. این را به امضای useAuth اضافه می‌کنم: { ready, isAuthenticated, user, login, register, logout }.

// چرا nested routes نه state محلی؟ در Checkout مرحله‌ها را با state محلی زدم چون یک جریانِ خطیِ به‌هم‌وابسته بودند. ولی زیربخش‌های حساب (پروفایل/سفارش‌ها/آدرس‌ها) مستقل‌اند: هرکدام URL جدا (قابل بوکمارک)، دادهٔ جدا، و loading جدا دارند. پس مسیر تودرتو درست‌تر است؛ Account فقط قاب و گارد و ناوبری را می‌دهد و props.children را می‌نشاند.

// AccountNav و خروج: دکمهٔ «خروج» همین‌جا auth.logout() را صدا می‌زند. بعد از logout، همان createEffect بالا کاربر را به /login می‌فرستد — پس نیازی نیست خودِ AccountNav ناوبری کند؛ فقط اکشن را تریگر می‌کند و گارد بقیه‌اش را می‌گیرد. این تفکیک تمیزتر است (نقطهٔ تصمیمِ ریدایرکت یک‌جاست). نکته: logout هم باید سبد کاربر را پاک/به سبد مهمان برگرداند — این همان تلاقی stores/auth و stores/cart است که در Login گفتم.

// currentPath برای highlight: به AccountNav می‌دهم تا آیتم فعال را مشخص کند؛ ولی داخل خودش بهتر است از <A>ِ روتر با کلاس active استفاده کند (روتر خودش تطبیق مسیر را می‌فهمد). currentPath را به‌عنوان پشتیبان/راحتی پاس می‌دهم — موقع ساخت AccountNav تصمیم می‌گیریم کدام تمیزتر است.

// A11y: aria-labelledby روی main به h1؛ account__nav یک <aside> با aria-label تا landmark ناوبری حساب مشخص باشد؛ اسکلت (AccountSkeleton) هنگام نامشخص‌بودن auth تا از پرشِ layout و اعلام زودهنگام جلوگیری شود. هر زیرصفحه باید <h2> خودش را داشته باشد (h1 اینجا «حساب کاربری» است).

// CSS (بدون inline، BEM): account__layout دوستونه در دسکتاپ (nav باریک سمت راست در RTL، محتوا پهن)، تک‌ستون در موبایل؛ در موبایل account__nav یا بالای محتوا یا به شکل منوی افقی/کشویی؛ از خاصیت‌های منطقی برای RTL؛ account__content را min-inline-size: 0 بده تا محتوای پهن (جدول سفارش‌ها) layout را نشکند.



// قطعات جدیدی که این صفحه اضافه کرد:

// قطعه	وضعیت
// Account (layout)	✅ (همین حالا)
// AccountNav	⛔ (جدید)
// AccountSkeleton	⛔ (جدید)
// زیرصفحه‌ها: Profile, Orders, Addresses	⛔ (فرزندانِ nested route)
// stores/auth (ready, logout)	⛔ (زیرساخت — امضایش کامل‌تر شد)
// <RequireAuth> (پیشنهادی)	⛔ (گاردِ مشترکِ Account و Checkout)



// هشدار صادقانه (باز هم، چون حالا هفت صفحهٔ ارکستریتور داریم): این صفحه یک چیز مهم را روشن کرد — Account خودش دری به یک زیردرختِ کامل است (Profile/Orders/Addresses)، یعنی پشتهٔ نساخته‌ها فقط بزرگ‌تر شد. ولی نکتهٔ مثبت: Account تقریباً هیچ زیرساخت جدیدی نیاورد؛ فقط دو چیز را قطعی کرد که از قبل معلق بودند: (۱) stores/auth به ready نیاز دارد، (۲) گاردِ auth باید یک قطعهٔ مشترک باشد (Account + Checkout).

// پیشنهاد قاطعم دیگر عوض نمی‌شود: بس است عرض، برویم عمق. اولویت با در نظر گرفتن این صفحه:

// stores/auth — حالا چهار جا (Login, Register, Checkout, Account) به آن قفل‌اند و این صفحه امضایش را کامل کرد (ready, user, logout علاوه بر login/register). این باید اولین چیزِ واقعی‌ساخته‌شده باشد.
// <RequireAuth> — چون هم Account هم Checkout عین هم گارد می‌خواهند؛ کوچک است و بدهی تکراری را حذف می‌کند.
// یک صفحه را end-to-end ببندیم.
// قبل از ساخت stores/auth، همان سه تصمیمِ معلق را لازم دارم (هیچ‌کدام هنوز جواب نگرفته و همه‌شان امضای این store را قفل کرده‌اند):

// سشن: کوکی httpOnly (توصیهٔ من) یا توکن در localStorage؟
// ready/بررسی اولیهٔ سشن از /me می‌آید؟ (تقریباً حتماً بله، ولی تأیید کن.)
// logout با سبد چه‌کند — پاک شود یا به سبد مهمان برگردد؟
// می‌خواهی همین حالا stores/auth را بسازم (با فرضِ کوکی httpOnly + /me + ready)، یا اول <RequireAuth> را که کوچک است و بلافاصله Account و Checkout را تمیز می‌کند؟ 🙂