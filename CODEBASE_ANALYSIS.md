# Atelier Webapp — Codebase Analysis & Restructuring Guide

## 1. Current State Summary

### Origin
The project was scaffolded from a **v0.app** template (visible in `metadata.generator: 'v0.app'` and `package.json` name `"my-v0-project"`). It's a Next.js 15.2.6 app with React 19, Tailwind CSS 3, and shadcn/ui (new-york style).

### Stack
| Layer | Current |
|---|---|
| Framework | Next.js 15.2.6 (App Router) |
| React | 19.x |
| Styling | Tailwind CSS 3.4.17 + `tailwindcss-animate` |
| Component lib | shadcn/ui (new-york) via Radix primitives |
| Charts | Plotly (CDN script, `plotly-basic-2.35.2`) + Recharts 2.15.4 (unused) |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Theming | next-themes (imported but **not wired** in layout) |
| Package manager | pnpm |
| TypeScript | 5.x, strict mode, `ignoreBuildErrors: true` in next.config |

### Routing Architecture
The app uses Next.js App Router, but **does not use file-system routing at all**. `app/page.tsx` is a monolithic `"use client"` component that renders a sidebar + conditional section rendering via `useState`:

```
activeSection === "overview" → <CommandCenterPage />
activeSection === "model"    → <ModelPage />
activeSection === "agents"   → <AgentNetworkPage />
...
```

Each "page" under `app/*/page.tsx` is imported as a **regular component** — they are never navigated to via Next.js routing. The `loading.tsx` files are dead code.

---

## 2. Template Remnants (Must Remove/Replace)

### Spy/Military Theme Content
The v0 template generated a "Tactical Operations Dashboard" with spy-agency theming. These pages are **100% placeholder** with hardcoded dummy data:

| Page | Content | Status |
|---|---|---|
| `command-center/page.tsx` | Agent allocations, spy activity logs, encrypted chat, mission charts | **Entirely template — replace** |
| `agent-network/page.tsx` | Spy agent roster (VENGEFUL SPIRIT, OBSIDIAN SENTINEL, etc.) | **Entirely template — replace** |
| `operations/page.tsx` | Military operations (SHADOW PROTOCOL, GHOST FIRE, etc.) | **Entirely template — replace** |
| `intelligence/page.tsx` | Intelligence reports (TOP SECRET, HUMINT, etc.) | **Entirely template — replace** |
| `systems/page.tsx` | Server infrastructure monitoring | **Entirely template — replace** |
| `model/page.tsx` | Hawkes process model dashboard | **YOUR content — keep and evolve** |

### Template Artifacts to Clean
- `package.json` → name is `"my-v0-project"` (rename to `"atelier-webapp"`)
- `layout.tsx` → metadata title is `"Tactical Operations Dashboard"`, generator is `v0.app`
- `layout.tsx` → `lang="es"` (Spanish) — intentional?
- `public/placeholder-*` files — template placeholder images
- `styles/globals.css` — duplicate of `app/globals.css`, unused
- `hooks/use-mobile.ts` + `hooks/use-toast.ts` — duplicated in `components/ui/use-mobile.tsx` + `components/ui/use-toast.ts`
- `@vercel/analytics` dependency — remove unless deploying on Vercel
- `recharts` dependency — imported in package.json but never used in any component

---

## 3. Structural Problems

### 3.1 No Real Routing
The entire app is a single client-side page with tab-switching via `useState`. This means:
- No URL-based navigation (no deep linking, no browser back/forward)
- No code splitting — all pages are bundled together
- No SSR/streaming benefits from App Router
- Loading states (`loading.tsx`) have no effect

### 3.2 TypeScript Build Errors Suppressed
```js
// next.config.mjs
typescript: { ignoreBuildErrors: true }
```
This hides potentially real type errors. Several components use `any` types and untyped parameters (e.g., `operations/page.tsx` functions take untyped `status`, `priority` params).

### 3.3 Plotly via CDN Script Tag
```tsx
<Script src="https://cdn.plot.ly/plotly-basic-2.35.2.min.js" strategy="beforeInteractive" />
```
Then accessed via `(window as any).Plotly`. This is fragile:
- No types
- Race condition potential (component renders before script loads)
- Blocks initial page load (`beforeInteractive`)
- No tree shaking

