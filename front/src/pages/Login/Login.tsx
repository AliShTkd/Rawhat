// pages/Login/Login.tsx
import { createSignal, type Component, Show } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { useAuth } from "../../stores/userStore";

const Login: Component = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [formError, setFormError] = createSignal<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await auth.login({ email: email(), password: password() });
      navigate("/", { replace: true });
    } catch {
      setFormError("ایمیل یا رمز عبور نادرست است.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main class="login" aria-labelledby="login-title">
      <div class="login__card">
        <h1 class="login__title" id="login-title">ورود به حساب</h1>
        <p class="login__subtitle">برای ادامه، وارد حساب کاربری خود شوید.</p>

        <Show when={formError()}>
          <div class="login__alert" role="alert">{formError()}</div>
        </Show>

        <form class="login__form" onSubmit={handleSubmit} novalidate>
          <div class="input">
            <label class="input__label" for="email">ایمیل</label>
            <input
              id="email"
              class="input__field"
              type="email"
              dir="ltr"
              placeholder="email@example.com"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
            />
          </div>

          <div class="input">
            <label class="input__label" for="password">رمز عبور</label>
            <input
              id="password"
              class="input__field"
              type="password"
              dir="ltr"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
            />
          </div>

          <div class="login__row">
            <A class="login__forgot" href="/forgot-password">
              رمز عبور را فراموش کرده‌اید؟
            </A>
          </div>

          <button
            type="submit"
            class="button--primary button--block"
            disabled={submitting()}
          >
            {submitting() ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <p class="login__footer">
          حساب کاربری ندارید؟{" "}
          <A class="login__link" href="/register">ثبت‌نام</A>
        </p>
      </div>
    </main>
  );
};

export default Login;
