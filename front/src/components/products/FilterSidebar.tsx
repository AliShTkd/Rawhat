
// components/products/FilterSidebar.tsx
import {
  Show,
  createEffect,
  onCleanup,
  createUniqueId,
  type Component,
  type JSX,
} from "solid-js";

export interface FilterSidebarProps {
  /** فقط برای موبایل: باز بودن کشو */
  open?: boolean;
  onClose?: () => void;

  title?: string;
  /** تعداد فیلترهای فعال، برای نمایش در سربرگ کشو */
  activeFilterCount?: number;

  /** دکمه‌ی «مشاهده‌ی نتایج» در پای کشوی موبایل */
  resultCount?: number;
  onApply?: () => void;

  children: JSX.Element;
}

const FilterSidebar: Component<FilterSidebarProps> = (props) => {
  const titleId = createUniqueId();
  let panelRef: HTMLDivElement | undefined;
  let previouslyFocused: HTMLElement | null = null;

  const title = () => props.title ?? "فیلترها";

  // مدیریت کشوی موبایل: قفل اسکرول + Esc + فوکوس‌تله + بازگرداندن فوکوس
  createEffect(() => {
    if (!props.open) return;

    previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.classList.add("has-open-drawer");

    // فوکوس اولیه به داخل پنل
    queueMicrotask(() => {
      const focusable = panelRef?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable ?? panelRef)?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        props.onClose?.();
        return;
      }
      if (e.key !== "Tab" || !panelRef) return;

      // فوکوس‌تله ساده
      const nodes = panelRef.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (nodes.length === 0) return;
      const list = Array.from(nodes).filter((n) => !n.hasAttribute("disabled"));
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    onCleanup(() => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.classList.remove("has-open-drawer");
      // بازگرداندن فوکوس به عنصری که کشو را باز کرده بود
      previouslyFocused?.focus?.();
    });
  });

  return (
    <>
      {/* نسخه‌ی دسکتاپ: سایدبار ثابت (نمایش/عدم‌نمایش با CSS) */}
      <aside class="filter-sidebar filter-sidebar--desktop" aria-label={title()}>
        <div class="filter-sidebar__inner">{props.children}</div>
      </aside>

      {/* نسخه‌ی موبایل: کشو (Drawer) */}
      <Show when={props.open}>
        <div class="filter-sidebar__overlay filter-sidebar--mobile">
          {/* پس‌زمینه‌ی کلیک‌پذیر برای بستن */}
          <div
            class="filter-sidebar__backdrop"
            onClick={() => props.onClose?.()}
            aria-hidden="true"
          />
          <div
            class="filter-sidebar__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabindex="-1"
            ref={panelRef}
          >
            <header class="filter-sidebar__header">
              <h2 class="filter-sidebar__title" id={titleId}>
                {title()}
                <Show when={(props.activeFilterCount ?? 0) > 0}>
                  <span class="filter-sidebar__count">
                    {props.activeFilterCount!.toLocaleString("fa-IR")}
                  </span>
                </Show>
              </h2>
              <button
                class="filter-sidebar__close"
                type="button"
                aria-label="بستن فیلترها"
                onClick={() => props.onClose?.()}
              >
                <span aria-hidden="true">✕</span>
              </button>
            </header>

            <div class="filter-sidebar__body">{props.children}</div>

            <footer class="filter-sidebar__footer">
              <button
                class="filter-sidebar__apply"
                type="button"
                onClick={() => props.onApply?.()}
              >
                <Show
                  when={props.resultCount != null}
                  fallback="مشاهده‌ی نتایج"
                >
                  مشاهده‌ی {props.resultCount!.toLocaleString("fa-IR")} نتیجه
                </Show>
              </button>
            </footer>
          </div>
        </div>
      </Show>
    </>
  );
};

export default FilterSidebar;



















// // داخل ProductsPage
// <FilterSidebar
//   open={filtersOpen()}
//   onClose={() => setFiltersOpen(false)}
//   activeFilterCount={activeFilterCount()}
//   resultCount={props.totalCount}
//   onApply={() => setFiltersOpen(false)}  // چون فیلترها فوری اعمال می‌شوند، فقط می‌بندد
// >
//   <ProductFilters
//     facets={facets()}
//     value={currentFilters()}
//     onChange={applyFilters}
//     onClear={clearFilters}
//   />
// </FilterSidebar>


// این هم components/products/FilterSidebar.tsx. این همان ظرفِ فیلترهاست که چند بار به آن اشاره کردم: در دسکتاپ به‌صورت سایدبار همیشگی، و در موبایل به‌صورت کشو (Drawer) که با دکمه‌ی «فیلترها»ی ProductsHeader باز/بسته می‌شود. نکته‌ی کلیدی این است که این Component خودش فیلتر نیست؛ فقط ProductFilters را در بر می‌گیرد و مسئولیت‌های سختِ Drawer (فوکوس‌تله، بستن با Esc، اسکرول‌لاک، overlay) را مدیریت می‌کند.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// باز/بسته‌بودن موبایل کنترل‌شده از بیرون است (open + onClose)، چون منبع حقیقتش در ProductsPage است (همان state ای که دکمه‌ی ProductsHeader ست می‌کند). خود Component state ماندگار نگه نمی‌دارد.
// در دسکتاپ، Drawer معنی ندارد؛ همان محتوا به‌صورت سایدبار ثابت رندر می‌شود (تفاوت با CSS + یک تشخیص breakpoint سبک). یعنی یک مارک‌آپ، دو ظاهر.
// خود فیلترها را به‌صورت children/slot می‌گیرد تا این ظرف به منطق فیلتر گره نخورد و قابل‌استفاده‌ی مجدد بماند (می‌توانی ProductFilters را داخلش بگذاری).



