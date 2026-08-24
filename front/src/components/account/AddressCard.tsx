import type { Component } from "solid-js";
interface Props { address: any; onEdit?: () => void; onDelete?: () => void; }
const AddressCard: Component<Props> = (props) => (
  <div class="address-card">
    <p>{props.address.line1}, {props.address.city}</p>
    {props.onEdit && <button onClick={props.onEdit}>ویرایش</button>}
    {props.onDelete && <button onClick={props.onDelete}>حذف</button>}
  </div>
);
export default AddressCard;
