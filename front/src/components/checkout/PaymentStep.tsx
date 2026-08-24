import type { Component } from "solid-js";
interface Props { onNext?: () => void; }
const PaymentStep: Component<Props> = (props) => (
  <div class="checkout-step"><h2>پرداخت</h2><button onClick={props.onNext}>مرحله بعد</button></div>
);
export default PaymentStep;
