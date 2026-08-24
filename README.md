# Rawhat
Root files (5)

File	Framework	Notes
src/App.tsx	✅ Solid.js	onMount, lazy, Suspense, Router from @solidjs/router
src/index.tsx	✅ Solid.js	render from solid-js/web
src/routes.tsx	✅ Solid.js	lazy, Route
src/constants.ts	✅ Pure TS	No framework, just constants
src/config.ts	✅ Pure TS	Reads import.meta.env

Services (10)

File	Framework	Notes
cartService.ts	✅ Solid.js	Imports from solid-js/store via cartStore
apiClient.ts	✅ Pure TS	fetch wrapper, no framework
userService.ts	✅ Solid.js	Imports userStore actions
orderService.ts	✅ Solid.js	Imports orderStore, cartStore
wishlistService.ts	✅ Solid.js	Imports wishlistStore
categories.ts	✅ Pure TS	Uses http service
authService.ts	✅ Solid.js	Imports userStore actions
productService.ts	✅ Solid.js	Imports productStore actions
http.ts	✅ Pure TS	Thin wrapper over apiClient
search.ts	✅ Pure TS	Uses http service


Stores (6) — All use createStore from solid-js/store ✅

cartStore.ts, filterStore.ts, orderStore.ts, productStore.ts, userStore.ts, wishlistStore.ts
Components (69) — All use Solid.js primitives: Show, For, createSignal, createMemo, createEffect, type Component, Dynamic, Portal, splitProps, createUniqueId, etc. ✅

Pages (25) — All use Solid.js + @solidjs/router + @solidjs/meta: createResource, useParams, useSearchParams, useNavigate, A, Title, Meta ✅

Utils (3), Types (11), API (2) — Pure TypeScript, perfectly compatible ✅

