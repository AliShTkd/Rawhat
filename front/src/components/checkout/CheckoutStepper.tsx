import type { Component } from "solid-js";
interface Props { currentStep: number; steps: string[]; }
const CheckoutStepper: Component<Props> = (props) => (
  <nav class="checkout-stepper" aria-label="مراحل پرداخت">
    <ol>{props.steps.map((s, i) => (
      <li class={i <= props.currentStep ? "active" : ""}>{s}</li>
    ))}</ol>
  </nav>
);
export default CheckoutStepper;
