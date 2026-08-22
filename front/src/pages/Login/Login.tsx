
// pages/Login/Login.tsx
import {
  Show,
  createSignal,
  createMemo,
  type Component,
} from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate, useSearchParams, A } from "@solidjs/router";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PasswordField from "../../components/auth/PasswordField";

import { useAuth } from "../../stores/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login: Component = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams<{ redirect?: string }>();

  // مقصد امن پس از ورود؛ فقط مسیرهای داخلی مجاز (جلوگیری از open redirect)
  const redirectTo = createMemo(() => {
    const r = searchParams.redirect;
    if (r && r.startsWith("/") && !r.startsWith("//")) return r;
    return "/";
  });

  // اگر از قبل وارد شده، نباید فرم ورود ببیند
  if (auth.isAuthenticated) {
    navigate(redirectTo(), { replace: true });
  }

  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [touched, setTouched] = createSignal(false);
  const [submitting, setSubmitting] = createSignal(false);
  const [formError, setFormError] = createSignal<string | null>(null);

  const emailError = createMemo(() => {
    if (!touched()) return null;
    if (!email()) return "ایمیل را وارد کنید.";
    if (!EMAIL_RE.test(email())) return "قالب ایمیل معتبر نیست.";
    return null;
  });

  const passwordError = createMemo(() => {
    if (!touched()) return null;
    if (!password()) return "رمز عبور را وارد کنید.";
    return null;
  });

  const isValid = createMemo(
    () => !emailError() && !passwordError() && !!email() && !!password()
  );

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setTouched(true);
    setFormError(null);
    if (!isValid()) return;

    setSubmitting(true);
    try {
      await auth.login({ email: email(), password: password() });
      // موفق: به مقصد امن برگرد
      navigate(redirectTo(), { replace: true });
    } catch (err) {
      // خطای واقعی از سرور (اعتبارنامه‌ی نادرست، قفل حساب و…)
      setFormError("ایمیل یا رمز عبور نادرست است.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main class="login" aria-labelledby="login-title">
      <Title>ورود به حساب | فروشگاه</Title>

      <div class="login__card">
        <h1 class="login__title" id="login-title">
          ورود به حساب
        </h1>
        <p class="login__subtitle">
          برای ادامه، وارد حساب کاربری خود شوید.
        </p>

        {/* خطای کلی فرم (از سرور) — فوری اعلام شود */}
        <Show when={formError()}>
          <div class="login__alert" role="alert">
            {formError()}
          </div>
        </Show>

        <form class="login__form" onSubmit={handleSubmit} novalidate>
          <div class="login__field">
            <Input
              type="email"
              name="email"
              label="ایمیل"
              autocomplete="email"
              inputmode="email"
              dir="ltr"
              value={email()}
              onInput={(v) => setEmail(v)}
              onBlur={() => setTouched(true)}
              error={emailError()}
              required
            />
          </div>

          <div class="login__field">
            <PasswordField
              name="password"
              label="رمز عبور"
              autocomplete="current-password"
              value={password()}
              onInput={(v) => setPassword(v)}
              onBlur={() => setTouched(true)}
              error={passwordError()}
              required
            />
          </div>

          <div class="login__row">
            <A class="login__forgot" href="/forgot-password">
              رمز عبور را فراموش کرده‌اید؟
            </A>
          </div>

          <Button
            type="submit"
            variant="primary"
            block
            loading={submitting()}
            disabled={submitting()}
          >
            ورود
          </Button>
        </form>

        <p class="login__footer">
          حساب کاربری ندارید؟{" "}
          <A
            class="login__link"
            href={`/register${
              searchParams.redirect
                ? `?redirect=${encodeURIComponent(searchParams.redirect)}`
                : ""
            }`}
          >
            ثبت‌نام
          </A>
        </p>
      </div>
    </main>
  );
};

export default Login;













