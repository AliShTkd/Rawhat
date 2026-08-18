
// Input.tsx
import {
  Show,
  splitProps,
  createUniqueId,
  type Component,
  type JSX,
} from "solid-js";

export interface InputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  id?: string;
}

const Input: Component<InputProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "label",
    "hideLabel",
    "hint",
    "error",
    "id",
    "class",
    "required",
  ]);

  const uid = createUniqueId();
  const inputId = () => local.id ?? `input-${uid}`;
  const hintId = () => `${inputId()}-hint`;
  const errorId = () => `${inputId()}-error`;

  const hasError = () => Boolean(local.error);

  const describedBy = () => {
    const ids: string[] = [];
    if (local.hint) ids.push(hintId());
    if (hasError()) ids.push(errorId());
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  return (
    <div
      class="input"
      classList={{
        "input--error": hasError(),
        [String(local.class ?? "")]: Boolean(local.class),
      }}
    >
      <label
        class="input__label"
        classList={{ "input__label--hidden": local.hideLabel === true }}
        for={inputId()}
      >
        {local.label}
        <Show when={local.required}>
          <span class="input__required" aria-hidden="true">
            {" "}*
          </span>
        </Show>
      </label>

      <input
        id={inputId()}
        class="input__field"
        aria-invalid={hasError() ? "true" : undefined}
        aria-describedby={describedBy()}
        aria-errormessage={hasError() ? errorId() : undefined}
        required={local.required}
        {...rest}
      />

      <Show when={local.hint && !hasError()}>
        <p id={hintId()} class="input__hint">
          {local.hint}
        </p>
      </Show>

      <Show when={hasError()}>
        <p id={errorId()} class="input__error" aria-live="polite">
          {local.error}
        </p>
      </Show>
    </div>
  );
};

export default Input;










// const [email, setEmail] = createSignal("");

// <Input
//   label="ایمیل"
//   type="email"
//   name="email"
//   autocomplete="email"
//   required
//   placeholder="example@email.com"
//   hint="برای ارسال فاکتور استفاده می‌شود."
//   value={email()}
//   onInput={(e) => setEmail(e.currentTarget.value)}
// />

// // با خطا
// <Input
//   label="کد پستی"
//   value={postal()}
//   onInput={(e) => setPostal(e.currentTarget.value)}
//   error="کد پستی باید ۱۰ رقم باشد."
// />


// این هم Input، یک primitive فرم پایه و پرکاربرد که برای کل فرم‌های پروژه (ثبت‌نام، آدرس، پروفایل و...) قابل استفاده است. چون اجزای فرم مهم‌ترین نقطه‌ی A11y و امنیت ورودی هستند، آن‌ها را جدی گرفتم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// این یک wrapper کنترل‌شده روی <input> است که label، متن راهنما (hint)، و پیام خطا (error) را به‌درستی و با اتصال ARIA مدیریت می‌کند.
// label اجباری است (برای A11y). اگر جایی نمی‌خواهی label دیده شود، با hideLabel آن را بصری پنهان کن (نه حذف).
// برای یکتا بودن id و اتصال label/hint/error، از createUniqueId خود Solid استفاده کردم تا در صفحه‌ی بزرگ با چند input تداخل id پیش نیاید.
// بقیه‌ی ویژگی‌های بومی <input> (مثل type, value, onInput, placeholder, autocomplete, required, ...) از طریق ...rest عبور می‌کنند.
// امنیتی: مقدار به‌صورت متن مدیریت می‌شود؛ بدون innerHTML. اعتبارسنجی نمایشی اینجا فقط برای UX است و جایگزین اعتبارسنجی Backend نیست.

// نکات مهم:

// Accessibility (نقطه‌ی قوت این Component):
// <label for> به <input id> متصل است و id با createUniqueId یکتا می‌شود.
// متن راهنما و خطا با aria-describedby به input وصل می‌شوند؛ هنگام خطا aria-invalid="true" و aria-errormessage ست می‌شود و پیام خطا در ناحیه‌ی aria-live="polite" اعلام می‌شود.
// وقتی خطا هست، hint پنهان می‌شود تا پیام‌ها شلوغ/متناقض نشوند (می‌توانم طوری تغییر دهم که هر دو با هم بمانند؛ بگو).
// hideLabel برچسب را بصری پنهان می‌کند اما برای screen reader فعال نگه می‌دارد؛ در CSS آن را با الگوی visually-hidden پیاده کن (نه display:none).
// امنیتی: بدون innerHTML؛ مقدار فقط به‌صورت متن استفاده می‌شود. اعتبارسنجی و پاکسازی نهایی داده باید در Backend انجام شود؛ به داده‌ی Frontend اعتماد نکن.
// بدون inline style و کاملاً BEM؛ ظاهر حالت focus، حالت خطا (input--error → قاب قرمز)، فاصله‌ها و responsive بودن را در CSS با همین کلاس‌ها بساز.
// انعطاف Type: چون InputProps بقیه‌ی attributeهای بومی input را می‌پذیرد، برای همه‌ی نوع‌ها (text, email, password, tel, number, ...) کار می‌کند بدون پیچیدگی اضافه.
// یک نکته که خوب است در سطح پروژه بدانی: این Input یک field کامل (label+input+error) است. اگر می‌خواهی نسخه‌های خواهر مثل Textarea یا Select را هم با همین الگوی A11y و کلاس‌بندی بسازم تا فرم‌ها یکدست شوند، بگو تا مطابق همین ساختار ادامه دهم. 