### 3.4 Massive Inline Data
`model/page.tsx` is **1,435 lines** with all data, SVG chart components, and UI in one file. The inline data arrays (intensity series, event timestamps, branching matrix, forecast data, failure events) should be separated.

### 3.5 Unused shadcn/ui Components
~58 component files in `components/ui/`, many never imported by any page. A quick audit shows at least 30+ are unused (carousel, calendar, drawer, menubar, navigation-menu, etc.).

### 3.6 Theme Provider Not Wired
`components/theme-provider.tsx` exists but is never used in `layout.tsx`. The app hardcodes dark mode via `bg-black text-white` on `<body>`.

---

## 4. Recommended Directory Structure

```
atelier-webapp/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Redirect to /markets or landing
│   ├── globals.css
│   ├── (dashboard)/            # Route group for authenticated dashboard
│   │   ├── layout.tsx          # Dashboard shell (sidebar + toolbar)
│   │   ├── markets/
│   │   │   └── page.tsx
│   │   ├── model/
│   │   │   └── page.tsx
│   │   ├── agents/
│   │   │   └── page.tsx
│   │   ├── jobs/
│   │   │   └── page.tsx
│   │   ├── logs/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
├── components/
│   ├── ui/                     # shadcn primitives (pruned)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── toolbar.tsx
│   │   └── breadcrumb-nav.tsx
│   ├── charts/
│   │   ├── plotly-chart.tsx
│   │   ├── sparkline.tsx
│   │   ├── step-chart.tsx
│   │   └── forecast-chart.tsx
│   └── model/                  # Domain-specific components
│       ├── parameter-panel.tsx
│       ├── estimation-results.tsx
│       ├── diagnostics-panel.tsx
│       ├── failure-log.tsx
│       └── event-stream.tsx
├── lib/
│   ├── utils.ts
│   ├── api/
│   │   ├── client.ts           # API client (fetch wrapper / axios)
│   │   ├── types.ts            # API response types
│   │   └── endpoints.ts        # Endpoint constants
│   └── hooks/
│       ├── use-api.ts          # Generic data fetching hook
│       ├── use-model.ts        # Model-specific hooks
│       └── use-mobile.ts
├── types/
│   ├── model.ts                # Hawkes model types
│   ├── market.ts               # Market data types
│   └── api.ts                  # API envelope types
├── config/
│   └── navigation.ts           # Sidebar nav items
```

### Key Principles
1. **Route group `(dashboard)/`** — encapsulates all dashboard pages under a shared layout with sidebar/toolbar, while allowing future non-dashboard routes (login, landing, etc.)
2. **Extract layout components** — sidebar and toolbar become reusable components in the dashboard layout
3. **Domain component folders** — group by feature (model/, charts/) not by type
4. **Centralized API layer** — `lib/api/` becomes the single point of contact for your future REST API
5. **Type definitions** — separate `types/` directory for shared domain types

---

## 5. Dependency Recommendations

### Remove
| Package | Reason |
|---|---|
| `recharts` | Never used — you're using Plotly |
| `@vercel/analytics` | Remove unless Vercel-deployed |
| `react-day-picker` + `date-fns` | Only used by shadcn Calendar (unused) |
| `embla-carousel-react` | Only used by shadcn Carousel (unused) |
| `input-otp` | Only used by shadcn InputOTP (unused) |
| `react-resizable-panels` | Only used by shadcn Resizable (unused) |
| `vaul` | Only used by shadcn Drawer (unused) |
| `cmdk` | Only used by shadcn Command (unused) — re-add if you build a command palette |
| `sonner` | Only used by shadcn Sonner (unused) — re-add when you need toasts |

### Update / Replace
| Package | Action |
|---|---|
| Plotly CDN → `plotly.js-basic-dist` | Install as npm dep, import properly with types |
| `tailwindcss` 3.x → 4.x | Tailwind 4 is stable; note: the config comment says "v3 as interim" |

