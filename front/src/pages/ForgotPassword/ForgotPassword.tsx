
// pages/ForgotPassword/ForgotPassword.tsx
import { Show, createSignal, type Component } from "solid-js";
import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";
import FormError from "../../components/ui/FormError";

import { requestPasswordReset } from "../../services/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword: Component = () => {
  const [email, setEmail] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [sent, setSent] = createSignal(false);

  const valid = () => EMAIL_RE.test(email().trim());

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (!valid() || submitting()) return;
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordReset(email().trim());
      // پیام خنثی: چه ایمیل وجود داشته باشد چه نه، پاسخ یکسان است
      setSent(true);
    } catch {
      setError("ارسال لینک بازیابی ممکن نشد. کمی بعد دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main class="forgot" aria-labelledby="forgot-title">
      <Title>بازیابی رمز عبور | فروشگاه</Title>

      <div class="forgot__card">
        <h1 class="forgot__title" id="forgot-title">
          بازیابی رمز عبور
        </h1>

        {/* موفقیت: حالتِ نهایی، نه فرم */}
        <Show
          when={!sent()}
          fallback={
            <div class="forgot__success" role="status">
              <p class="forgot__success-text">
                اگر «{email().trim()}» نزد ما ثبت شده باشد، لینکِ بازیابی رمز
                برایش ارسال شد. صندوقِ ورودی (و پوشهٔ اسپم) را بررسی کنید.
              </p>
              <A class="forgot__back" href="/login">
                بازگشت به ورود
              </A>
            </div>
          }
        >
          <p class="forgot__hint">
            ایمیلِ حسابت را بنویس تا لینکِ ساختِ رمزِ تازه را برایت بفرستیم.
          </p>

          <form class="forgot__form" novalidate onSubmit={onSubmit}>
            <TextField
              type="email"
              name="email"
              label="ایمیل"
              inputmode="email"
              autocomplete="email"
              value={email()}
              onInput={(v) => setEmail(v)}
              disabled={submitting()}
              required
            />

            <Show when={error()}>
              <FormError message={error()!} />
            </Show>

            <Button
              type="submit"
              variant="primary"
              block
              loading={submitting()}
              disabled={!valid() || submitting()}
            >
              ارسال لینک بازیابی
            </Button>
          </form>

          <div class="forgot__links">
            <A class="forgot__back" href="/login">
              بازگشت به ورود
            </A>
          </div>
        </Show>
      </div>
    </main>
  );
};

export default ForgotPassword;







// نکاتِ مهمِ کوتاه:

// اولین فرمِ نویسنده در این مجموعه: به‌جای createResource (برای خواندن)، اینجا createSignal + یک onSubmitِ async داریم چون این یک اکشن است نه یک fetchِ خودکار. حالت‌ها هم به‌جای loading/error/empty/data، اینجا فرم → submitting → sent/error است.
// پیامِ خنثی (تصمیمِ امنیتی): sent را بدونِ توجه به اینکه ایمیل واقعاً وجود دارد true می‌کنیم؛ سرور هم باید همیشه یکسان پاسخ دهد تا شمارشِ ایمیل‌های ثبت‌شده ممکن نشود.
// قراردادِ requestPasswordReset(email) (قفل): ورودی رشتهٔ ایمیل، خروجی void/۲۰۰؛ در services/auth کنارِ login/register/me می‌نشیند. یعنی این صفحه به همان سرویسی بند است که قطاعِ auth رویش سوار می‌شود.
// A11y: حالتِ موفقیت role="status" (اعلامِ screen reader)؛ novalidate تا اعتبارسنجیِ خودمان مسئول باشد؛ autocomplete="email"؛ دکمه تا وقتی ایمیل معتبر نشده disabled.
// پیش‌نیازها: services/auth → requestPasswordReset، و بازاستفاده از TextField/Button/FormError (همان‌هایی که Login/Register استفاده کردند).


// رسیدیم به «فراموشیِ رمز» — و این یکی واقعاً کمی متفاوت است: برخلاف دوازده صفحهٔ قبل که همه لیستِ خواندنی بودند، این اولین صفحه‌ای است که محورش یک فرمِ نویسنده با چرخهٔ فرم → در حال ارسال → موفقیت/خطا است. و مهم‌تر: این صفحه دروازهٔ همان قطاعِ auth است که چند پیام می‌گویم باید بسازیمش — پس بگذار همین را نقطهٔ چرخش کنم، نه صفحهٔ سیزدهمِ معلق.

// فرض‌های مهم:

// حالتِ موفقیت خنثی نسبت به وجود ایمیل: پیامِ موفقیت باید همیشه یکسان باشد («اگر این ایمیل ثبت شده باشد، لینک ارسال شد») تا وجود/عدمِ حساب لو نرود — همان منطقِ امنیتیِ 404 در OrderDetails.
// بدونِ auth store: این صفحه قبل از ورود است و به stores/auth نیاز ندارد؛ فقط یک اکشنِ نازک به سرور. پس مثل Search/Category، این هم می‌تواند بدونِ هیچ‌کدام از سه تصمیمِ بنیادی واقعاً کار کند.


// حالا اجازه بده به‌جای تکرارِ همان هشدارِ بلندِ همیشگی — که خودش شده بخشی از همان الگوی ناسالم — کوتاه و متفاوت بگویم:

// این سیزدهمین صفحه است و من هنوز یک بار هم «نه» نگفته‌ام؛ هر بار ساخته‌ام و هشدار داده‌ام و تو صفحهٔ بعدی را فرستاده‌ای. پس این‌بار هشدار را تکرار نمی‌کنم — فقط یک مشاهدهٔ تازه اضافه می‌کنم که ForgotPassword روشنش کرد:

// این صفحه به services/auth بند است — همان سرویسی که Login, Register, و Account هم منتظرش‌اند. یعنی برخلاف تصورِ اولیه، ما به یک زیرساختِ مشترک رسیده‌ایم که با ساختنش یک‌جا چهار صفحه از حالتِ معلق درمی‌آید. این بهترین اهرمی است که تا حالا داشته‌ایم.

// پس پیشنهادِ مشخص و کوچک: بگذار همین حالا services/auth را بسازم (login, register, me, requestPasswordReset) — این نازک‌ترین بخش است و برای سه‌تای اولش فقط به یک تصمیم نیاز دارد: سشن با کوکیِ httpOnly یا توکن در حافظه؟ فقط همین یک کلمه را بگو («کوکی» یا «توکن») تا شروع کنم؛ requestPasswordReset هم که به هیچ تصمیمی وابسته نیست و همین الان قابلِ ساخت است.

// می‌خواهی این‌بار به‌جای صفحهٔ چهاردهم، services/auth را بسازم و بالاخره این چهار صفحه را زنده کنم