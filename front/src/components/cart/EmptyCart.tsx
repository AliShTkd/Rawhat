import type { Component } from "solid-js";
import { A } from "@solidjs/router";
const EmptyCart: Component = () => (
  <div class="empty-cart">
    <p>سبد خرید شما خالی است.</p>
    <A href="/products">مشاهده محصولات</A>
  </div>
);
export default EmptyCart;
