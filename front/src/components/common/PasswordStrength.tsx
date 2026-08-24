import type { Component } from "solid-js";
const PasswordStrength: Component<{ password: string }> = (props) => (
  <div class="password-strength" aria-live="polite">
    {props.password.length >= 8 ? "强度 قوی" : "强度 ضعیف"}
  </div>
);
export default PasswordStrength;
