
// NewsletterSection.tsx
import { Show, createSignal, type Component } from "solid-js";

export type NewsletterStatus = "idle" | "loading" | "success" | "error";

export interface NewsletterSectionProps {
  title?: string;
  description?: string;
  placeholder?: string;
  submitLabel?: string;
  status?: NewsletterStatus;
  successMessage?: string;
  errorMessage?: string;
  onSubmit?: (email: string) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NewsletterSection: Component<NewsletterSectionProps> = (props) => {
  const [email, setEmail] = createSignal("");
  const [localError, setLocalError] = createSignal("");

  const isLoading = () => props.status === "loading";

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    const value = email().trim();

    if (value === "") {
      setLocalError("لطفاً ایمیل خود را وارد کنید.");
      return;
    }

    if (!EMAIL_PATTERN.test(value)) {
      setLocalError("فرمت ایمیل معتبر نیست.");
      return;
    }

    setLocalError("");
    props.onSubmit?.(value);
  };

  return (
    <section class="newsletter" aria-labelledby="newsletter-title">
      <div class="newsletter__container">
        <div class="newsletter__content">
          <h2 id="newsletter-title" class="newsletter__title">
            {props.title ?? "عضویت در خبرنامه"}
          </h2>

          <Show when={props.description}>
            <p class="newsletter__description">{props.description}</p>
          </Show>
        </div>

        <form class="newsletter__form" onSubmit={handleSubmit} novalidate>
          <div class="newsletter__field">
            <label class="newsletter__label" for="newsletter-email">
              ایمیل
            </label>

            <input
              id="newsletter-email"
              class="newsletter__input"
              type="email"
              name="email"
              inputmode="email"
              autocomplete="email"
              placeholder={props.placeholder ?? "example@email.com"}
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              disabled={isLoading()}
              required
              aria-invalid={localError() !== "" ? "true" : "false"}
              aria-describedby="newsletter-message"
            />
          </div>

          <button
            class="newsletter__submit"
            type="submit"
            disabled={isLoading()}
          >
            {isLoading()
              ? "در حال ارسال..."
              : props.submitLabel ?? "عضویت"}
          </button>

          <p
            id="newsletter-message"
            class="newsletter__message"
            aria-live="polite"
          >
            <Show when={localError()}>
              <span class="newsletter__message--error">{localError()}</span>
            </Show>

            <Show when={!localError() && props.status === "success"}>
              <span class="newsletter__message--success">
                {props.successMessage ?? "عضویت شما با موفقیت ثبت شد."}
              </span>
            </Show>

            <Show when={!localError() && props.status === "error"}>
              <span class="newsletter__message--error">
                {props.errorMessage ?? "ثبت عضویت با خطا مواجه شد. دوباره تلاش کنید."}
              </span>
            </Show>
          </p>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;










// const [status, setStatus] = createSignal<NewsletterStatus>("idle");

// const handleNewsletter = async (email: string) => {
//   setStatus("loading");
//   try {
//     await subscribeToNewsletter(email); // این تابع را در لایه‌ی سرویس/Backend خودت داری
//     setStatus("success");
//   } catch {
//     setStatus("error");
//   }
// };

// <NewsletterSection
//   title="از تخفیف‌ها زودتر باخبر شو"
//   description="جدیدترین محصولات و پیشنهادهای ویژه را در ایمیل دریافت کن."
//   status={status()}
//   onSubmit={handleNewsletter}
// />

// این هم NewsletterSection برای عضویت در خبرنامه. چون اینجا ورودی کاربر و ارسال فرم داریم، چند نکته‌ی امنیتی/معماری را رعایت کردم و در پایان توضیح می‌دهم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// این Component مسئول ارسال واقعی به Backend نیست. طبق قوانین، احراز/ذخیره‌سازی/اعتبارسنجی نهایی ایمیل باید در Backend انجام شود. بنابراین منطق ارسال را از طریق یک callback به نام onSubmit به بیرون سپردم؛ خودِ Component فقط ورودی را می‌گیرد و به شما می‌دهد.
// یک اعتبارسنجی سبک سمت کلاینت فقط برای UX گذاشتم (خالی نبودن + الگوی ساده ایمیل). این صرفاً برای تجربه‌ی کاربری است و جایگزین اعتبارسنجی Backend نیست.
// متن‌ها (عنوان، توضیح، placeholder، دکمه) از Props می‌آیند تا قابل استفاده‌ی مجدد باشد.
// وضعیت ارسال (status) از بیرون کنترل می‌شود (idle/loading/success/error) تا این Component بدون منطق شبکه، پیام مناسب نشان دهد.



// نکات مهم:

// معماری/امنیت: خودِ Component ارسالی به سرور انجام نمی‌دهد؛ فقط ایمیل معتبرشده‌ی سمت UX را از طریق onSubmit به شما می‌دهد. اعتبارسنجی واقعی، جلوگیری از اسپم، و ذخیره‌سازی باید در Backend باشد. پیشنهاد می‌کنم در Backend محافظت در برابر ارسال انبوه (rate limiting) و در صورت نیاز CAPTCHA/تأیید ایمیل (double opt-in) داشته باشی.
// بدون innerHTML و بدون اعتماد به ورودی: مقدار ایمیل فقط به‌صورت متن استفاده و به onSubmit پاس داده می‌شود؛ هیچ رندر ناامنی وجود ندارد.
// Accessibility: از <form>، <label for> متصل به <input id>، type="email"، autocomplete، aria-invalid، و ناحیه‌ی پیام با aria-live="polite" استفاده شد تا وضعیت به screen reader اعلام شود. دکمه در حالت loading غیرفعال می‌شود.
// بدون inline style و کاملاً BEM؛ چیدمان (فرم افقی در دسکتاپ، عمودی در موبایل) را با همین کلاس‌ها در CSS بساز.
// دو نکته که ممکن است بخواهی مشخص کنی:

// اگر می‌خواهی چک‌باکس «موافقت با قوانین/حریم خصوصی» (consent) هم داشته باشد (که برای خبرنامه از نظر حقوقی توصیه می‌شود)، بگو تا اضافه کنم.
// اگر ترجیح می‌دهی به‌جای status بیرونی، مدیریت وضعیت داخل خود Component باشد، بگو؛ ولی نسخه‌ی فعلی برای پروژه‌ی بزرگ و تست‌پذیری تمیزتر است. 🙂