import type { Component } from "solid-js";
interface Props { onNext?: () => void; }
const AddressStep: Component<Props> = (props) => (
  <div class="checkout-step"><h2>آدرس ارسال</h2><button onClick={props.onNext}>مرحله بعد</button></div>
);
export default AddressStep;