// نکات مهم:

// یک محتوا، دو ظاهر (تصمیم معماری مهم): من هم سایدبار دسکتاپ و هم کشوی موبایل را در یک Component گذاشتم و children را دوبار رندر می‌کنم (یک‌بار در --desktop، یک‌بار در --mobile). این ساده‌ترین راه است ولی یک هشدار جدی دارد 👇
// خطر id تکراری / دوبار رندرِ فرم: چون ProductFilters داخل هر دو نسخه رندر می‌شود، اگر هر دو در DOM باشند، idهای داخلی (input های قیمت و…) دوبار می‌شوند و ممکن است دو input با یک id داشته باشیم. الان چون نسخه‌ی موبایل فقط با Show when={open} رندر می‌شود، معمولاً هم‌زمان با دسکتاپ در DOM فعال نیستند (در دسکتاپ کاربر Drawer را باز نمی‌کند)، ولی این تضمینِ قطعی نیست. دو راه امن‌تر دارم و باید انتخاب کنی:
// تشخیص breakpoint با JS (مثلاً matchMedia) و رندرِ فقط یکی از دو نسخه در هر لحظه (نه هر دو با CSS). این مشکل id را کامل حل می‌کند ولی SSR/هیدریشن را کمی حساس می‌کند.
// دو نمونه‌ی جدا از فیلتر با idهای namespaced — پیچیده‌تر. من راه ۱ را توصیه می‌کنم. بگو تا نسخه‌ی matchMediaدار را بدهم (تمیزتر و بدون خطر id تکراری).
// A11y کشو (بخش سخت، رعایت‌شده):
// پنل role="dialog" + aria-modal="true" + aria-labelledby به عنوان است.
// فوکوس‌تله: Tab/Shift+Tab داخل پنل حلقه می‌زند و بیرون نمی‌رود.
// Esc می‌بندد، و هنگام بستن فوکوس به دکمه‌ی بازکننده برمی‌گردد (این را با ذخیره‌ی document.activeElement انجام دادم؛ برای کاربر کیبورد/صفحه‌خوان حیاتی است).
// قفل اسکرول پس‌زمینه با کلاس has-open-drawer روی body (در CSS: body.has-open-drawer { overflow: hidden }).
// backdrop کلیک‌پذیر برای بستن، و aria-hidden چون صرفاً تزئینی/تعاملیِ ماوسی است (بستن با کیبورد از طریق Esc انجام می‌شود).
// دو ملاحظه‌ی فنی که ممکن است بخواهی بهبود دهی:
// Portal: پنل موبایل بهتر است با <Portal> (از solid-js/web) به body منتقل شود تا از overflow/z-index والدها فرار کند و لایه‌بندی‌اش قطعی شود. الان درون درخت خودش رندر می‌شود. اگر سایدبار در ظرفی با overflow: hidden باشد، Drawer ممکن است بریده شود. توصیه می‌کنم Portal اضافه کنیم؛ بگو تا این نسخه را بدهم.
// فوکوس‌تله‌ی ساده در برابر کامل: پیاده‌سازی فعلی برای حالت‌های رایج خوب است، ولی موارد لبه‌ای (عناصر با tabindex مثبت، عناصر مخفیِ موقت) را کامل پوشش نمی‌دهد. برای محصول جدی، معمولاً از یک کتابخانه‌ی کوچک focus-trap استفاده می‌شود. اگر بخواهی، نسخه‌ی مقاوم‌ترش را می‌دهم.
// دکمه‌ی «مشاهده‌ی نتایج» و مدل اعمال: چون در ProductFilters قرار شد فیلترها فوری اعمال شوند، دکمه‌ی پای کشو صرفاً می‌بندد (و تعداد نتیجه‌ی فعلی را نشان می‌دهد تا کاربر بداند انتخابش چه اثری داشته). اگر مدل «اعمال با دکمه» را برای موبایل انتخاب کنی (که تجربه‌ی موبایلِ بهتری است چون هر تیک یک درخواست نمی‌زند)، این دکمه باید فیلترهای موقت را commit کند. این همان تصمیمی است که در ProductFilters باز گذاشتیم و حالا به هم گره می‌خورد — بگو کدام مدل، تا هر دو را هماهنگ کنم.
// بدون inline style و کاملاً BEM؛ نکات CSS:
// filter-sidebar--desktop در موبایل display: none و در دسکتاپ display: block؛ برعکسش برای overlay موبایل.
// filter-sidebar__panel از راست (در RTL) با inset-inline-start/end و انیمیشن transform: translateX(...) بیرون می‌آید؛ از خاصیت‌های منطقی استفاده کن تا در RTL از سمت درست باز شود.
// filter-sidebar__overlay تمام‌صفحه با position: fixed; inset: 0; z-index بالا؛ backdrop نیمه‌شفاف.
// prefers-reduced-motion را احترام بگذار (انیمیشن باز/بسته را کم کن).
// filter-sidebar__footer چسبیده به پایین (position: sticky; inset-block-end: 0) تا دکمه‌ی نتایج همیشه دیده شود.
// جمع‌بندی: با این، کل تجربه‌ی فیلتر روی موبایل و دسکتاپ پوشش داده شد. سه هماهنگی واقعی که باز است و بهتر است تصمیم بگیری:

// رندر شرطی با matchMedia به‌جای دوبار رندرِ CSS-only (برای رفع خطر id تکراری) — توصیه‌شده.
// افزودن <Portal> برای پنل موبایل — توصیه‌شده.
// مدل اعمال فوری در برابر اعمال با دکمه در موبایل (گره‌خورده به ProductFilters).