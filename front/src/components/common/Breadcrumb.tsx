// src/components/common/Breadcrumb.tsx
import { type Component, For, Show } from "solid-js";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  ariaLabel?: string;
}

const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  const isLast = (index: number) => index === props.items.length - 1;

  return (
    <nav class="breadcrumb" aria-label={props.ariaLabel ?? "مسیر ناوبری"}>
      <ol class="breadcrumb__list">
        <For each={props.items}>
          {(item, index) => (
            <li class="breadcrumb__item">
              <Show
                when={!isLast(index()) && item.href}
                fallback={
                  <span
                    class="breadcrumb__current"
                    aria-current={isLast(index()) ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                }
              >
                <a class="breadcrumb__link" href={item.href}>
                  {item.label}
                </a>
              </Show>

              <Show when={!isLast(index())}>
                <span class="breadcrumb__separator" aria-hidden="true">
                  /
                </span>
              </Show>
            </li>
          )}
        </For>
      </ol>
    </nav>
  );
};

export default Breadcrumb;










// <Breadcrumb
//   items={[
//     { label: "خانه", href: "/" },
//     { label: "پروتئین", href: "/proteins" },
//     { label: "وی پروتئین گلد استاندارد" }, // آیتم آخر = صفحه فعلی، بدون لینک
//   ]}
// />




// نکته‌ها:

// از <nav> + <ol> استفاده شد چون breadcrumb یک ناوبری ترتیبی است؛ این ساختار توصیه‌شده‌ی WAI-ARIA است.
// جداکننده‌ی / با aria-hidden="true" مخفی شده تا screen reader آن را نخواند. اگر ترجیح می‌دهی جداکننده کاملاً با CSS (مثلاً ::before روی breadcrumb__item) ساخته شود و از DOM حذف شود، بگو تا breadcrumb__separator را بردارم.
// آخرین آیتم همیشه به‌عنوان صفحه‌ی فعلی رندر می‌شود؛ اگر می‌خواهی آخرین آیتم هم لینک‌دار باشد، بگو تا منطق را تغییر بدهم.
// نکته‌ی مهم (SEO): اگر برای این سایت فروشگاهی به Structured Data (اسکیمای BreadcrumbList با JSON-LD) نیاز داری تا در نتایج گوگل breadcrumb نمایش داده شود، بهتر است آن را جدا و به‌صورت امن مدیریت کنیم (نه با innerHTML). بگو تا نسخه‌ای با JSON-LD امن برایت آماده کنم.