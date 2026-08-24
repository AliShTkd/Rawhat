// src/App.tsx

import { lazy, Suspense, onMount } from "solid-js";
import { Router, Route } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { fetchCurrentUser } from "./services/authService";
import { loadCart } from "./services/cartService";
import { loadWishlist } from "./services/wishlistService";
import MainLayout from "./components/layout/MainLayout";

// ── lazy pages ──
const HomePage = lazy(() => import("./pages/Home/Home"));
const ProductsPage = lazy(() => import("./pages/Products/Products"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetails/ProductDetails"));
const CartPage = lazy(() => import("./pages/Cart/Cart"));
const CheckoutPage = lazy(() => import("./pages/Checkout/Checkout"));
const LoginPage = lazy(() => import("./pages/Login/Login"));
const RegisterPage = lazy(() => import("./pages/Register/Register"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistory/OrderHistory"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetails/OrderDetails"));
const AccountPage = lazy(() => import("./pages/Account/Account"));
const WishlistPage = lazy(() => import("./pages/Wishlist/Wishlist"));
const SearchPage = lazy(() => import("./pages/Search/Search"));
const CategoryPage = lazy(() => import("./pages/Category/Category"));
const NotFoundPage = lazy(() => import("./pages/NotFound/NotFound"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPassword/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword/ResetPassword"));

function PageSpinner() {
  return (
    <div class="page-spinner" aria-label="در حال بارگذاری">
      <div class="page-spinner__circle" />
    </div>
  );
}

function App() {
  onMount(() => {
    fetchCurrentUser();
    loadCart();
    loadWishlist();
  });

  return (
    <MetaProvider>
      <Router>
        <Suspense fallback={<PageSpinner />}>
          {/* Root layout route — gives Header/Footer access to <A> context */}
          <Route path="/" component={MainLayout}>
            {/* ── specific routes ── */}
            <Route path="/products" component={ProductsPage} />
            <Route path="/products/:slug" component={ProductDetailsPage} />
            <Route path="/product/:slug" component={ProductDetailsPage} />
            <Route path="/cart" component={CartPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            <Route path="/reset-password" component={ResetPasswordPage} />
            <Route path="/search" component={SearchPage} />
            <Route path="/category/:slug" component={CategoryPage} />
            <Route path="/checkout" component={CheckoutPage} />
            <Route path="/account" component={AccountPage} />
            <Route path="/orders" component={OrderHistoryPage} />
            <Route path="/orders/:id" component={OrderDetailsPage} />
            <Route path="/wishlist" component={WishlistPage} />
            {/* ── home and catch-all last ── */}
            <Route path="/" component={HomePage} />
            <Route path="*" component={NotFoundPage} />
          </Route>
        </Suspense>
      </Router>
    </MetaProvider>
  );
}

export default App;
