import type { Component } from "solid-js";
interface Props { value?: string; onChange?: (v: string) => void; options?: {value: string; label: string}[]; }
const SortSelect: Component<Props> = (props) => (
  <select class="sort-select" value={props.value} onChange={(e) => props.onChange?.(e.currentTarget.value)}>
    {(props.options ?? []).map(o => <option value={o.value}>{o.label}</option>)}
  </select>
);
export default SortSelect;
