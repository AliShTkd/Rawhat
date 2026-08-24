// src/components/layout/MainLayout.tsx
import type { Component } from "solid-js";
import type { RouteSectionProps } from "@solidjs/router";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../../stores/userStore";
import { useCartStore } from "../../stores/cartStore";
import { ROUTES } from "../../constants";

const navItems = [
  { label: "محصولات", href: ROUTES.products },
  { label: "سبد خرید", href: ROUTES.cart },
  { label: "سفارش‌ها", href: ROUTES.orders },
];

const footerColumns = [
  {
    title: "دسته‌بندی‌ها",
    links: [
      { label: "محصولات", href: ROUTES.products },
      { label: "سبد خرید", href: ROUTES.cart },
    ],
  },
  {
    title: "حساب کاربری",
    links: [
      { label: "ورود", href: ROUTES.login },
      { label: "سفارش‌ها", href: ROUTES.orders },
    ],
  },
];

const MainLayout: Component<RouteSectionProps> = (props) => {
  const auth = useAuth();
  const cart = useCartStore();

  return (
    <div class="main-layout">
      <a href="#main-content" class="main-layout__skip-link">
        پرش به محتوای اصلی
      </a>

      <Header
        navItems={navItems}
        cartCount={cart.items.length}
        isAuthenticated={auth.isAuthenticated}
        logoText="Farhang"
      />

      <main id="main-content" class="main-layout__content">
        {props.children}
      </main>

      <Footer
        brandName="Farhang"
        description="فروشگاه تخصصی مکمل‌های ورزشی با تضمین اصالت کالا."
        columns={footerColumns}
      />
    </div>
  );
};

export default MainLayout;
