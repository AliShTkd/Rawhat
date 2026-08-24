// ErrorState.tsx
import { Show, type Component, type JSX } from "solid-js";

export interface ErrorStateProps {
  title?: string;
  message?: string;           // alias used by pages
  description?: string;
  icon?: JSX.Element;
  action?: JSX.Element;
  actionHref?: string;        // convenience: wraps in <a>
  actionLabel?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const ErrorState: Component<ErrorStateProps> = (props) => {
  const displayTitle = () => props.title ?? props.message ?? "مشکلی پیش آمد";
  const displayDesc = () =>
    props.description ??
    "در دریافت اطلاعات خطایی رخ داد. لطفاً دوباره تلاش کنید.";

  return (
    <div class="error-state" role="alert" aria-live="assertive">
      <Show when={props.icon}>
        <div class="error-state__icon" aria-hidden="true">
          {props.icon}
        </div>
      </Show>

      <div class="error-state__content">
        <h2 class="error-state__title">{displayTitle()}</h2>
        <p class="error-state__description">{displayDesc()}</p>
      </div>

      <Show when={props.onRetry || props.action || props.actionHref}>
        <div class="error-state__actions">
          <Show when={props.onRetry}>
            <button
              class="error-state__retry"
              type="button"
              onClick={() => props.onRetry?.()}
            >
              {props.retryLabel ?? "تلاش دوباره"}
            </button>
          </Show>

          <Show when={props.actionHref && props.actionLabel}>
            <a class="error-state__link" href={props.actionHref}>
              {props.actionLabel}
            </a>
          </Show>

          <Show when={props.action}>
            <div class="error-state__extra-action">{props.action}</div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default ErrorState;
