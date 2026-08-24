// @ts-nocheck

// pages/Register/Register.tsx
import {
  Show,
  createSignal,
  createMemo,
  type Component,
} from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate, useSearchParams, A } from "@solidjs/router";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Checkbox from "../../components/common/Checkbox";
import PasswordField from "../../components/common/PasswordField";
import PasswordStrength from "../../components/common/PasswordStrength";

import { useAuth } from "../../stores/userStore";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const Register: Component = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams<{ redirect?: string }>();

  // مقصد امن پس از ثبت‌نام؛ فقط مسیرهای داخلی (ضدِ open redirect)
  const redirectTo = createMemo(() => {
    const r = searchParams.redirect;
    if (r && r.startsWith("/") && !r.startsWith("//")) return r;
    return "/";
  });

  // اگر از قبل وارد شده، فرم ثبت‌نام بی‌معنی است
  if (auth.isAuthenticated) {
    navigate(redirectTo(), { replace: true });
  }

  const [fullName, setFullName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [confirm, setConfirm] = createSignal("");
  const [accepted, setAccepted] = createSignal(false);

  const [touched, setTouched] = createSignal(false);
  const [submitting, setSubmitting] = createSignal(false);
  const [formError, setFormError] = createSignal<string | null>(null);

  const nameError = createMemo(() => {
    if (!touched()) return null;
    if (!fullName().trim()) return "نام و نام خانوادگی را وارد کنید.";
    return null;
  });

  const emailError = createMemo(() => {
    if (!touched()) return null;
    if (!email()) return "ایمیل را وارد کنید.";
    if (!EMAIL_RE.test(email())) return "قالب ایمیل معتبر نیست.";
    return null;
  });

  const passwordError = createMemo(() => {
    if (!touched()) return null;
    if (!password()) return "رمز عبور را وارد کنید.";
    if (password().length < MIN_PASSWORD)
      return `رمز عبور باید حداقل ${MIN_PASSWORD.toLocaleString("fa-IR")} کاراکتر باشد.`;
    return null;
  });

  const confirmError = createMemo(() => {
    if (!touched()) return null;
    if (!confirm()) return "تکرار رمز عبور را وارد کنید.";
    if (confirm() !== password()) return "رمز عبور و تکرار آن یکسان نیستند.";
    return null;
  });

  const termsError = createMemo(() => {
    if (!touched()) return null;
    if (!accepted()) return "برای ادامه باید قوانین را بپذیرید.";
    return null;
  });

  const isValid = createMemo(
    () =>
      !nameError() &&
      !emailError() &&
      !passwordError() &&
      !confirmError() &&
      !termsError() &&
      !!fullName() &&
      !!email() &&
      !!password() &&
      !!confirm() &&
      accepted()
  );

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setTouched(true);
    setFormError(null);
    if (!isValid()) return;

    setSubmitting(true);
    try {
      await auth.register({
        fullName: fullName().trim(),
        email: email(),
        password: password(),
      });
      // فرض: بک‌اند بعد از ثبت‌نام مستقیم لاگین می‌کند → به مقصد امن برو
      // اگر تأیید ایمیل لازم است، این خط به navigate("/verify-email") تبدیل می‌شود
      navigate(redirectTo(), { replace: true });
    } catch (err) {
      // خطای واقعی از سرور (مثلاً ایمیل تکراری)
      setFormError("ثبت‌نام ممکن نشد. ممکن است این ایمیل قبلاً ثبت شده باشد.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main class="register" aria-labelledby="register-title">
      <Title>ساخت حساب | فروشگاه</Title>

      <div class="register__card">
        <h1 class="register__title" id="register-title">
          ساخت حساب کاربری
        </h1>
        <p class="register__subtitle">
          برای خرید سریع‌تر و پیگیری سفارش‌ها، حساب بسازید.
        </p>

        {/* خطای کلی فرم (از سرور) — فوری اعلام شود */}
        <Show when={formError()}>
          <div class="register__alert" role="alert">
            {formError()}
          </div>
        </Show>

        <form class="register__form" onSubmit={handleSubmit} novalidate>
          <div class="register__field">
            <Input
              type="text"
              name="name"
              label="نام و نام خانوادگی"
              autocomplete="name"
              value={fullName()}
              onInput={(v) => setFullName(v)}
              onBlur={() => setTouched(true)}
              error={nameError()}
              required
            />
          </div>

          <div class="register__field">
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

          <div class="register__field">
            <PasswordField
              name="password"
              label="رمز عبور"
              autocomplete="new-password"
              value={password()}
              onInput={(v) => setPassword(v)}
              onBlur={() => setTouched(true)}
              error={passwordError()}
              required
            />
            {/* سنجه‌ی قدرت رمز فقط وقتی چیزی تایپ شده */}
            <Show when={password()}>
              <PasswordStrength password={password()} />
            </Show>
          </div>

          <div class="register__field">
            <PasswordField
              name="confirmPassword"
              label="تکرار رمز عبور"
              autocomplete="new-password"
              value={confirm()}
              onInput={(v) => setConfirm(v)}
              onBlur={() => setTouched(true)}
              error={confirmError()}
              required
            />
          </div>

          <div class="register__field register__field--terms">
            <Checkbox
              name="terms"
              checked={accepted()}
              onChange={(v) => setAccepted(v)}
              error={termsError()}
            >
              <span>
                <A class="register__link" href="/terms" target="_blank">
                  قوانین و مقررات
                </A>{" "}
                را خوانده‌ام و می‌پذیرم.
              </span>
            </Checkbox>
          </div>

          <Button
            type="submit"
            variant="primary"
            block
            loading={submitting()}
            disabled={submitting()}
          >
            ساخت حساب
          </Button>
        </form>

        <p class="register__footer">
          حساب کاربری دارید؟{" "}
          <A
            class="register__link"
            href={`/login${
              searchParams.redirect
                ? `?redirect=${encodeURIComponent(searchParams.redirect)}`
                : ""
            }`}
          >
            وارد شوید
          </A>
        </p>
      </div>
    </main>
  );
};

export default Register;












// توضیح کوتاه استفاده: این صفحه یک ارکستریتور فرمِ ثبت‌نام است؛ خودش هویت نگه نمی‌دارد، فقط فیلدها را با createSignal جمع می‌کند، سمت کلاینت اعتبارسنجی می‌کند و در نهایت auth.register(...) از stores/auth را صدا می‌زند. آن را زیر مسیر /register رجیستر کن (با پشتیبانی از ?redirect=). پیش‌نیازها: stores/auth (اکشن register)، دو قطعهٔ نساختهٔ PasswordStrength و Checkbox، و قطعات موجودِ Input/Button/PasswordField. چون خواهرِ Login است، هر تصمیمی آنجا گرفتی (کوکی httpOnly در برابر توکن، auto-login در برابر تأیید ایمیل) اینجا هم همان می‌شود.




// رسیدیم به ثبت‌نام — خواهرِ دوقلوی Login. همان زیرساخت (stores/auth) را مصرف می‌کند، همان الگوی فرم/اعتبارسنجی/redirect را دارد، ولی سه تفاوت جدی: فیلدهای بیشتر، اعتبارسنجیِ سنگین‌تر (تأیید رمز، قدرت رمز، پذیرش قوانین)، و یک تصمیم مهم درباره‌ی رفتار پس از ثبت‌نام (آیا مستقیم لاگین می‌شود یا باید ایمیل تأیید کند).

// فرض‌هایی که گذاشتم (تصمیم‌های مهم — بخوان):

// همان stores/auth؛ این صفحه فقط auth.register() را صدا می‌زند. اگر بک‌اند بعد از ثبت‌نام کاربر را مستقیم لاگین می‌کند، این صفحه مثل Login به redirect می‌رود؛ اگر تأیید ایمیل لازم است، به یک صفحهٔ «ایمیلت را چک کن» می‌رویم. من حالت auto-login را فرض کردم (رایج‌تر برای فروشگاه)، ولی نقطه‌اش را علامت زده‌ام.
// تأیید رمز (confirmPassword) فقط سمت کلاینت است و هرگز به سرور نمی‌رود.
// پذیرش قوانین (checkbox) الزامی است و بخشی از اعتبارسنجی.
// همان محافظِ open-redirect و همان گاردِ «اگر از قبل لاگین است».



// نکات مهم:

// بزرگ‌ترین تصمیم — رفتار پس از ثبت‌نام: دو مدل رایج داریم و امضای این صفحه به آن بند است:

// auto-login (فرضِ من): سرور بعد از ثبت‌نام سشن را برقرار می‌کند و ما مثل Login به redirectTo() می‌رویم.
// تأیید ایمیل: کاربر هنوز لاگین نیست؛ باید به /verify-email یا صفحهٔ «ایمیلت را چک کن» برویم و redirect را برای بعدِ تأیید نگه داریم.
// بگو کدام است تا آن یک خط navigate را درست کنم.

// اعتبارسنجیِ متقابل (confirm در برابر password): confirmError به هر دو سیگنال وابسته است؛ چون createMemo است، با تغییرِ هرکدام دوباره حساب می‌شود. یعنی اگر کاربر اول تکرار را درست بزند و بعد رمز اصلی را عوض کند، خطا به‌درستی دوباره ظاهر می‌شود — این را عمداً reactive گذاشتم.

// PasswordStrength (قطعهٔ جدید): یک سنجهٔ بصری قدرت رمز که فقط بعد از تایپ نمایش داده می‌شود. این کارِ UX است نه امنیت؛ قدرت واقعی رمز و قوانینش باید سمت سرور هم اعمال شود (این صفحه فقط حداقل ۸ کاراکتر را چک می‌کند). پیشنهادم: منطق سنجش را از UI جدا نگه داریم تا اگر خواستی کتابخانه‌ای مثل zxcvbn را جای فرمول ساده بگذاری، فقط داخل همان قطعه عوض شود.

// autocomplete="new-password": روی هر دو فیلد رمز و تکرار گذاشتم (نه current-password) تا password managerها رمز جدید پیشنهاد دهند و اشتباهاً رمز موجود را پر نکنند. این جزئیات کوچک ولی مهم است.

// Checkbox با پیام خطا: پذیرش قوانین بخشی از اعتبارسنجی است، پس Checkbox هم مثل Input باید error را بپذیرد و با aria-invalid/aria-describedby گره بزند. اگر Checkbox هنوز این prop را ندارد، موقع ساختش اضافه می‌کنیم.

// A11y و امنیت (همان الگوی Login): role="alert" برای خطای کلی، اعتبارسنجی فقط بعد از touched، محافظِ open-redirect در redirectTo()، عبورِ error به‌صورت prop به فیلدها (نه <span> دستی)، و انتقالِ redirect به لینک «وارد شوید» تا زنجیرهٔ بازگشت نشکند.

// CSS (بدون inline، کاملاً BEM): ساختار register__card عین login__card است ولی چون فیلدها بیشترند، max-inline-size را کمی بازتر بگیر (~۴۲۰px)؛ register__field--terms را با چیدمانِ افقیِ چک‌باکس و متن تنظیم کن (چک‌باکس ابتدای خط، متن راست‌چین)؛ از خاصیت‌های منطقی برای RTL؛ فیلدهای ایمیل/رمز dir="ltr" با label فارسی.



// قطعات جدیدی که این صفحه اضافه کرد:

// قطعه	وضعیت
// Register (page)	✅ (همین حالا)
// PasswordStrength	⛔ (جدید)
// Checkbox	⛔ (اگر قبلاً نساخته‌ایم)
// stores/auth (register)	⛔ (همان زیرساختِ عرضی)
// دارم دوباره همان هشدار را می‌دهم چون حالا شش صفحهٔ ارکستریتور داریم و هنوز هیچ‌کدام end-to-end کار نمی‌کند. Register عملاً هیچ زیرساخت واقعاً جدیدی نیاورد (همان stores/auth) — که خوب است، ولی پشتهٔ قطعات پایه هنوز دست‌نخورده مانده.

// پیشنهادم بدون تغییر است: بعد از این، از عرض به عمق برویم. اولویت:

// stores/auth — حالا سه صفحه (Login, Register, گاردِ Checkout) به آن قفل‌اند. (نیازمند تصمیمِ کوکی/توکن و auto-login/تأیید ایمیل.)
// PasswordField + PasswordStrength + Checkbox — کوچک‌اند و کل بخش auth را کامل می‌کنند.
// یک صفحه را end-to-end ببندیم.
// کدام را بروم؟ پیشنهاد جدی‌ام همان stores/auth است تا سه صفحه هم‌زمان جان بگیرند — ولی اگر ترجیح می‌دهی اول قطعات کوچکِ بی‌نیاز به تصمیم (PasswordField/Checkbox) را بزنم، بگو. 🙂