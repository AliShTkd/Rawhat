// EmptyState.tsx
import { Show, type Component, type JSX } from "solid-js";

export interface EmptyStateProps {
  title?: string;
  message?: string;           // alias used by NotFoundState / pages
  description?: string;
  icon?: JSX.Element;
  action?: JSX.Element;
  actionHref?: string;        // convenience: wraps in <a>
  actionLabel?: string;
}

const EmptyState: Component<EmptyStateProps> = (props) => {
  const displayTitle = () => props.title ?? props.message ?? "";
  const displayDesc = () => props.description;

  return (
    <div class="empty-state" role="status">
      <Show when={props.icon}>
        <div class="empty-state__icon" aria-hidden="true">
          {props.icon}
        </div>
      </Show>

      <Show when={displayTitle() || displayDesc()}>
        <div class="empty-state__content">
          <Show when={displayTitle()}>
            <h2 class="empty-state__title">{displayTitle()}</h2>
          </Show>
          <Show when={displayDesc()}>
            <p class="empty-state__description">{displayDesc()}</p>
          </Show>
        </div>
      </Show>

      <Show when={props.actionHref && props.actionLabel}>
        <div class="empty-state__action">
          <a class="empty-state__link" href={props.actionHref}>
            {props.actionLabel}
          </a>
        </div>
      </Show>

      <Show when={props.action}>
        <div class="empty-state__action">{props.action}</div>
      </Show>
    </div>
  );
};

export default EmptyState;