// رسیدیم به ورود — و این هم مثل checkout یک نقطهٔ عطف است، ولی از جنس دیگر: اولین صفحه‌ای که با هویت و احراز هویت (auth) سروکار دارد. این یک زیرساختِ عرضی جدید می‌آورد (stores/auth) که مثل stores/cart در کل اپ مشترک است: هدر (نام کاربر/خروج)، گاردِ صفحه‌های محافظت‌شده (checkout، سفارش‌ها، پروفایل)، و حتی خودِ سبد (ادغام سبد مهمان با سبد کاربر پس از ورود) همه به آن وصل می‌شوند.

// فرض‌هایی که گذاشتم (این‌ها تصمیم‌های بزرگ‌اند — بخوان):

// یک Auth Store سراسری (stores/auth) وجود دارد و این صفحه فقط مصرف‌کنندهاش است؛ خودش توکن/سشن نگه نمی‌دارد، فقط login() را صدا می‌زند.
// بازگشت پس از ورود (redirect): اگر کاربر از یک صفحهٔ محافظت‌شده (مثل checkout) به اینجا پرت شده، بعد از ورود باید به همان‌جا برگردد. این را از query param (?redirect=/checkout) می‌خوانم.
// اگر از قبل لاگین است، اصلاً نباید فرم ورود ببیند → هدایت خودکار.
// فرم واقعی با اعتبارسنجی: اولین فرمِ «واقعیِ» پروژه است (checkout هنوز ساخته نشده). اعتبارسنجی سمت کلاینت برای UX، ولی خطای واقعی از سرور می‌آید (مثلاً «رمز اشتباه»).
// بدون نگه‌داشتن رمز: رمز فقط لحظه‌ای در فیلد است و مستقیم به login() می‌رود؛ هرگز در استیت ماندگار/لاگ نمی‌شود.


// زیرمؤلفه‌ها و زیرساخت‌های جدیدی که این صفحه فرض کرده:

// قطعه	نقش	جنس
// stores/auth (useAuth)	منبع حقیقتِ هویت: isAuthenticated, user, login(), logout()	زیرساخت — مهم‌ترین قطعه
// PasswordField	فیلد رمز با دکمهٔ نمایش/مخفی‌سازی	کم/متوسط (A11y دارد)
// Input	(قبلاً ساخته شده) فیلد متن با label/error	موجود
// Button	(قبلاً ساخته شده) با حالت loading	موجود









// نکات مهم:

// بزرگ‌ترین تصمیم — Auth Store (زیرساختِ عرضی جدید): درست مثل stores/cart، هویت هم نباید در این صفحه زندگی کند. stores/auth منبع حقیقتِ مشترک است و این‌ها به آن گیر می‌کنند:

// Header: نمایش نام کاربر / دکمهٔ خروج به‌جای «ورود».
// گاردِ مسیرها: Checkout, /orders, پروفایل باید کاربر ناشناس را به /login?redirect=... بفرستند.
// stores/cart: هنگام ورود، سبد مهمان باید با سبد کاربر ادغام شود (تصمیم مهم — پایین‌تر).
// پیشنهاد: قبل از هر فرم دیگری، اول stores/auth را طراحی کنیم (شکل user، نحوهٔ نگه‌داری سشن: کوکی httpOnly یا توکن؟).

// مسئلهٔ امنیتی #۱ — نگه‌داری سشن: توصیهٔ جدی‌ام کوکیِ httpOnly+Secure+SameSite است، نه ذخیرهٔ توکن در localStorage. چون توکن در localStorage در برابر XSS بی‌دفاع است. اگر کوکی httpOnly باشد، stores/auth اصلاً توکن را نمی‌بیند؛ فقط user و isAuthenticated را از یک endpoint مثل /me می‌گیرد. این انتخاب کل امضای useAuth را تعیین می‌کند — بگو کدام مدل را داری.

