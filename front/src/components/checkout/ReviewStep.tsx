import type { Component } from "solid-js";
interface Props { onConfirm?: () => void; }
const ReviewStep: Component<Props> = (props) => (
  <div class="checkout-step"><h2>بازبینی سفارش</h2><button onClick={props.onConfirm}>تأیید و پرداخت</button></div>
);
export default ReviewStep;
