import type { Component } from "solid-js";
interface Props { name: string; description?: string; }
const CategoryHeader: Component<Props> = (props) => (
  <header class="category-header">
    <h1>{props.name}</h1>
    {props.description && <p>{props.description}</p>}
  </header>
);
export default CategoryHeader;