// مسئلهٔ امنیتی #۲ — open redirect: پارامتر redirect یک آسیب‌پذیری کلاسیک است: اگر مهاجم ?redirect=//evil.com بدهد، بعد از ورود کاربر به سایت مخرب پرت می‌شود. برای همین در redirectTo() فقط مسیرهای داخلی (startsWith('/') و !startsWith('//')) را می‌پذیرم و بقیه را به / می‌بندم. این را عمداً گذاشتم چون خیلی راحت فراموش می‌شود.

// مسئلهٔ امنیتی #۳ — رمز عبور: رمز هیچ‌وقت در جای ماندگار نمی‌رود؛ فقط در یک سیگنالِ لحظه‌ای است و مستقیم به auth.login() می‌رود. autocomplete="current-password" را گذاشتم تا password managerها درست کار کنند، و novalidate روی فرم است تا اعتبارسنجیِ خودمان (فارسی و یکدست) جای پیام‌های مرورگر را بگیرد.

// تصمیم مهم — ادغام سبد مهمان پس از ورود: اگر کاربر به‌عنوان مهمان چیزهایی در سبد گذاشته و بعد وارد شده، آن اقلام نباید بپرند. این یعنی auth.login() موفق باید یک cart.merge() را تریگر کند (یا سرور خودش هنگام ورود سبدها را یکی کند). این نقطهٔ تلاقی stores/auth و stores/cart است؛ موقع طراحی این دو، این پل را می‌بندم. بگو ادغام سمت سرور انجام می‌شود یا کلاینت باید سبد محلی را بعد از ورود بفرستد.

// گاردِ «قبلاً واردشده»: اگر کاربر لاگین باشد، navigate(redirectTo(), {replace:true}) صدا می‌زند. یک ظرافت: این را در بدنهٔ کامپوننت گذاشتم؛ اگر isAuthenticated ممکن است async مقداردهی شود (مثلاً بعد از چک /me)، بهتر است داخل createEffect باشد تا با تغییرش واکنش نشان دهد و از هدایت زودهنگام جلوگیری شود. بسته به اینکه auth سنکرون است یا نه، این را تنظیم می‌کنم — همان الگوی «تفکیک loading» که در Cart/Checkout داشتیم، اینجا به شکل «آیا وضعیت auth هنوز مشخص شده؟» برمی‌گردد.

// A11y فرم:

// <main aria-labelledby> به h1 وصل است؛ h1 یک‌بار و «ورود به حساب».
// خطای کلی فرم role="alert" دارد تا فوری خوانده شود (خطای اعتبارنامه فوری است — مثل خطای مالی در checkout، از جنس assertive).
// خطای هر فیلد باید با aria-describedby و aria-invalid به همان input گره بخورد — این کار داخل Input/PasswordField انجام می‌شود (به همین خاطر error را به‌صورت prop پاس می‌دهم، نه اینکه اینجا دستی <span> بگذارم). خوب است چک کنیم Input که قبلاً ساختیم این props را دارد.
// اعتبارسنجی فقط بعد از touched نشان داده می‌شود تا کاربر همان اول با خطاهای قرمز بمباران نشود (UX رایج و درست).
// PasswordField چرا جدا از Input؟ چون دکمهٔ «نمایش/مخفی رمز» منطق و A11y مخصوص دارد (aria-pressed، تغییر type بین password/text، و اینکه دکمه نباید فوکوس را از فیلد بدزدد). می‌شد به Input یک type="password" داد، ولی toggle را تمیزتر دیدم در یک قطعهٔ کوچک جدا بگذارم که داخلش از همان Input استفاده کند.

// بدون inline style و کاملاً BEM؛ نکات CSS: login را با display:grid; place-items:center; min-block-size وسط‌چین کن؛ login__card عرض محدود (max-inline-size: ~400px) و در موبایل تمام‌عرض؛ فیلدها با فاصلهٔ عمودی یکدست؛ login__row برای «فراموشی رمز» را با justify-content:flex-end (یا منطقی: justify-content:end) بچین؛ فیلدهای ایمیل/رمز dir="ltr" باشند (چون ورودی لاتین‌اند) ولی label فارسی و راست‌چین؛ از خاصیت‌های منطقی برای RTL.