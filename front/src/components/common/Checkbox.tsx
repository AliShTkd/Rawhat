// Checkbox.tsx
import { Show, type Component, type JSX } from "solid-js";

export interface CheckboxProps {
  name: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  children: JSX.Element;
}

const Checkbox: Component<CheckboxProps> = (props) => {
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    props.onChange?.(target.checked);
  };

  return (
    <div class="checkbox">
      <label class="checkbox__label">
        <input
          class="checkbox__input"
          type="checkbox"
          name={props.name}
          checked={props.checked ?? false}
          disabled={props.disabled}
          required={props.required}
          onChange={handleChange}
          aria-invalid={props.error ? "true" : undefined}
        />
        <span class="checkbox__text">{props.children}</span>
      </label>
      <Show when={props.error}>
        <p class="checkbox__error" role="alert">{props.error}</p>
      </Show>
    </div>
  );
};

export default Checkbox;
