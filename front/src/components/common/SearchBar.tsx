
// SearchBar.tsx
import { Show, createSignal, type Component } from "solid-js";

export interface SearchBarProps {
  value?: string;
  placeholder?: string;
  label?: string;
  submitLabel?: string;
  clearLabel?: string;
  showClear?: boolean;
  disabled?: boolean;
  onInput?: (query: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
}

const SearchBar: Component<SearchBarProps> = (props) => {
  const [internalValue, setInternalValue] = createSignal("");

  const isControlled = () => props.value !== undefined;
  const currentValue = () =>
    isControlled() ? props.value ?? "" : internalValue();

  const updateValue = (next: string) => {
    if (!isControlled()) {
      setInternalValue(next);
    }
    props.onInput?.(next);
  };

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const query = currentValue().trim();
    props.onSearch?.(query);
  };

  const handleClear = () => {
    if (!isControlled()) {
      setInternalValue("");
    }
    props.onClear?.();
    props.onInput?.("");
  };

  return (
    <form
      class="search-bar"
      role="search"
      onSubmit={handleSubmit}
    >
      <label class="search-bar__label" for="search-bar-input">
        {props.label ?? "جستجوی محصولات"}
      </label>

      <div class="search-bar__field">
        <input
          id="search-bar-input"
          class="search-bar__input"
          type="search"
          name="q"
          autocomplete="off"
          placeholder={props.placeholder ?? "نام محصول یا برند را جستجو کنید..."}
          value={currentValue()}
          onInput={(e) => updateValue(e.currentTarget.value)}
          disabled={props.disabled}
        />

        <Show when={props.showClear && currentValue() !== ""}>
          <button
            class="search-bar__clear"
            type="button"
            onClick={handleClear}
            aria-label={props.clearLabel ?? "پاک کردن جستجو"}
            disabled={props.disabled}
          >
            <span class="search-bar__clear-icon" aria-hidden="true">
              ×
            </span>
          </button>
        </Show>

        <button
          class="search-bar__submit"
          type="submit"
          aria-label={props.submitLabel ?? "جستجو"}
          disabled={props.disabled}
        >
          <span class="search-bar__submit-icon" aria-hidden="true">
            🔍
          </span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;






// // حالت ساده (state داخلی)
// <SearchBar
//   showClear
//   onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
// />

// // حالت کنترل‌شده (برای اتصال به autocomplete)
// const [query, setQuery] = createSignal("");

// <SearchBar
//   value={query()}
//   showClear
//   onInput={setQuery}
//   onSearch={(q) => runSearch(q)}
// />



// این هم SearchBar، یک نوار جستجوی مستقل و قابل استفاده در Header یا صفحه‌ی محصولات. چون اینجا ورودی کاربر داریم، نکات امنیتی و A11y را رعایت کردم و پایین توضیح می‌دهم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// این Component خودش به API وصل نمی‌شود و منطق جستجو/واکشی نتایج را به بیرون می‌سپارد. طبق قوانین درباره‌ی API حدس نزدم؛ فقط دو callback می‌دهم:
// onSearch(query): هنگام submit (زدن Enter یا دکمه‌ی جستجو).
// onInput(query): هنگام تغییر متن (برای اتصال به منطق پیشنهاد/autocomplete که خودت مدیریت می‌کنی).
// مقدار می‌تواند کنترل‌شده از بیرون (value + onInput) یا داخلی باشد؛ اگر value ندهی، خودش state داخلی نگه می‌دارد.
// یک دکمه‌ی پاک‌کردن (clear) اختیاری گذاشتم که با showClear فعال می‌شود.
// امنیتی: مقدار جستجو فقط به‌صورت متن به callbackها داده می‌شود؛ هیچ‌جا innerHTML نداریم. ساخت URL نهایی جستجو و encode کردن پارامترها را باید بیرون (در لایه‌ی ناوبری/سرویس) با encodeURIComponent انجام دهی و به داده‌ی کاربر اعتماد نکنی.


// نکات مهم:

// معماری/امنیت: جستجو و واکشی نتایج بیرون از این Component انجام می‌شود. هنگام ساخت URL یا کوئری، حتماً ورودی کاربر را encodeURIComponent کن و در سمت سرور هم آن را اعتبارسنجی/پاکسازی کن؛ به داده‌ی Frontend اعتماد نکن. برای autocomplete که به API می‌زند، پیشنهاد می‌کنم debounce و در صورت لزوم rate limiting سمت سرور داشته باشی؛ اگر بخواهی، می‌توانم نسخه‌ای با debounce داخلی بسازم.
// Accessibility:
// از <form role="search">، <label for> متصل به <input id>، و type="search" استفاده شد.
// دکمه‌های آیکونی (پاک‌کردن/جستجو) aria-label متنی دارند و آیکون‌هایشان aria-hidden است تا برای screen reader گویا باشند.
// آیکون‌ها: فعلاً از کاراکترهای × و 🔍 به‌عنوان placeholder آیکون استفاده کردم تا Dependency جدید اضافه نشود. اگر می‌خواهی به‌جای این‌ها یک SVG/Component آیکون (مثل چیزی که در FeaturesSection/Button به‌صورت JSX.Element می‌گرفتیم) بدهی، بگو تا SearchBar را طوری تغییر دهم که آیکون‌ها را از prop بگیرد؛ این تمیزتر و حرفه‌ای‌تر است.
// بدون inline style و کاملاً BEM؛ چیدمان (input کشسان، دکمه‌ها کنار هم)، حالت فوکوس، و responsive بودن را در CSS با همین کلاس‌ها بساز. اگر search-bar__label را می‌خواهی بصری پنهان ولی برای screen reader فعال باشد، در CSS از الگوی «visually-hidden» استفاده کن (نه display:none).
// دو تصمیمی که خوب است بگیری:

// می‌خواهی debounce و اتصال به منطق پیشنهادها (suggestions dropdown) را هم داشته باشد؟ اگر بله، بگو تا یک نسخه با ساختار مناسب (و A11y مربوط به combobox/aria-expanded) طراحی کنم — این کمی پیچیده‌تر می‌شود و بهتر است جداگانه به‌عنوان یک Component مثل SearchAutocomplete ساخته شود.
// آیکون‌ها را به‌صورت prop (JSX.Element) می‌خواهی یا همین حالت ساده کافی است؟ 