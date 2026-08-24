// pages/Cart/Cart.tsx
import { Show, For, createMemo, type Component } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { useCartStore, cartActions } from "../../stores/cartStore";

const CartPage: Component = () => {
  const store = useCartStore();
  const navigate = useNavigate();

  const isEmpty = () => store.cart.items.length === 0;

  const subtotal = createMemo(() => {
    return store.cart.items.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);
  });

  return (
    <main class="cart" dir="rtl">
      <h1 class="cart__title">سبد خرید</h1>

      <Show
        when={!isEmpty()}
        fallback={
          <div class="empty-cart">
            <p>سبد خرید شما خالی است.</p>
            <A href="/products" class="button--primary" style={{ "margin-top": "1rem", "display": "inline-block" }}>
              مشاهده محصولات
            </A>
          </div>
        }
      >
        <div class="cart__layout">
          <div class="cart__items">
            <For each={store.cart.items}>
              {(item) => (
                <div class="cart-item">
                  <div class="cart-item__info">
                    <h3 class="cart-item__name">{item.title ?? item.productId}</h3>
                    <p class="cart-item__unit-price">
                      {item.unitPrice?.amount?.toLocaleString("fa-IR")} تومان
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", "align-items": "center", "margin-top": "0.5rem" }}>
                      <button
                        class="button--sm"
                        onClick={() => cartActions.updateQuantity(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        class="button--sm"
                        onClick={() => cartActions.updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    class="button--sm"
                    style={{ color: "var(--danger)" }}
                    onClick={() => cartActions.removeItem(item.productId)}
                  >
                    حذف
                  </button>
                </div>
              )}
            </For>
          </div>

          <div class="cart-summary">
            <h3 class="cart-summary__title">خلاصه سفارش</h3>
            <div class="cart-summary__row">
              <span>تعداد اقلام</span>
              <span>{store.cart.items.length}</span>
            </div>
            <div class="cart-summary__row cart-summary__row--total">
              <span>جمع</span>
              <span>{subtotal().toLocaleString("fa-IR") ?? "۰"} تومان</span>
            </div>
            <button
              class="button--primary button--block"
              style={{ "margin-top": "1rem" }}
              onClick={() => navigate("/checkout")}
            >
              ادامه و پرداخت
            </button>
            <button
              class="button--block"
              style={{ "margin-top": "0.5rem" }}
              onClick={() => cartActions.clear()}
            >
              خالی کردن سبد
            </button>
          </div>
        </div>
      </Show>
    </main>
  );
};

export default CartPage;
