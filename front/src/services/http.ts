// src/services/http.ts

/**
 * http = سطحِ واژگانیِ شبکه — چهار شکرِ نازک روی request.
 *   apiClient → سیم (request، union، تله، FormData، credentials).
 *   http      → واژه‌ها (get/post/patch/del).
 * هر شش سرویس فقط http را می‌بیند؛ apiClient برایشان نامرئی است.
 */

import { request, type RequestOptions, type ApiResult } from "./apiClient";

export interface HttpOptions extends Omit<RequestOptions, "method" | "body"> {
  headers?: Record<string, string>;
  skipAuthTrap?: boolean;
}

export const http = {
  get<T>(path: string, opts?: HttpOptions): Promise<ApiResult<T>> {
    return request<T>(path, { ...opts, method: "GET" });
  },

  post<T>(path: string, body?: unknown, opts?: HttpOptions): Promise<ApiResult<T>> {
    return request<T>(path, { ...opts, method: "POST", body });
  },

  patch<T>(path: string, body?: unknown, opts?: HttpOptions): Promise<ApiResult<T>> {
    return request<T>(path, { ...opts, method: "PATCH", body });
  },

  del<T>(path: string, opts?: HttpOptions): Promise<ApiResult<T>> {
    return request<T>(path, { ...opts, method: "DELETE" });
  },
};
