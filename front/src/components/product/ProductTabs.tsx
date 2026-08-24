import { createSignal, type Component, type JSX } from "solid-js";
interface Props { tabs: {id: string; label: string; content: JSX.Element}[]; }
const ProductTabs: Component<Props> = (props) => {
  const [active, setActive] = createSignal(0);
  return (
    <div class="product-tabs">
      <div class="product-tabs__nav">{props.tabs.map((t, i) => (
        <button class={active() === i ? "active" : ""} onClick={() => setActive(i)}>{t.label}</button>
      ))}</div>
      <div class="product-tabs__content">{props.tabs[active()]?.content}</div>
    </div>
  );
};
export default ProductTabs;
