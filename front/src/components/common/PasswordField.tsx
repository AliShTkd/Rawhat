// @ts-nocheck
// src/components/common/PasswordField.tsx
import { createSignal, type Component } from "solid-js";
import Input from "./Input";

interface PasswordFieldProps {
  name: string;
  label?: string;
  autocomplete?: string;
  value: string;
  onInput: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  required?: boolean;
}

const PasswordField: Component<PasswordFieldProps> = (props) => {
  const [show, setShow] = createSignal(false);

  return (
    <div class="password-field">
      <Input
        type={show() ? "text" : "password"}
        name={props.name}
        label={props.label}
        autocomplete={props.autocomplete}
        dir="ltr"
        value={props.value}
        onInput={props.onInput}
        onBlur={props.onBlur}
        error={props.error}
        required={props.required}
      />
      <button
        type="button"
        class="password-field__toggle"
        onClick={() => setShow((s) => !s)}
        aria-pressed={show()}
        aria-label={show() ? "مخفی کردن رمز" : "نمایش رمز"}
      >
        {show() ? "🙈" : "👁️"}
      </button>
    </div>
  );
};

export default PasswordField;
