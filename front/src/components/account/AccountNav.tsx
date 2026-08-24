import type { Component } from "solid-js";
import { A } from "@solidjs/router";
const AccountNav: Component = () => (
  <nav class="account-nav" aria-label="ناوبری حساب کاربری">
    <A href="/account" end>پروفایل</A>
    <A href="/account/addresses">آدرس‌ها</A>
    <A href="/orders">سفارش‌ها</A>
    <A href="/wishlist">علاقه‌مندی‌ها</A>
  </nav>
);
export default AccountNav;
