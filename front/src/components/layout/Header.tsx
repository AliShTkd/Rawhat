// src/components/layout/Header.tsx
import type { Component } from "solid-js";
import { For, createSignal, Show } from "solid-js";

export interface NavItem {
  label: string;
  href: string;
}

export interface HeaderProps {
  navItems: NavItem[];
  cartCount?: number;
  isAuthenticated?: boolean;
  logoText?: string;
}

const Header: Component<HeaderProps> = (props) => {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header class="header">
      <div class="header__container">
        {/* Logo */}
        <a href="/" class="header__logo" aria-label="صفحه اصلی">
          <span class="header__logo-text">{props.logoText ?? "SupplementStore"}</span>
        </a>

        {/* Mobile menu toggle */}
        <button
          type="button"
          class="header__menu-toggle"
          aria-label={isMenuOpen() ? "بستن منو" : "باز کردن منو"}
          aria-expanded={isMenuOpen()}
          aria-controls="header-navigation"
          onClick={toggleMenu}
        >
          <span class="header__menu-icon" aria-hidden="true" />
        </button>

        {/* Primary navigation */}
        <nav
          id="header-navigation"
          class="header__nav"
          classList={{ "header__nav--open": isMenuOpen() }}
          aria-label="منوی اصلی"
        >
          <ul class="header__nav-list">
            <For each={props.navItems}>
              {(item) => (
                <li class="header__nav-item">
                  <a class="header__nav-link" href={item.href} onClick={closeMenu}>
                    {item.label}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </nav>

        {/* Actions: search / account / cart */}
        <div class="header__actions">
          {/* SearchBar component goes here */}

          <a
            class="header__action-link"
            href={props.isAuthenticated ? "/account" : "/login"}
          >
            {props.isAuthenticated ? "حساب کاربری" : "ورود"}
          </a>

          <a class="header__cart" href="/cart" aria-label="سبد خرید">
            <span class="header__cart-label" aria-hidden="true">سبد</span>
            <Show when={(props.cartCount ?? 0) > 0}>
              <span class="header__cart-count">{props.cartCount}</span>
            </Show>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;














// <Header
//   logoText="MySupplements"
//   cartCount={3}
//   isAuthenticated={false}
//   navItems={[
//     { label: "پروتئین", href: "/proteins" },
//     { label: "آمینو اسید", href: "/amino-acids" },
//     { label: "ویتامین", href: "/vitamins" },
//     { label: "وبلاگ", href: "/blog" },
//   ]}
// />




// Componentهایی که برای تکمیل لازم‌اند (نساختم، فقط نام می‌برم):

// Logo — اگر خواستی لوگوی تصویری (با alt) به‌جای متن استفاده شود.
// SearchBar — جای آن با کامنت مشخص شده (header__actions).
// CartButton — اگر منطق سبد خرید پیچیده‌تر شد، می‌توان header__cart را به یک Component مستقل تبدیل کرد.
// نکته‌های مهم:

// cartCount و isAuthenticated فقط برای نمایش هستند؛ دسترسی واقعی کاربر و اعتبارسنجی سبد باید در Backend انجام شود.
// header__logo-text به‌صورت متن رندر می‌شود (نه innerHTML) تا از XSS جلوگیری شود.
// برای موبایل، منو با header__nav--open کنترل می‌شود؛ استایل نمایش/مخفی‌سازی responsive را در CSS با media query خودت اعمال کن.
// اگر خواستی نسخه‌ی با @solidjs/router (لینک <A> + useLocation برای active state)، لوگوی تصویری، یا Dropdown چندسطحی بسازم، بگو تا همان را جدا آماده کنم.