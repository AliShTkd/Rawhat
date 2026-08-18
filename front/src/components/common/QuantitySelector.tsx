// QuantitySelector.tsx
import { type Component } from "solid-js";

export interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  decreaseLabel?: string;
  increaseLabel?: string;
  onChange?: (value: number) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const QuantitySelector: Component<QuantitySelectorProps> = (props) => {
  const min = () => props.min ?? 1;
  const max = () => props.max ?? Number.MAX_SAFE_INTEGER;
  const step = () => props.step ?? 1;

  const current = () => clamp(props.value, min(), max());

  const commit = (next: number) => {
    if (props.disabled) return;
    const clamped = clamp(next, min(), max());
    if (clamped !== props.value) {
      props.onChange?.(clamped);
    }
  };

  const canDecrease = () => !props.disabled && current() > min();
  const canIncrease = () => !props.disabled && current() < max();

  const handleInput = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    commit(parsed);
  };

  return (
    <div class="quantity" role="group" aria-label={props.label ?? "تعداد"}>
      <button
        class="quantity__button quantity__button--decrease"
        type="button"
        onClick={() => commit(current() - step())}
        disabled={!canDecrease()}
        aria-label={props.decreaseLabel ?? "کاهش تعداد"}
      >
        <span class="quantity__icon" aria-hidden="true">
          −
        </span>
      </button>

      <input
        class="quantity__input"
        type="number"
        inputmode="numeric"
        value={current()}
        min={min()}
        max={props.max !== undefined ? props.max : undefined}
        step={step()}
        disabled={props.disabled}
        aria-label={props.label ?? "تعداد"}
        onInput={(e) => handleInput(e.currentTarget.value)}
        onBlur={(e) => {
          // اطمینان از اینکه مقدار نهایی معتبر و در محدوده است
          const parsed = Number.parseInt(e.currentTarget.value, 10);
          commit(Number.isNaN(parsed) ? min() : parsed);
        }}
      />

      <button
        class="quantity__button quantity__button--increase"
        type="button"
        onClick={() => commit(current() + step())}
        disabled={!canIncrease()}
        aria-label={props.increaseLabel ?? "افزایش تعداد"}
      >
        <span class="quantity__icon" aria-hidden="true">
          +
        </span>
      </button>
    </div>
  );
};

export default QuantitySelector;






// const [qty, setQty] = createSignal(1);

// <QuantitySelector
//   value={qty()}
//   min={1}
//   max={10}          // فقط UX؛ موجودی واقعی در Backend اعتبارسنجی شود
//   onChange={setQty}
// />


// این هم QuantitySelector، برای انتخاب تعداد کالا (مثلاً در سبد خرید یا صفحه‌ی محصول). چون تعاملی است و ورودی عددی دارد، A11y و اعتبارسنجی سبک ورودی را جدی گرفتم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// مقدار کنترل‌شده از بیرون است: value + onChange. این برای پروژه‌ی بزرگ و همگام‌سازی با سبد خرید تمیزتر است. اگر حالت uncontrolled هم می‌خواهی، بگو.
// min (پیش‌فرض ۱)، max اختیاری، و step (پیش‌فرض ۱) دارد. مقدار همیشه در این محدوده clamp می‌شود.
// امنیتی/معماری (مهم): max اینجا فقط برای UX است و نباید Source of Truth موجودی باشد. موجودی واقعی و سقف مجاز خرید باید در Backend هنگام افزودن به سبد/پرداخت اعتبارسنجی شود؛ کاربر می‌تواند مقدار Frontend را دستکاری کند


// نکات مهم:

// اعتبارسنجی ورودی: مقدار همیشه با clamp در بازه‌ی [min, max] نگه داشته می‌شود. parseInt برای جلوگیری از مقادیر غیرعددی/اعشاری استفاده شد، و onBlur مقدار خالی/نامعتبر را به min بازمی‌گرداند تا state خراب نشود.
// Accessibility:
// ظرف role="group" با aria-label تا screen reader بداند این کنترل «تعداد» است.
// دکمه‌های +/− <button type="button"> با aria-label متنی؛ آیکون‌ها aria-hidden. دکمه‌ها در مرزها (min/max) به‌درستی disabled می‌شوند.
// <input type="number"> با aria-label و inputmode="numeric" برای کیبورد موبایل.
// بدون inline style و کاملاً BEM؛ چیدمان افقی، مخفی‌کردن فلش‌های پیش‌فرض input[type=number] (در صورت تمایل)، و اندازه‌ی مناسب لمسی (حداقل ~۴۴px برای دکمه‌ها) را در CSS با همین کلاس‌ها بساز.
// امنیتی: بدون innerHTML. تأکید دوباره: max/موجودی سمت Frontend قابل اعتماد نیست؛ در سرور دوباره بررسی کن.
// دو تصمیمی که ممکن است بخواهی بگیری:

// می‌خواهی هنگام رسیدن به max یک پیام («بیشتر از موجودی نیست») نشان دهد؟ اگر بله، بگو تا یک ناحیه‌ی aria-live برایش اضافه کنم.
// اگر ترجیح می‌دهی حالت uncontrolled (state داخلی) هم پشتیبانی شود (مثل SearchBar)، بگو تا همان الگو را اعمال کنم. 🙂