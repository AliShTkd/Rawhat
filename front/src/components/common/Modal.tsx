// Modal.tsx
import {
  Show,
  createEffect,
  createUniqueId,
  onCleanup,
  type Component,
  type JSX,
} from "solid-js";
import { Portal } from "solid-js/web";

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: JSX.Element;
  footer?: JSX.Element;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal: Component<ModalProps> = (props) => {
  const uid = createUniqueId();
  const titleId = `modal-title-${uid}`;

  let dialogRef: HTMLDivElement | undefined;
  let previouslyFocused: HTMLElement | null = null;

  const getFocusable = (): HTMLElement[] => {
    if (!dialogRef) return [];
    return Array.from(
      dialogRef.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      props.onClose();
      return;
    }

    if (event.key === "Tab") {
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const handleBackdropClick = () => {
    if (props.closeOnBackdrop !== false) {
      props.onClose();
    }
  };

  createEffect(() => {
    if (props.open) {
      previouslyFocused = document.activeElement as HTMLElement | null;

      // قفل اسکرول صفحه
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // انتقال فوکوس به داخل دیالوگ بعد از رندر
      queueMicrotask(() => {
        const focusable = getFocusable();
        (focusable[0] ?? dialogRef)?.focus();
      });

      onCleanup(() => {
        document.body.style.overflow = previousOverflow;
        previouslyFocused?.focus?.();
      });
    }
  });

  return (
    <Show when={props.open}>
      <Portal>
        <div class="modal" onKeyDown={handleKeyDown}>
          <div
            class="modal__backdrop"
            aria-hidden="true"
            onClick={handleBackdropClick}
          />

          <div
            class="modal__dialog"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabindex="-1"
          >
            <header class="modal__header">
              <h2 id={titleId} class="modal__title">
                {props.title}
              </h2>

              <button
                class="modal__close"
                type="button"
                onClick={() => props.onClose()}
                aria-label={props.closeLabel ?? "بستن"}
              >
                <span class="modal__close-icon" aria-hidden="true">
                  ×
                </span>
              </button>
            </header>

            <div class="modal__body">{props.children}</div>

            <Show when={props.footer}>
              <footer class="modal__footer">{props.footer}</footer>
            </Show>
          </div>
        </div>
      </Portal>
    </Show>
  );
};

export default Modal;












// const [open, setOpen] = createSignal(false);

// <button type="button" onClick={() => setOpen(true)}>باز کردن</button>

// <Modal
//   open={open()}
//   title="حذف محصول"
//   onClose={() => setOpen(false)}
//   footer={
//     <>
//       <button type="button" onClick={() => setOpen(false)}>انصراف</button>
//       <button type="button" onClick={confirmDelete}>حذف</button>
//     </>
//   }
// >
//   <p>آیا از حذف این محصول مطمئن هستید؟</p>
// </Modal>

// این هم Modal، یکی از حساس‌ترین Componentها از نظر Accessibility. یک modal حرفه‌ای باید focus trap، بستن با Escape، کلیک روی backdrop، بازگرداندن فوکوس، و قفل اسکرول صفحه را درست مدیریت کند. همه را رعایت کردم و پایین توضیح می‌دهم.

// فرض‌هایی که گذاشتم (اگر فرق دارد بگو):

// کنترل‌شده از بیرون: open + onClose. این برای پروژه‌ی بزرگ تمیزتر است.
// با Portal از solid-js/web رندر می‌شود (بخشی از خود Solid است، Dependency جدید نیست) تا modal بیرون از سلسله‌ی DOM والد و روی همه‌چیز بنشیند.
// title اجباری است و به‌عنوان عنوان قابل‌دسترس دیالوگ (aria-labelledby) استفاده می‌شود.
// محتوای دلخواه از children می‌آید؛ یک ناحیه‌ی footer اختیاری برای دکمه‌ها هم گذاشتم.


// نکات مهم:

// Accessibility (قلب این Component):
// role="dialog" + aria-modal="true" + aria-labelledby به عنوان دیالوگ.
// Focus trap: با مدیریت Tab/Shift+Tab فوکوس داخل دیالوگ حبس می‌شود.
// بستن با Escape و کلیک روی backdrop (backdrop قابل‌غیرفعال‌شدن با closeOnBackdrop={false} برای دیالوگ‌های حساس مثل پرداخت).
// بازگرداندن فوکوس: هنگام باز شدن، عنصر فعال قبلی ذخیره و هنگام بستن به آن بازگردانده می‌شود (مهم برای کاربران کیبورد/screen reader).
// قفل اسکرول بدنه هنگام باز بودن.
// دکمه‌ی بستن aria-label متنی دارد و آیکونش aria-hidden است.
// استثنای inline style (اعلام صریح): طبق قانون، فقط جایی از inline style استفاده کردم که رفتاری و ضروری است، نه ظاهری: document.body.style.overflow برای قفل اسکرول. این کار روی خودِ عنصر Modal نیست بلکه رفتار مرورگر است. اگر ترجیح می‌دهی به‌جای آن یک کلاس روی <body> (مثل body--modal-open) toggle کنم تا کاملاً بدون inline style باشد، بگو تا تغییر دهم (روش تمیزتری هم هست).
// امنیتی: بدون innerHTML؛ محتوا به‌صورت children امن رندر می‌شود. برای دیالوگ‌های تأیید عملیات حساس (حذف/پرداخت)، تأکید می‌کنم که تأیید نهایی و مجوز باید سمت سرور بررسی شود؛ بستن/باز بودن modal صرفاً UI است.
// بدون وابستگی جدید: فقط از Portal و APIهای خود Solid استفاده شد.
// SSR: استفاده از document/document.body فرض بر اجرای سمت کلاینت دارد. اگر پروژه SSR/SolidStart است، بگو تا دسترسی به document را با بررسی محیط ایمن کنم تا در سرور خطا ندهد.
// دو نکته که ممکن است بخواهی بهترش کنیم:

// انیمیشن باز/بسته شدن: چون با Show مستقیم mount/unmount می‌شود، انیمیشن خروج ندارد. اگر transition می‌خواهی، می‌توان با کلاس‌ها و کمی تأخیر در unmount اضافه کرد؛ بگو تا نسخه‌اش را بسازم.
// اگر می‌خواهی چند اندازه (sm/md/lg) یا حالت تمام‌صفحه در موبایل داشته باشد، بگو تا variantها را با BEM اضافه کنم. 