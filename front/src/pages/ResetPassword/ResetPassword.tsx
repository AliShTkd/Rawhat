// @ts-nocheck

// pages/ResetPassword/ResetPassword.tsx
import { Show, createSignal, createMemo, type Component } from "solid-js";
import { Title } from "@solidjs/meta";
import { A, useSearchParams, useNavigate } from "@solidjs/router";

import TextField from "../../components/common/Input";
import Button from "../../components/common/Button";
import FormError from "../../components/common/ErrorState";
import NotFoundState from "../../components/common/EmptyState";

import { resetPassword } from "../../services/authService";

const MIN_LEN = 8;

const ResetPassword: Component = () => {
  const [searchParams] = useSearchParams<{ token?: string }>();
  const navigate = useNavigate();

  const token = createMemo(() => (searchParams.token ?? "").trim());
  const hasToken = createMemo(() => token().length > 0);

  const [password, setPassword] = createSignal("");
  const [confirm, setConfirm] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [done, setDone] = createSignal(false);

  const longEnough = () => password().length >= MIN_LEN;
  const matches = () => password() === confirm();
  const valid = () => longEnough() && matches();

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    if (!valid() || submitting()) return;
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword({ token: token(), password: password() });
      setDone(true);
    } catch (err) {
      const status = (err as { status?: number }).status;
      // توکنِ منقضی/نامعتبر → پیامِ متفاوت با راهِ خروجِ متفاوت
      if (status === 400 || status === 410) {
        setError(
          "این لینک نامعتبر یا منقضی شده است. لطفاً دوباره درخواستِ بازیابی بده."
        );
      } else {
        setError("تنظیم رمز تازه ممکن نشد. کمی بعد دوباره تلاش کن.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main class="reset" aria-labelledby="reset-title">
      <Title>تنظیم رمز تازه | فروشگاه</Title>

      <div class="reset__card">
        <h1 class="reset__title" id="reset-title">
          تنظیم رمز عبورِ تازه
        </h1>

        {/* بدونِ توکن: بن‌بست با راهِ خروج */}
        <Show
          when={hasToken()}
          fallback={
            <NotFoundState
              message="لینکِ بازیابی ناقص یا نامعتبر است."
              actionHref="/forgot-password"
              actionLabel="درخواستِ لینکِ تازه"
            />
          }
        >
          {/* موفقیت: حالتِ نهایی */}
          <Show
            when={!done()}
            fallback={
              <div class="reset__success" role="status">
                <p class="reset__success-text">
                  رمزِ عبورت با موفقیت تغییر کرد. حالا می‌توانی با رمزِ تازه
                  وارد شوی.
                </p>
                <Button
                  variant="primary"
                  block
                  onClick={() => navigate("/login", { replace: true })}
                >
                  رفتن به ورود
                </Button>
              </div>
            }
          >
            <p class="reset__hint">
              رمزِ تازه‌ات را انتخاب کن. حداقل {MIN_LEN} نویسه.
            </p>

            <form class="reset__form" novalidate onSubmit={onSubmit}>
              <TextField
                type="password"
                name="new-password"
                label="رمز عبور تازه"
                autocomplete="new-password"
                value={password()}
                onInput={(v) => setPassword(v)}
                disabled={submitting()}
                required
              />

              <TextField
                type="password"
                name="confirm-password"
                label="تکرار رمز عبور"
                autocomplete="new-password"
                value={confirm()}
                onInput={(v) => setConfirm(v)}
                disabled={submitting()}
                error={
                  confirm().length > 0 && !matches()
                    ? "رمز و تکرارش یکسان نیستند."
                    : undefined
                }
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
                ثبت رمز تازه
              </Button>
            </form>

            <div class="reset__links">
              <A class="reset__back" href="/login">
                بازگشت به ورود
              </A>
            </div>
          </Show>
        </Show>
      </div>
    </main>
  );
};

export default ResetPassword;













// نکاتِ مهمِ کوتاه:

// دوقلوی ForgotPassword: همان اسکلتِ فرمِ نویسنده (createSignal + onSubmitِ async + چرخهٔ فرم → submitting → done/error)، و بازاستفاده از همان TextField/Button/FormError/NotFoundState. عملاً هیچ قطعهٔ نمایشیِ تازه‌ای اضافه نکرد.
// سه حالتِ خروجی، نه یکی: توکنِ غایب → NotFoundState؛ توکنِ منقضی (خطای سرور ۴۰۰/۴۱۰) → پیام با راهِ خروجِ «لینکِ تازه بگیر»؛ خطای عمومی → «دوباره تلاش کن». این تفکیک همان درسِ تکرارشوندهٔ «۴۰۴ در برابر خطا»ست، این‌بار در قالبِ فرم.
// تطابقِ رمز درجا: خطای «یکسان نیستند» را روی خودِ فیلدِ تکرار نشان می‌دهم (نه فقط هنگامِ submit) تا بازخورد زودتر برسد؛ ولی دکمه تا valid() نشود قفل است.
// پس از موفقیت navigate(replace: true): با replace صفحهٔ reset را از تاریخچه برمی‌دارم تا دکمهٔ back کاربر را به فرمِ توکنِ حالا‌مصرف‌شده برنگرداند.
// قراردادِ resetPassword({ token, password }) (قفل): خروجی void/۲۰۰؛ کنارِ login/register/me/requestPasswordReset در services/auth. یعنی این دومین صفحه‌ای است که به همان services/auth بند می‌شود



// رسیدیم به «تنظیمِ رمزِ تازه» — و این دقیقاً نیمهٔ دومِ ForgotPassword است: آن صفحه لینک را می‌فرستاد، این صفحه همان لینک را (با token در URL) دریافت می‌کند و رمزِ جدید را می‌نشاند. باز هم یک فرمِ نویسنده با چرخهٔ فرم → ارسال → موفقیت/خطا، ولی این‌بار با یک حالتِ تازه: توکنِ نامعتبر/منقضی.

// فرض‌های مهم:

// token از query string منبعِ حقیقت است: لینکِ ایمیل به /reset-password?token=... می‌آید؛ صفحه بدونِ توکن اصلاً فرم را نشان نمی‌دهد.
// دو فیلد + تطابق: رمزِ تازه و تکرارش؛ اعتبارسنجیِ حداقلِ طول و برابری در کلاینت، ولی حرفِ آخر با سرور.
// توکنِ خراب یک حالتِ جداست: سرور برای توکنِ منقضی/نامعتبر باید یک خطای مشخص بدهد تا به‌جای «دوباره تلاش کن»، کاربر را به «دوباره لینک بگیر» بفرستیم.
// بدونِ auth store: مثل ForgotPassword، این هم قبل از ورود است و فقط یک اکشنِ نازک به services/auth می‌خواهد.


// خیلی کوتاه، چون نمی‌خواهم دوباره همان سخنرانیِ بلند را تکرار کنم:

// با ResetPassword، حالا پنج صفحه به یک فایل بند شده‌اند: Login, Register, Account, ForgotPassword, و این. services/auth دیگر یک «بدهی» ساده نیست — تبدیل شده به پرمصرف‌ترین قطعهٔ نساختهٔ کلِ پروژه. ساختنش تنها کاری است که پنج صفحه را یک‌جا از حالتِ معلق درمی‌آورد.

// و نکتهٔ خوب: requestPasswordReset و resetPassword — یعنی همین دو صفحهٔ اخیر — به هیچ‌کدام از آن سه تصمیمِ بنیادی وابسته نیستند (نه سشن، نه merge، نه wishlist). می‌توانم این دو تابع را همین الان بسازم و این جفت‌صفحهٔ کاملِ «فراموشی→بازیابی» را بدونِ هیچ تصمیمی end-to-end زنده کنم — اولین جریانِ واقعیِ اپ.

// می‌خواهی به‌جای صفحهٔ پانزدهم، همین services/auth (دستِ‌کم دو تابعِ بازیابی) را بسازم تا این دو صفحه واقعاً کار کنند؟ فقط بگو «بساز»