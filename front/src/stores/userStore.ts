// src/stores/userStore.ts

import { createStore } from "solid-js/store";
import type { User } from "../types/user";
import type { AsyncState, ApiError } from "../types/api";

/**
 * وضعیتِ احرازِ هویت — ماشینِ حالتِ صریح.
 */
export type AuthStatus = "unknown" | "authenticated" | "anonymous";

interface UserState {
  user: User | null;
  status: AuthStatus;
  auth: AsyncState<User>;
}

const [state, setState] = createStore<UserState>({
  user: null,
  status: "unknown",
  auth: { status: "idle" },
});

// ── getters ──

export function getUserStore() {
  return state;
}

/** برای apiClient — فقط clearUser را برمی‌گرداند. */
let _clearUser: (() => void) | null = null;
export function getClearUser(): () => void {
  if (!_clearUser) _clearUser = () => setUserActions.clearUser();
  return _clearUser;
}

// ── actions ──

export const setUserActions = {
  setUser(user: User) {
    setState({
      user,
      status: "authenticated",
      auth: { status: "success", data: user },
    });
  },

  clearUser() {
    setState({
      user: null,
      status: "anonymous",
      auth: { status: "idle" },
    });
  },

  setAnonymous() {
    setState({ user: null, status: "anonymous" });
  },

  setAuthLoading() {
    setState("auth", (prev) => ({
      ...prev,
      status: "loading",
      error: undefined,
    }));
  },

  setAuthError(error: ApiError) {
    setState("auth", (prev) => ({
      ...prev,
      status: "error",
      data: prev.data,
      error,
    }));
  },

  setSaving() {
    setState("auth", (prev) => ({
      ...prev,
      status: "loading",
    }));
  },

  clearSaving() {
    setState("auth", (prev) => ({
      ...prev,
      status: "success",
    }));
  },

  setSaveError(error: ApiError) {
    setState("auth", (prev) => ({
      ...prev,
      status: "error",
      error,
    }));
  },
};

// ── compatibility shim (for Login.tsx useAuth) ──

export function useAuth() {
  return {
    get isAuthenticated() {
      return state.status === "authenticated";
    },
    get user() {
      return state.user;
    },
    get status() {
      return state.status;
    },
    get auth() {
      return state.auth;
    },
    get ready() {
      return state.status !== "unknown";
    },
    async login(credentials: { email: string; password: string }) {
      const { login } = await import("../services/authService");
      return login(credentials);
    },
    async logout() {
      const { logout } = await import("../services/authService");
      return logout();
    },
    async register(payload: any) {
      const { register } = await import("../services/authService");
      return register(payload);
    },
  };
}
