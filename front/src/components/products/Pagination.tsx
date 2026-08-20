
// components/products/Pagination.tsx
import {
  For,
  Show,
  createMemo,
  type Component,
} from "solid-js";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** چند صفحه در هر طرفِ صفحه‌ی جاری نشان داده شود (پیش‌فرض ۱) */
  siblingCount?: number;
  /** نمایش دکمه‌های قبلی/بعدی (پیش‌فرض true) */
  showPrevNext?: boolean;
  ariaLabel?: string;
}

// نشانه‌گر شکاف برای «…»
type PageItem = number | "start-ellipsis" | "end-ellipsis";

const range = (start: number, end: number): number[] =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

const ProductPagination: Component<PaginationProps> = (props) => {
  const siblings = () => props.siblingCount ?? 1;
  const showPrevNext = () => props.showPrevNext ?? true;

  const clamp = (p: number) =>
    Math.min(Math.max(1, p), Math.max(1, props.totalPages));

  const canPrev = () => props.currentPage > 1;
  const canNext = () => props.currentPage < props.totalPages;

  // ساخت آرایه‌ی آیتم‌ها با «…»
  const items = createMemo<PageItem[]>(() => {
    const total = props.totalPages;
    const current = props.currentPage;
    const sib = siblings();

    // آستانه: اول، آخر، جاری، sib در هر طرف، و ۲ برای خود ellipsisها
    const totalNumbers = sib * 2 + 5;
    if (total <= totalNumbers) return range(1, total);

    const leftSibling = Math.max(current - sib, 1);
    const rightSibling = Math.min(current + sib, total);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < total - 1;

    const result: PageItem[] = [];
    result.push(1);
    if (showLeftEllipsis) result.push("start-ellipsis");
    else if (leftSibling === 2) result.push(2);

    result.push(...range(Math.max(leftSibling, 2), Math.min(rightSibling, total - 1)));

    if (showRightEllipsis) result.push("end-ellipsis");
    else if (rightSibling === total - 1) result.push(total - 1);

    result.push(total);
    return result;
  });

  const go = (page: number) => {
    const target = clamp(page);
    if (target !== props.currentPage) props.onPageChange(target);
  };

  return (
    <nav
      class="pagination"
      aria-label={props.ariaLabel ?? "صفحه‌بندی"}
    >
      <ul class="pagination__list">
        {/* قبلی */}
        <Show when={showPrevNext()}>
          <li class="pagination__item pagination__item--prev">
            <button
              type="button"
              class="pagination__link pagination__link--prev"
              aria-label="صفحه‌ی قبلی"
              disabled={!canPrev()}
              onClick={() => go(props.currentPage - 1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
          </li>
        </Show>

        {/* شماره‌ها */}
        <For each={items()}>
          {(item) => (
            <Show
              when={typeof item === "number"}
              fallback={
                <li
                  class="pagination__item pagination__item--ellipsis"
                  aria-hidden="true"
                >
                  <span class="pagination__ellipsis">…</span>
                </li>
              }
            >
              <li class="pagination__item">
                <button
                  type="button"
                  class="pagination__link"
                  classList={{
                    "pagination__link--current":
                      (item as number) === props.currentPage,
                  }}
                  aria-label={`صفحه‌ی ${(item as number).toLocaleString("fa-IR")}`}
                  aria-current={
                    (item as number) === props.currentPage ? "page" : undefined
                  }
                  onClick={() => go(item as number)}
                >
                  {(item as number).toLocaleString("fa-IR")}
                </button>
              </li>
            </Show>
          )}
        </For>

        {/* بعدی */}
        <Show when={showPrevNext()}>
          <li class="pagination__item pagination__item--next">
            <button
              type="button"
              class="pagination__link pagination__link--next"
              aria-label="صفحه‌ی بعدی"
              disabled={!canNext()}
              onClick={() => go(props.currentPage + 1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          </li>
        </Show>
      </ul>
    </nav>
  );
};

export default ProductPagination;























// // داخل ProductsPage (همان‌جایی که قبلاً <Pagination/> را صدا زده بودیم):
// <Show when={totalPages() > 1}>
//   <ProductPagination
//     currentPage={currentPage()}
//     totalPages={totalPages()}
//     onPageChange={changePage}   // در URL می‌نشیند + اسکرول به بالا
//   />
// </Show>



// بالاخره رسیدیم به Pagination — همان قطعه‌ی کوچکی که چند بار پیشنهادش دادم و ProductsPage مستقیماً به آن نیاز داشت. این‌جا بیشترین چالش A11y و منطق نمایش شماره‌ها با «…» (ellipsis) است، نه ظاهر.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// کنترل‌شده: صفحه‌ی جاری را prop می‌گیرد (currentPage) و تغییر را با onPageChange بالا می‌دهد تا در query/URL بنشیند (هماهنگ با کل صفحه‌ی لیست). خودش state ندارد.
// منطق پنجره‌ی لغزان با «…» دارد تا برای تعداد صفحه‌ی زیاد، نوار غول‌پیکر نشود (مثل ۱ … ۴ ۵ [۶] ۷ ۸ … ۲۰).
// به‌صورت <nav> با فهرست <ul>/<li> ساخته شده و صفحه‌ی جاری با aria-current="page" مشخص می‌شود. در RTL، جهت «قبلی/بعدی» را با خاصیت‌های منطقی می‌سپاریم به CSS.



// نکات مهم:

// منطق «…» (مهم‌ترین بخش): به‌جای نمایش همه‌ی صفحه‌ها، یک پنجره‌ی لغزان دور صفحه‌ی جاری می‌سازد و بین بخش‌ها «…» می‌گذارد. siblingCount تعیین می‌کند در هر طرفِ صفحه‌ی جاری چند شماره دیده شود. یک ظرافت مهم که رعایت شده: وقتی فقط یک صفحه بین اول/آخر و پنجره فاصله است، به‌جای «…» خود آن شماره نشان داده می‌شود (چون «…» که جای فقط یک عدد را بگیرد بی‌معنی است). این باگ کلاسیک اکثر Paginationهاست.
// A11y (نقطه‌ی قوت):
// کل ناحیه <nav aria-label="صفحه‌بندی"> است تا صفحه‌خوان آن را به‌عنوان یک ناحیه‌ی ناوبری مجزا بشناسد (اگر چند pagination در صفحه داری، ariaLabel متفاوت بده).
// صفحه‌ی جاری aria-current="page" دارد — این مهم‌ترین سیگنال دسترس‌پذیری اینجاست؛ رنگ/استایل به‌تنهایی کافی نیست.
// هر دکمه aria-label گویا دارد («صفحه‌ی ۵»، «صفحه‌ی قبلی») چون خود عدد به‌تنهایی برای صفحه‌خوان مبهم است.
// «…» صرفاً تزئینی است (aria-hidden) و دکمه نیست تا فوکوس روی چیزِ غیرقابل‌کلیک نرود.
// دکمه‌های قبلی/بعدی در مرزها disabled می‌شوند (نه اینکه حذف شوند) تا جای عناصر نپرد و وضعیت گویا بماند.
// چرا <button> نه <a>؟ چون در این معماری، ناوبری از طریق callback و به‌روزرسانی query انجام می‌شود (client-side)، نه لینک مستقیم. اما یک بهبود SEO مهم: برای خزنده‌ها بهتر است هر صفحه یک <a href="?page=n"> واقعی هم داشته باشد تا لینک‌ها crawlable باشند. اگر SEO لیست برایت مهم است (که برای فروشگاه معمولاً هست)، می‌توانم نسخه‌ای بدهم که به‌جای <button> از <a> با href واقعی استفاده کند و در onClick هم preventDefault + ناوبری کلاینتی انجام دهد (الگوی progressive enhancement). بگو تا این نسخه را بسازم؛ برای صفحه‌ی محصولات توصیه‌اش می‌کنم.
// RTL: آیکن‌های ‹/› را برای «قبلی/بعدی» گذاشتم، ولی در RTL جهت باید برعکس دیده شود. بهتر است جهتِ چیدمان را به CSS منطقی بسپاری (چیدمان ul به‌صورت flex و در RTL خودش راست‌به‌چپ می‌شود) و اگر خواستی آیکن‌ها را با scale(-1,1)/انتخاب آیکن مناسب هم‌جهت کنی. اعداد با toLocaleString("fa-IR") فارسی‌اند.
// نام‌گذاری فایل vs export: فایل Pagination.tsx است ولی من default export را ProductPagination نامیدم تا با احتمال وجود یک Pagination عمومی‌ترِ دیگر تداخل نداشته باشد. اگر ترجیح می‌دهی نامش دقیقاً Pagination باشد یا این را به‌عنوان یک primitive عمومی در components/ (نه components/products/) بگذاریم، بگو — چون این واقعاً یک قطعه‌ی عمومی است و شاید جایش در components/products/ نباشد.
// بدون inline style و کاملاً BEM؛ نکات CSS: pagination__list را display: flex; gap; align-items: center; flex-wrap: wrap کن؛ حالت جاری با .pagination__link--current (و به‌تناسب [aria-current="page"])؛ حالت :disabled برای قبلی/بعدی؛ اندازه‌ی هدف لمسی حداقل ۴۴×۴۴ پیکسل برای موبایل؛ از خاصیت‌های منطقی برای RTL.