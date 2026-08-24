import type { Component } from "solid-js";
interface Props { onNext?: () => void; }
const ShippingStep: Component<Props> = (props) => (
  <div class="checkout-step"><h2>روش ارسال</h2><button onClick={props.onNext}>مرحله بعد</button></div>
);
export default ShippingStep;
