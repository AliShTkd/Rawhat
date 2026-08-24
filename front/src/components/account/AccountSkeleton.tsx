import type { Component } from "solid-js";
const AccountSkeleton: Component = () => (
  <div class="account-skeleton" aria-hidden="true">
    <div class="account-skeleton__avatar" />
    <div class="account-skeleton__lines">
      <div /><div /><div />
    </div>
  </div>
);
export default AccountSkeleton;
