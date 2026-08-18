
// Rating.tsx
import { Show, For, createMemo, type Component } from "solid-js";

export interface RatingProps {
  value: number;
  max?: number;
  count?: number;
  interactive?: boolean;
  label?: string;
  onChange?: (value: number) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const Rating: Component<RatingProps> = (props) => {
  const max = () => props.max ?? 5;
  const safeValue = () => clamp(props.value, 0, max());
  const stars = createMemo(() =>
    Array.from({ length: max() }, (_, i) => i + 1)
  );

  const fillType = (starIndex: number): "full" | "half" | "empty" => {
    const value = safeValue();
    if (value >= starIndex) return "full";
    if (value >= starIndex - 0.5) return "half";
    return "empty";
  };

  const ariaLabel = () =>
    props.label ??
    `امتیاز ${safeValue()} از ${max()}${
      props.count !== undefined ? ` بر اساس ${props.count} نظر` : ""
    }`;

  const handleSelect = (starIndex: number) => {
    if (!props.interactive) return;
    props.onChange?.(starIndex);
  };

  return (
    <div class="rating">
      {/* حالت تعاملی: گروه دکمه‌های قابل انتخاب */}
      <Show
        when={props.interactive}
        fallback={
          <span
            class="rating__stars"
            role="img"
            aria-label={ariaLabel()}
          >
            <For each={stars()}>
              {(star) => (
                <span
                  class="rating__star"
                  classList={{
                    "rating__star--full": fillType(star) === "full",
                    "rating__star--half": fillType(star) === "half",
                    "rating__star--empty": fillType(star) === "empty",
                  }}
                  aria-hidden="true"
                >
                  ★
                </span>
              )}
            </For>
          </span>
        }
      >
        <span
          class="rating__stars rating__stars--interactive"
          role="radiogroup"
          aria-label={props.label ?? "انتخاب امتیاز"}
        >
          <For each={stars()}>
            {(star) => (
              <button
                class="rating__star-button"
                classList={{
                  "rating__star-button--active": star <= safeValue(),
                }}
                type="button"
                role="radio"
                aria-checked={star === safeValue() ? "true" : "false"}
                aria-label={`${star} از ${max()}`}
                onClick={() => handleSelect(star)}
              >
                <span class="rating__star" aria-hidden="true">
                  ★
                </span>
              </button>
            )}
          </For>
        </span>
      </Show>

      <Show when={props.count !== undefined && !props.interactive}>
        <span class="rating__count">({props.count})</span>
      </Show>
    </div>
  );
};

export default Rating;






// // حالت نمایشی (مثلاً داخل ProductCard یا صفحه‌ی محصول)
// <Rating value={4.5} count={128} />

// // حالت تعاملی (مثلاً فرم ثبت نظر)
// const [score, setScore] = createSignal(0);

// <Rating value={score()} interactive onChange={setScore} />


// این هم Rating، یک Component مستقل برای نمایش امتیاز ستاره‌ای محصول. چون امتیاز هم می‌تواند فقط نمایشی باشد و هم قابل انتخاب توسط کاربر (برای ثبت نظر)، هر دو حالت را پوشش دادم اما ساده نگه‌اش داشتم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// امتیاز یک عدد بین 0 تا max (پیش‌فرض ۵) است. برای حالت نمایشی، نیم‌ستاره هم پشتیبانی می‌شود (مثلاً ۴.۵).
// دو حالت دارد:
// نمایشی (پیش‌فرض): فقط نشان می‌دهد؛ تعاملی نیست و با aria-label گویا است.
// تعاملی (interactive): با کیبورد/کلیک قابل انتخاب است و از طریق onChange مقدار را به بیرون می‌دهد. در این حالت نیم‌ستاره ندارد (انتخاب کاربر عدد صحیح است).
// تعداد نظرات (count) اختیاری برای نمایش کنار امتیاز.
// امنیتی/معماری: میانگین امتیاز و تعداد نظرات صرفاً نمایشی‌اند و Source of Truth نیستند؛ محاسبه و اعتبارسنجی واقعی باید در Backend باشد.

// نکات مهم:

// بدون inline style و کاملاً BEM؛ رنگ ستاره‌های پر/خالی و نمایش نیم‌ستاره را در CSS با کلاس‌های rating__star--full/--half/--empty بساز (مثلاً نیم‌ستاره با gradient یا یک لایه‌ی overlay). ستاره فعلاً کاراکتر ★ است تا Dependency جدیدی اضافه نشود؛ اگر می‌خواهی SVG بدهی، بگو تا آیکون را به‌صورت JSX.Element از prop بگیرم.
// Accessibility:
// حالت نمایشی: کل ستاره‌ها role="img" با aria-label گویا هستند و تک‌تک ستاره‌ها aria-hidden، تا screen reader یک‌بار «امتیاز ۴.۵ از ۵...» را بخواند.
// حالت تعاملی: از الگوی radiogroup/radio با aria-checked و دکمه‌های واقعی استفاده شد تا با کیبورد و screen reader قابل استفاده باشد.
// نکته‌ی تکمیلی کیبورد: اگر می‌خواهی در حالت تعاملی با کلیدهای جهت‌دار (Arrow keys) بین ستاره‌ها حرکت کند (رفتار کامل‌تر radiogroup)، بگو تا مدیریت onKeyDown و tabindex را اضافه کنم؛ فعلاً برای سادگی، انتخاب با Tab/Enter/کلیک کار می‌کند.
// امنیتی: بدون innerHTML؛ همه‌چیز متن/JSX امن. مقدار امتیاز با clamp محدود می‌شود تا ورودی نامعتبر ظاهر را خراب نکند، اما این جایگزین اعتبارسنجی Backend نیست.
// اگر می‌خواهی حالت تعاملی hover preview (نمایش امتیاز هنگام حرکت ماوس قبل از کلیک) یا پشتیبانی کامل کیبورد با Arrow keys داشته باشد، بگو تا نسخه‌ی کامل‌ترش را بسازم. 🙂