### Add
| Package | Purpose |
|---|---|
| `@tanstack/react-query` | Server state management, caching, refetching for API calls |
| `plotly.js-basic-dist` + `@types/plotly.js` | Typed Plotly, bundled properly |
| `zod` (already present) | Use for API response validation |
| `nuqs` or manual `useSearchParams` | URL state for dashboard filters |

### Optional (Consider Later)
| Package | Purpose |
|---|---|
| `@tanstack/react-table` | If you need sortable/filterable data tables |
| `zustand` | Lightweight client state if React context gets unwieldy |
| `next-safe-action` | Type-safe server actions for mutations |
| `msw` | API mocking during development before your backend exists |

---

## 6. API Integration Architecture

Since your REST API doesn't exist yet, you want to build the frontend in a way that's easy to wire up later. Here's the approach:

### 6.1 API Client (`lib/api/client.ts`)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: { page: number; total: number };
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }
  return res.json();
}
```

### 6.2 React Query Integration

```typescript
// lib/hooks/use-model.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { HawkesModelResult } from "@/types/model";

export function useModelFit(params: ModelParams) {
  return useMutation({
    mutationFn: () =>
      apiFetch<HawkesModelResult>("/api/v1/model/fit", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  });
}

export function useModelResults(runId: string) {
  return useQuery({
    queryKey: ["model", "results", runId],
    queryFn: () => apiFetch<HawkesModelResult>(`/api/v1/model/runs/${runId}`),
    enabled: !!runId,
  });
}
```

### 6.3 Mock Data Strategy

While your API doesn't exist, extract current inline data into `lib/mock/` files and use them as the default return values. When the API is ready, you just swap the data source:

```typescript
// lib/mock/model-data.ts
export const MOCK_INTENSITY_SERIES = [0.42, 0.45, ...];
export const MOCK_BRANCHING_MATRIX = [[0.27, 0.15, 0.04], ...];

// In components, during development:
const { data } = useModelResults(runId) ?? { data: MOCK_MODEL_RESULT };
```

### 6.4 Suggested API Shape (for when you build the backend)

```
GET  /api/v1/markets                    → Market overview data
GET  /api/v1/markets/{pair}/events      → Event stream (paginated, SSE for live)
POST /api/v1/model/fit                  → Trigger Hawkes fit
GET  /api/v1/model/runs/{id}            → Fetch fit results
GET  /api/v1/model/runs/{id}/forecast   → Forecast data
GET  /api/v1/model/runs/{id}/diagnostics→ Residuals, branching matrix, etc.
GET  /api/v1/jobs                       → Pipeline job listing
GET  /api/v1/jobs/{id}/logs             → Job logs (streaming)
GET  /api/v1/system/health              → System health metrics
```

---

## 7. Migration Sequence (Suggested Order)

1. **Rename & clean metadata** — package.json name, layout metadata, remove `v0.app` generator
2. **Enable proper TypeScript** — remove `ignoreBuildErrors: true`, fix type errors
3. **Prune unused deps & components** — remove unused shadcn components and their associated deps
4. **Extract layout** — move sidebar/toolbar into `(dashboard)/layout.tsx`, enable real App Router routing
5. **Extract chart components** — pull Sparkline, StepChart, ForecastChart, FailureTimeline out of `model/page.tsx` into `components/charts/`
6. **Extract data** — move all inline mock data to `lib/mock/`
7. **Install Plotly properly** — replace CDN with npm package
8. **Install React Query** — set up QueryClientProvider
9. **Build API client** — `lib/api/client.ts` with typed fetch wrapper
10. **Wire hooks** — create domain-specific hooks that use mock data initially
11. **Replace template pages** — one by one, replace spy-themed pages with quant domain content
12. **Add URL state** — deep linking for active tab, model run ID, etc.

---

## 8. Quick Wins (Low Effort, High Impact)

- **Fix `package.json` name** → `"atelier-webapp"`
- **Fix layout metadata** → title: `"Atelier | IteraLabs"`, remove generator
- **Fix `lang` attribute** → `"en"` unless Spanish is intended
- **Delete `styles/globals.css`** → duplicate, unused
- **Delete loading.tsx files** → currently no-ops
- **Remove duplicate hooks** → keep either `hooks/` or `components/ui/` versions
- **Add `.env.local.example`** → document `NEXT_PUBLIC_API_URL`
