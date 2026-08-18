// HeroSection.tsx
import { Show, For, type Component, type JSX } from "solid-js";

export interface HeroAction {
  label: string;
  href?: string;
  onClick?: (event: MouseEvent) => void;
  variant?: "primary" | "secondary";
}

export interface HeroImage {
  src: string;
  alt: string;
}

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: HeroAction[];
  image?: HeroImage;
  children?: JSX.Element;
}

const HeroSection: Component<HeroSectionProps> = (props) => {
  return (
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__container">
        <div class="hero__content">
          <Show when={props.eyebrow}>
            <p class="hero__eyebrow">{props.eyebrow}</p>
          </Show>

          <h1 id="hero-title" class="hero__title">
            {props.title}
          </h1>

          <Show when={props.subtitle}>
            <p class="hero__subtitle">{props.subtitle}</p>
          </Show>

          <Show when={props.actions && props.actions.length > 0}>
            <div class="hero__actions">
              <For each={props.actions}>
                {(action) => (
                  <a
                    class="hero__action"
                    classList={{
                      "hero__action--primary":
                        (action.variant ?? "primary") === "primary",
                      "hero__action--secondary":
                        action.variant === "secondary",
                    }}
                    href={action.href ?? "#"}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </a>
                )}
              </For>
            </div>
          </Show>

          <Show when={props.children}>
            <div class="hero__extra">{props.children}</div>
          </Show>
        </div>

        <Show when={props.image}>
          {(image) => (
            <div class="hero__media">
              <img
                class="hero__image"
                src={image().src}
                alt={image().alt}
                loading="eager"
                decoding="async"
              />
            </div>
          )}
        </Show>
      </div>
    </section>
  );
};

export default HeroSection;



// <HeroSection
//   eyebrow="مکمل‌های تأییدشده"
//   title="انرژی و ریکاوری حرفه‌ای"
//   subtitle="بهترین مکمل‌های ورزشی با تضمین اصالت کالا"
//   image={{ src: "/images/hero.webp", alt: "پروتئین وی و مکمل‌های ورزشی" }}
//   actions={[
//     { label: "مشاهده محصولات", href: "/products", variant: "primary" },
//     { label: "مشاوره رایگان", href: "/consult", variant: "secondary" },
//   ]}
// />


// عالی 👍 قبل از اینکه بیش از حد فرض کنم، چون گفتی سایت بزرگ و پرفیچر است، من HeroSection را به‌صورت prop-driven و کاملاً مستقل می‌سازم تا در بخش‌های مختلف قابل استفاده باشد و محتوایش hard-code نشود.

// چند فرض که برای این نسخه گذاشتم (اگر متفاوت است بگو تا اصلاح کنم):

// محتوای Hero (عنوان، توضیح، متن دکمه‌ها، تصویر) از طریق Props می‌آید، نه ثابت داخل کد.
// دکمه‌ها فعلاً به‌صورت لینک ناوبری (<a>) هستند و رفتارشان از بیرون کنترل می‌شود (یا با href یا onClick). اگر Component جداگانه‌ای به نام Button داری، من آن را نمی‌سازم و فقط نامش را اعلام می‌کنم تا خودت جایگزین کنی.
// تصویر Hero از یک URL می‌آید و alt اجباری است (برای Accessibility).

// بدون inline style و کاملاً با BEM نوشته شده؛ کل استایل و responsive بودن (چیدمان دو ستونه در دسکتاپ و تک‌ستونه در موبایل) را در CSS با همین کلاس‌ها پیاده کن.
// برای Accessibility: از <section aria-labelledby>، یک <h1> واقعی، و alt اجباری روی تصویر استفاده شده. دقت کن در هر صفحه فقط یک <h1> داشته باش؛ اگر این Hero در جایی غیر از صفحه اصلی استفاده شد، ممکن است بخواهی سطح heading را قابل‌تنظیم کنم (بگو تا prop مربوطه را اضافه کنم).
// امنیتی: هیچ محتوایی با innerHTML رندر نشده و همه‌چیز به‌صورت امن به‌عنوان متن درج می‌شود.
// اگر می‌خواهی به‌جای <a> از Component اختصاصی Button استفاده کنم، یا اگر Hero باید یک پس‌زمینه تصویری (background image) به‌جای <img> داشته باشد، بگو تا نسخه‌اش را مطابق آن بسازم. 