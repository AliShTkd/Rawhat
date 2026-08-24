// src/components/layout/Footer.tsx
import type { Component } from "solid-js";
import { For, Show } from "solid-js";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  label: string; // برای aria-label و متن، مثل: "اینستاگرام"
  href: string;
}

export interface FooterProps {
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  brandName?: string;
  description?: string;
}

const Footer: Component<FooterProps> = (props) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="footer">
      <div class="footer__container">
        {/* Brand / about */}
        <div class="footer__brand">
          <a href="/" class="footer__brand-link" aria-label="صفحه اصلی">
            <span class="footer__brand-name">
              {props.brandName ?? "SupplementStore"}
            </span>
          </a>
          <Show when={props.description}>
            <p class="footer__brand-description">{props.description}</p>
          </Show>
        </div>

        {/* Link columns */}
        <nav class="footer__nav" aria-label="لینک‌های فوتر">
          <For each={props.columns ?? []}>
            {(column) => (
              <div class="footer__column">
                <h2 class="footer__column-title">{column.title}</h2>
                <ul class="footer__link-list">
                  <For each={column.links}>
                    {(link) => (
                      <li class="footer__link-item">
                        <a class="footer__link" href={link.href}>
                          {link.label}
                        </a>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </nav>

        {/* Newsletter component goes here */}
      </div>

      <div class="footer__bottom">
        <p class="footer__copyright">
          © {currentYear} {props.brandName ?? "SupplementStore"}. تمامی حقوق محفوظ است.
        </p>

        <Show when={(props.socialLinks?.length ?? 0) > 0}>
          <ul class="footer__social-list" aria-label="شبکه‌های اجتماعی">
            <For each={props.socialLinks}>
              {(social) => (
                <li class="footer__social-item">
                  <a
                    class="footer__social-link"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <span class="footer__social-label" aria-hidden="true">
                      {social.label}
                    </span>
                  </a>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </footer>
  );
};

export default Footer;












// <Footer
//   brandName="MySupplements"
//   description="فروشگاه تخصصی مکمل‌های ورزشی با تضمین اصالت کالا."
//   columns={[
//     {
//       title: "دسته‌بندی‌ها",
//       links: [
//         { label: "پروتئین", href: "/proteins" },
//         { label: "آمینو اسید", href: "/amino-acids" },
//         { label: "ویتامین", href: "/vitamins" },
//       ],
//     },
//     {
//       title: "خدمات مشتریان",
//       links: [
//         { label: "پیگیری سفارش", href: "/orders/track" },
//         { label: "قوانین بازگشت", href: "/returns" },
//         { label: "تماس با ما", href: "/contact" },
//       ],
//     },
//   ]}
//   socialLinks={[
//     { label: "اینستاگرام", href: "https://instagram.com/..." },
//     { label: "تلگرام", href: "https://t.me/..." },
//   ]}
// />







// نکته‌ها:

// برای عنوان ستون‌ها از <h2> استفاده کردم؛ اگر در صفحه سلسله‌مراتب heading متفاوتی داری، به من بگو تا تگ مناسب (مثلاً <h3>) بگذارم تا Accessibility درست بماند.
// لینک‌های شبکه‌های اجتماعی خارجی هستند، پس target="_blank" + rel="noopener noreferrer" برای امنیت اضافه شد.
// footer__social-label فعلاً متن نمایش می‌دهد؛ هر وقت خواستی به‌جای متن آیکون (SVG) بگذاری، بگو تا نسخه‌ی آیکونی بسازم.
// Componentهایی که لازم می‌شوند (نساختم، فقط نام می‌برم):

// NewsletterForm — جای آن با کامنت مشخص شده؛ چون فرم دارد و ورودی کاربر می‌گیرد، بهتر است مستقل باشد.
// SocialIcon — اگر خواستی آیکون واقعی به‌جای متن نمایش داده شود.
// اگر خواستی نسخه‌ی با @solidjs/router، یا اضافه‌کردن نماد اعتماد (اینماد/logo trust badges) که در سایت‌های فروشگاهی ایران رایج است، بگو تا همان بخش را جدا آماده کنم.







