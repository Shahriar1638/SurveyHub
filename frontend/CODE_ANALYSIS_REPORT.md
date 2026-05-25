# SurveyHub Frontend — Deep Code Analysis Report

**Date:** May 19, 2026  
**Scope:** `frontend/src/` — all 47 files  
**Tech Stack:** React 19, React Router v7, TanStack Query v5, Motion (Framer Motion fork), GSAP, AOS, Firebase, Axios, Tailwind CSS v4

---

## 1. Directory Tree

```
frontend/src/
├── API/                                          (empty directory)
├── assets/
│   ├── entertainment.jpg
│   ├── google.png
│   ├── howitworks.jpg
│   ├── laptop on a table 2.jpg
│   ├── laptop on desk.jpg
│   ├── logo.png
│   ├── logo.svg
│   ├── statistics paper on table.png
│   └── technology.jpg
├── Components/
│   ├── Shared/
│   │   ├── Footer.jsx                            (103 lines)
│   │   └── Navbar.jsx                            (407 lines)
│   ├── Surveys/
│   │   ├── CheckboxQuestion.jsx                  (75 lines)
│   │   ├── LinearScale.jsx                       (32 lines)
│   │   ├── MultipleChoice.jsx                    (35 lines)
│   │   ├── Paragraph.jsx                         (12 lines)
│   │   ├── QuestionRenderer.jsx                  (27 lines)
│   │   ├── ShortAnswer.jsx                       (12 lines)
│   │   └── SurveyFeedback.jsx                    (169 lines)
│   └── UI/
│       ├── BlogCard.jsx                          (198 lines)
│       ├── Button.jsx                            (55 lines)
│       ├── Card.jsx                              (34 lines)
│       ├── PageTransition.jsx                    (15 lines)
│       ├── StatCard.jsx                          (57 lines)
│       └── SurveyCard.jsx                        (82 lines)
├── Firebase/
│   └── firebase.config.js                        (20 lines)
├── Firebase_AuthProvider/
│   └── AuthProvider.jsx                          (79 lines)
├── Hooks/
│   ├── useAxiosPublic.jsx                        (10 lines)
│   ├── useAxiosSecure.jsx                        (51 lines)
│   ├── useBlogs.jsx                              (83 lines)
│   ├── useProfile.jsx                            (23 lines)
│   ├── useProfileData.jsx                        (39 lines)
│   ├── useSurveyDetail.jsx                       (83 lines)
│   └── useSurveys.jsx                            (32 lines)
├── Layout/
│   └── MainLayout.jsx                            (15 lines)
├── Pages/
│   ├── Auth/
│   │   ├── Login.jsx                             (217 lines)
│   │   └── SignUp.jsx                            (355 lines)
│   ├── Blogs/
│   │   ├── BlogDetailPage.jsx                    (548 lines)
│   │   └── BlogsPage.jsx                         (194 lines)
│   ├── Feedback/
│   │   └── FeedbackPage.jsx                      (715 lines)
│   ├── Home/
│   │   ├── AdminHome.jsx                         (436 lines)
│   │   ├── GuestHome.jsx                         (544 lines)
│   │   ├── Home.jsx                              (49 lines)
│   │   ├── SurveyorHome.jsx                      (453 lines)
│   │   └── UserHome.jsx                          (239 lines)
│   ├── Payment/
│   │   ├── PaymentSuccessPage.jsx                (145 lines)
│   │   └── PricingPage.jsx                       (378 lines)
│   ├── Profile/
│   │   ├── AdminProfile.jsx                      (236 lines)
│   │   ├── ProfilePage.jsx                       (434 lines)
│   │   ├── SurveyorProfile.jsx                   (136 lines)
│   │   └── UserProfile.jsx                       (141 lines)
│   └── Surveys/
│       ├── SurveyDetailPage.jsx                  (623 lines)
│       └── SurveysPage.jsx                       (746 lines)
├── Router/
│   ├── AdminRoute.jsx                            (24 lines)
│   ├── PrivateRoute.jsx                          (16 lines)
│   ├── Routes.jsx                                (81 lines)
│   ├── SurveyorRoute.jsx                         (24 lines)
│   └── UserRoute.jsx                             (25 lines)
├── index.css                                     (1318 lines)
└── main.jsx                                      (19 lines)
```

**Total: 47 source files, ~7,400 lines of code**

---

## 2. File-by-File Analysis

### 2.1 `main.jsx` (19 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 9 | `QueryClient` instantiated with zero config — no default staleTime, gcTime, or retry policy | Pass defaultOptions: `{ queries: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30, retry: 1 }, mutations: { retry: 0 } }` |
| 2 | Medium | 11-18 | No `Suspense` boundary wrapping the app — all loading states handled manually per-page | Wrap `<RouterProvider>` in `<Suspense fallback={<LoadingSpinner />}>` for route-level suspense |
| 3 | Low | 9 | `queryClient` is a module-level singleton — fine for SPA but breaks SSR if ever needed | Acceptable for current SPA; document this decision |

### 2.2 `index.css` (1318 lines) — ✅ Fixed 

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Low | 102-181 | Duplicate tokens between `@theme` block (lines 14-96) and `:root` (lines 102-181) — Tailwind v4 `@theme` already exposes CSS variables; `:root` block is redundant | Remove `:root` block entirely; `@theme` in Tailwind v4 generates CSS variables automatically |
| 2 | Low | 1 | References `DESIGN_v2.md` — ensure this file exists and is maintained | Verify design doc exists at `.agents/design/DESIGN_v2.md` |

**Assessment:** Excellent design system. Comprehensive utility classes, proper semantic tokens, reduced-motion support, custom scrollbar, focus-visible. One of the strongest parts of the codebase.

### 2.3 `Router/Routes.jsx` (81 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **High** | 1-14 | **All routes use static imports** — zero code splitting. Every page is bundled into the initial JS payload | Use `React.lazy()` for every page component: `const Home = lazy(() => import("../Pages/Home/Home"))` |
| 2 | **High** | 16-79 | **No Suspense boundaries** around lazy-loaded routes — will crash if lazy is used | Wrap route elements in `<Suspense fallback={<PageSkeleton />}>` or use `errorElement` for error boundaries |
| 3 | Medium | 35 | `/surveys/:id` is not protected by `PrivateRoute` — guest can view survey detail (intentional?) | If intentional, document. If not, wrap in `<PrivateRoute>` |
| 4 | Medium | 47-48 | `/feedback` and `/blogs` are public — correct for guest access | No change needed |
| 5 | Medium | 16 | Variable named `Router` shadows the library name — confusing | Rename to `router` or `browserRouter` |
| 6 | Low | 59 | `/pricing` route exists but no corresponding route in Navbar's `GUEST_LINKS` — "Pricings" typo in nav | Fix typo: "Pricings" → "Pricing" in Navbar.jsx line 28, 37 |

### 2.4 `Router/PrivateRoute.jsx` (16 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 9 | Returns `null` during loading — causes flash of empty content | Return a `<LoadingSpinner />` or skeleton instead of `null` |
| 2 | Low | 12 | Redirects to `/` with `state.from` — good pattern | No change needed |

### 2.5 `Router/AdminRoute.jsx`, `SurveyorRoute.jsx`, `UserRoute.jsx` (24-25 lines each)

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 10 (all) | Returns `null` during dual loading (auth + profile) | Return loading skeleton |
| 2 | Low | 8 | `isPending` renamed to `profileLoading` — inconsistent naming | Rename to `isProfilePending` for consistency with TanStack Query conventions |
| 3 | Low | All | These routes are defined but **never used in Routes.jsx** — dead code | Either add them to Routes.jsx or remove them |

### 2.6 `Firebase/firebase.config.js` (20 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Low | 9-14 | Uses `import.meta.env.VITE_*` — correct for Vite | No change needed |

### 2.7 `Firebase_AuthProvider/AuthProvider.jsx` (79 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **High** | 46-61 (❌Skipped for now) | JWT token stored in `localStorage` — vulnerable to XSS attacks | Consider `httpOnly` cookie approach, or at minimum document the XSS risk and implement CSP headers |
| 2 | Medium | 23-26, 28-31, 33-36, 39-42 | Auth functions set `loading(true)` but Firebase auth methods return promises that may reject — loading state may stay true on error | Add `.catch(() => setLoading(false))` to each auth function |
| 3 | Medium | 50 | Token key `"access-token"` is hardcoded string | Extract to constant: `export const TOKEN_KEY = "access-token"` |
| 4 | Low | 66-73 | `authInfo` object recreated every render — causes all consumers to re-render | Wrap in `useMemo`: `const authInfo = useMemo(() => ({...}), [user, loading])` |

### 2.8 `Hooks/useAxiosPublic.jsx` (10 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 3-5 | `axios.create()` called at module scope — creates singleton that persists across HMR | Move inside hook or accept as fine for production builds |
| 2 | Low | 6-8 | Hook returns same instance every time — could just export the instance directly | Acceptable pattern; no change needed |

### 2.9 `Hooks/useAxiosSecure.jsx` (51 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **High** | 14-46 | **Interceptors registered inside `useEffect`** — every component that calls this hook adds new interceptors to the same axios instance, then ejects on unmount. If multiple components mount simultaneously, interceptors stack and fire multiple times | Move interceptor setup to module scope (outside the hook), or use a ref-based approach to ensure single registration |
| 2 | Medium | 17 | Token read from `localStorage` on every request — blocks main thread | Cache token in a ref, update it via the effect when auth changes |
| 3 | Medium | 34-37 | On 401/403, calls `logOut()` then `navigate("/login")` — but `logOut()` is async and may not complete before navigation | Add `await` before navigate, or handle in the auth state listener |

### 2.10 `Hooks/useBlogs.jsx` (83 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 11 | `queryKey: ["blogs"]` — infinite query key doesn't include `limit` param — different limit values share the same cache | Change to `["blogs", limit]` |
| 2 | Low | 20 | `staleTime: 1000 * 60 * 3` — good | No change |
| 3 | Medium | 57-61 | `useBlogReact` invalidates both `["blog", id]` and `["blogs"]` — invalidating the entire blogs list is expensive for infinite query | Use `queryClient.setQueryData` for optimistic update instead of full invalidation |
| 4 | Low | 44-62 | No optimistic update for reactions — user sees delay | Add `onMutate` with optimistic update pattern |
| 5 | Medium | 67-82 | `useBlogComment` has no error handling in `onError` callback | Add `onError` to show toast notification |

### 2.11 `Hooks/useProfile.jsx` (23 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 11 | Query key `[user?.email, "profile"]` — order should be `["profile", user?.email]` for consistent grouping | Reorder to `["profile", user?.email]` |
| 2 | Medium | 12 | `enabled` checks `localStorage.getItem("access-token")` — couples hook to implementation detail | Remove localStorage check; rely on `user?.email` only |
| 3 | Low | 13-14 | Good staleTime/gcTime values | No change |

### 2.12 `Hooks/useProfileData.jsx` (39 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 12 | Query key `[user?.email, "profile-stats"]` — same ordering issue as useProfile | Reorder to `["profile-stats", user?.email]` |
| 2 | Medium | 35-36 | Invalidates with `[user?.email, "profile"]` — must match the actual query key format | Fix to match reordered keys |

### 2.13 `Hooks/useSurveyDetail.jsx` (83 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Low | 12 | `queryKey: ["survey", id]` — good | No change |
| 2 | Low | 29 | `queryKey: ["survey-response", surveyId, userId]` — good | No change |
| 3 | Medium | 70-82 | `useSubmitSurveyFeedback` has no `onError` handler | Add error callback |
| 4 | Low | All | Good mutation patterns with proper invalidation | No change |

### 2.14 `Hooks/useSurveys.jsx` (32 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 14 | Query key spreads all filter params as individual elements — works but verbose. When `filters` object changes reference, every param re-triggers | Consider `queryKey: ["surveys", JSON.stringify(filters)]` or use a stable filter object |
| 2 | Low | 15 | `staleTime: 5 minutes` — appropriate for survey listing | No change |
| 3 | Low | 8 | No `enabled` option — always fires even without filters | Acceptable; filters have defaults |

### 2.15 `Layout/MainLayout.jsx` (15 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 7 | Uses `bg-[--color-bg-primary]` — this CSS variable **does not exist** in index.css. Should be `bg-[--color-bg-base]` | Change to `bg-[--color-bg-base]` |

### 2.16 `Components/UI/Button.jsx` (55 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Low | 15-23 | Good component — uses design system classes, supports loading state | No change |
| 2 | Low | 29-33 | Properly forwards `...props` via spread | No change |

### 2.17 `Components/UI/Card.jsx` (34 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Low | All | Clean, well-structured, uses design system classes | No change |

### 2.18 `Components/UI/SurveyCard.jsx` (82 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 12-24 | Hardcoded status logic with inline style objects — should use `survey-card-band` class from index.css | Replace inline status band (lines 28-33) with `<div className="survey-card-band published" />` using conditional class |
| 2 | Low | 3 | Props are well-documented | No change |

### 2.19 `Components/UI/BlogCard.jsx` (198 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 52 | Dynamic Tailwind class `w-${size} h-${size}` — **Tailwind cannot tree-shake dynamic class names**. Will not work as expected | Use a size map object: `const sizeMap = { 7: "w-7 h-7", 8: "w-8 h-8", 9: "w-9 h-9", 10: "w-10 h-10" }` |
| 2 | Medium | 58 | Same issue with `w-${size} h-${size}` in fallback avatar | Same fix as above |
| 3 | Medium | 109 | `Object.values(blog.reactionCounts || {}).reduce(...)` computed on every render — wrap in `useMemo` | Memoize: `const totalReactions = useMemo(() => ..., [blog.reactionCounts])` |
| 4 | Medium | 110-111 | `readTime` and `excerpt` computed on every render | Memoize or compute outside component |
| 5 | Low | 114-117 | Motion animation with `index`-based delay — good for staggered lists | No change |

### 2.20 `Components/UI/StatCard.jsx` (57 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 11-12 | Dynamic CSS variable construction `var(--color-${roleAccent}-light)` — works in CSS but is fragile | Acceptable; CSS variable interpolation works at runtime |
| 2 | Low | All | Clean component using design system | No change |

### 2.21 `Components/UI/PageTransition.jsx` (15 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Low | All | Simple, clean wrapper | No change |

### 2.22 `Components/Shared/Navbar.jsx` (407 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **High** | 10 | **Direct `axios` import** instead of using `useAxiosPublic` hook — bypasses interceptors and baseURL configuration | Replace with `useAxiosPublic()` hook |
| 2 | **High** | 109-118 | Credit balance fetched with raw `axios.get()` — same issue, and **no error handling** (empty `.catch(() => {})`) | Use `useAxiosSecure` or `useAxiosPublic`, add proper error handling |
| 3 | Medium | 121-126 | `getLinks()` and `getRoleAccent()` are plain functions called on every render — should be `useMemo` | Wrap in `useMemo` or compute inline |
| 4 | Medium | 143-145 | Inline `style` with `color-mix()` — could be a CSS variable | Add `--color-navy-mixed` to @theme and use `bg-[--color-navy-mixed]` |
| 5 | Medium | 28, 37 | Typo: "Pricings" should be "Pricing" | Fix to "Pricing" |
| 6 | Low | 51-96 | `RoleIndicator` declared outside component — good for performance | No change |
| 7 | Low | 103 | `creditBalance` state could be derived from a custom hook | Consider extracting to `useCreditBalance(userId)` |

### 2.23 `Components/Shared/Footer.jsx` (103 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 6 | Uses `bg-[--color-bg-elevated]` — this CSS variable **does not exist** in index.css | Change to `bg-[--color-bg-surface]` |
| 2 | Medium | 32, 64, 68(❌Skipped for now) | Links to `/insights`, `/terms`, `/privacy` — these routes don't exist in Routes.jsx | Either add routes or remove links |
| 3 | Low | 80 | `new Date().getFullYear()` computed on every render | Extract to constant or useMemo (minor) |

### 2.24 `Components/Surveys/CheckboxQuestion.jsx` (75 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 29-35 | Heavy inline styles for selected state — should use `.mcq-option` and `.mcq-control` classes from index.css | Replace with design system classes |
| 2 | Medium | 38-49 | Custom checkbox visual built with inline styles instead of using `.mcq-control[type="checkbox"]` from index.css | Use native checkbox with `.mcq-control` class |
| 3 | Low | 9-14 | `toggle` function recreated every render — wrap in `useCallback` | Minor optimization |

### 2.25 `Components/Surveys/LinearScale.jsx` (32 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 22-24 | Inline style for active state — should use `.linear-scale-btn.active` from index.css | Replace with class-based styling |
| 2 | Low | 6-8 | Hardcoded labels "Not at all" / "Extremely" — should be configurable via props | Add `labelMin`/`labelMax` props |

### 2.26 `Components/Surveys/MultipleChoice.jsx` (35 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 14-26 | Custom radio visual with inline styles — should use `.mcq-control[type="radio"]` from index.css | Use native radio with design system classes |

### 2.27 `Components/Surveys/QuestionRenderer.jsx` (27 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Low | All | Clean switch-based renderer | No change |

### 2.28 `Components/Surveys/ShortAnswer.jsx`, `Paragraph.jsx` (12 lines each)

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Low | All | Clean, uses `.form-input` class | No change |

### 2.29 `Components/Surveys/SurveyFeedback.jsx` (169 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 111 | Uses hardcoded `text-yellow-400` and `text-gray-300` — violates design system (should use `--color-warning` and `--color-border`) | Replace with design system colors |
| 2 | Medium | 14-31 | Manual form state management instead of React Hook Form | Consider migrating to React Hook Form for consistency |
| 3 | Low | 45-166 | Good AnimatePresence usage for modal | No change |

### 2.30 `Pages/Auth/Login.jsx` (217 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 12 | `formData` state with spread updates — should use React Hook Form | Migrate to RHF for consistency with form patterns |
| 2 | Medium | 56 | `await logOut().catch(() => {})` — silent error swallowing | Log the error or show user feedback |
| 3 | Medium | 111 | Uses `text-text-secondary`, `text-navy` — these are NOT valid Tailwind v4 classes from @theme. Should be `text-[--color-text-secondary]`, `text-[--color-navy]` | Fix all class names to use CSS variable syntax or correct @theme tokens |
| 4 | Medium | 63 | Uses `bg-bg-subtle` — not a valid Tailwind class | Use `bg-[--color-bg-subtle]` |
| 5 | Low | 194 | Uses `bg-user` — not a valid Tailwind class | Use `bg-[--color-user]` |

### 2.31 `Pages/Auth/SignUp.jsx` (355 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **High** | 11 | `imgbbApiKey` loaded from env and sent in client-side fetch URL — **API key exposed in browser** | Move image upload to backend proxy endpoint |
| 2 | **High** | 49 | `fetch(`${imgbbUploadUrl}?key=${imgbbApiKey}`)` — API key visible in network tab | Same as above |
| 3 | Medium | 16-26 | Large form state object — should use React Hook Form | Migrate to RHF |
| 4 | Medium | 57-116 (❌Skipped for now)| Password validation only checks match — no strength requirements | Add password strength validation (min length, special chars) |
| 5 | Medium | 106-112 | Firebase user deletion as rollback — `firebaseUser.delete()` requires recent re-authentication and may fail | Handle re-auth or use Cloud Function for cleanup |
| 6 | Medium | 119-351 | Same CSS class issues as Login.jsx — `bg-bg-base`, `bg-bg-surface`, `bg-navy`, `text-text-inverse` etc. are not valid Tailwind v4 classes | Fix all class references |

### 2.32 `Pages/Home/Home.jsx` (49 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **High** | 5-8 | **All role-specific home pages statically imported** — bundles AdminHome, SurveyorHome, UserHome even for guests | Use `React.lazy()` for each role component |
| 2 | Medium | 37 | `if (!user) return <GuestHome />` — GuestHome is ~544 lines with GSAP + AOS, loaded for every guest visit | Lazy load GuestHome too |
| 3 | Low | 11-29 | Good skeleton loader | No change |

### 2.33 `Pages/Home/GuestHome.jsx` (544 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **High** | 5-9 | **Three animation libraries loaded simultaneously**: AOS (line 5), GSAP (line 7-8), Motion (line 4 from PageTransition wrapper) — massive bundle bloat and potential conflicts | Pick ONE animation library. GSAP + useGSAP is sufficient; remove AOS entirely |
| 2 | **High** | 77-78 | `AOS.init()` called in useEffect with empty deps — AOS persists across route changes and may conflict with other animations | Remove AOS entirely; use GSAP ScrollTrigger for all scroll animations |
| 3 | Medium | 81-97 | Data fetching with manual `useEffect` + mounted flag — should use TanStack Query | Replace with `useQuery` hook |
| 4 | Medium | 17-43 | `CountUp` component uses `IntersectionObserver` manually — could use `react-intersection-observer` or GSAP ScrollTrigger | Consider using existing GSAP infrastructure |
| 5 | Medium | 187-194 | Hardcoded fallback values (12847, 2100000, 4300, 340000) — should come from API or config | Move fallbacks to a constants file |
| 6 | Low | 132 | Wrapped in `PageTransition` (Motion) AND uses GSAP internally — redundant | Remove PageTransition wrapper if GSAP handles entrance |

### 2.34 `Pages/Home/UserHome.jsx` (239 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 52-60 | Manual data fetching with useEffect — should use TanStack Query | Replace with custom `useUserHomeData` query hook |
| 2 | Medium | 87 | Emoji `👋` and `🔥` in JSX — consider using SVG icons for consistency | Replace with icon components |
| 3 | Medium | 138 | Inline style `backgroundColor: "var(--color-user)"` — should use design system class | Use `btn-user` variant or class |
| 4 | Low | 10-17 | Good motion variants defined outside component | No change |

### 2.35 `Pages/Home/SurveyorHome.jsx` (453 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 56-73 | Manual data fetching with useEffect | Replace with TanStack Query hook |
| 2 | Medium | 101 | Emoji `🔵` in JSX | Replace with icon |
| 3 | Medium | 209 | Inline style `backgroundColor: "var(--color-surveyor-light)"` on card | Use design system class |
| 4 | Low | All | Well-structured sections | No change |

### 2.36 `Pages/Home/AdminHome.jsx` (436 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 65-81 | Manual data fetching with useEffect | Replace with TanStack Query hook |
| 2 | Medium | 113 | Emoji `🔴` in JSX | Replace with icon |
| 3 | Medium | 176 | Inline style for border-left color | Use design system class |
| 4 | Low | 1 | `eslint-disable no-unused-vars` — investigate and remove if unnecessary | Clean up eslint disables |

### 2.37 `Pages/Surveys/SurveysPage.jsx` (746 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 247-254 | Derived state sync pattern during render (lines 250-253) — React 19 recommends `use` hook or `useEffectEvent` for this pattern | Consider `useEffectEvent` (React 19) or keep current pattern (it's valid) |
| 2 | Medium | 195-200 | Inline styles on button — should use design system | Replace with class-based styling |
| 3 | Medium | 29-44 | `questionLengthLabel` returns objects with inline color values — should use design system tokens | Return class names instead of style objects |
| 4 | Low | 68-82 | Good motion variants | No change |
| 5 | Low | 233-407 | FilterSidebar is well-structured with debounce | No change |

### 2.38 `Pages/Surveys/SurveyDetailPage.jsx` (623 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **High** | 71-85 | **Derived state sync during render** (checking `responseKey !== prevResponseKey`) — this is a valid React pattern but React 19's `use()` hook could simplify | Consider using `use` hook for async data, or keep current pattern (it works) |
| 2 | Medium | 351-378 | Multiple inline style objects for badge states — should use design system badge classes | Replace with conditional badge classes |
| 3 | Medium | 403-455 | More inline styles for status banners | Use design system classes |
| 4 | Low | 122-131 | Good Ctrl+S keyboard shortcut with cleanup | No change |
| 5 | Low | 46-622 | Well-structured survey flow with draft/save/submit | No change |

### 2.39 `Pages/Blogs/BlogsPage.jsx` (194 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Low | 29-44 | Good IntersectionObserver for infinite scroll | No change |
| 2 | Low | 5-23 | Good use of `useBlogsInfinite` hook | No change |
| 3 | Low | All | Clean infinite scroll implementation | No change |

### 2.40 `Pages/Blogs/BlogDetailPage.jsx` (548 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **Critical** | 382 | **`dangerouslySetInnerHTML` with unsanitized `blog.content`** — XSS vulnerability if blog content contains malicious HTML | Use DOMPurify: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}` |
| 2 | Medium | 226-239 | Derived state sync during render (`if (blog && !localComments)`) — same pattern as SurveyDetailPage | Consider refactoring with useEffect or React 19 `use` |
| 3 | Medium | 48-207 | `CommentItem` uses local `useState` for replies but also calls axios directly — should use a mutation hook | Extract reply submission to `useBlogReply` hook |
| 4 | Medium | 1 | `eslint-disable no-unused-vars` — clean up | Remove unnecessary disable |
| 5 | Low | All | Good comment/reply structure with AnimatePresence | No change |

### 2.41 `Pages/Feedback/FeedbackPage.jsx` (715 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **High** | 127-128 | **ImgBB API key exposed in client-side fetch** — same security issue as SignUp | Move upload to backend proxy |
| 2 | Medium | 140-219 | Manual form state management — should use React Hook Form | Migrate to RHF |
| 3 | Medium | 157-159 | `set` helper function recreates on every render | Wrap in `useCallback` |
| 4 | Low | All | Well-designed feedback form with good UX | No change |

### 2.42 `Pages/Profile/ProfilePage.jsx` (434 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 34-56 | EditModal uses local form state — should use React Hook Form | Migrate to RHF |
| 2 | Medium | 177 | Inline style `background: "var(--color-visitor)"` | Use design system class |
| 3 | Low | 11-28 | Good role theme map | No change |

### 2.43 `Pages/Profile/AdminProfile.jsx`, `SurveyorProfile.jsx`, `UserProfile.jsx` - ❌ skipping, i will adjust it later

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | AdminProfile:148-186 | **Hardcoded mock data** for "Recent Actions" — will show stale data forever | Replace with real data from API or remove until audit log is built |
| 2 | Medium | SurveyorProfile:115-128 | AI Insight toggle is **read-only display** — no mutation to actually toggle the setting | Add `useToggleAIInsight` mutation |
| 3 | Low | All | Good use of StatCard and design system | No change |

### 2.44 `Pages/Payment/PricingPage.jsx` (378 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 7 | Direct `axios` import instead of `useAxiosPublic` | Use hook |
| 2 | Medium | 108 | Uses `API` constant from line 9 — should use axios instance from hook | Use `useAxiosPublic` |
| 3 | Low | All | Good pricing page structure | No change |

### 2.45 `Pages/Payment/PaymentSuccessPage.jsx` (145 lines) — ✅ Fixed

| # | Severity | Line | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 5 | Direct `axios` import | Use `useAxiosPublic` |
| 2 | Medium | 20-29 | Manual useEffect data fetching | Could use TanStack Query, but acceptable for one-time verification |
| 3 | Low | All | Clean payment verification flow | No change |

---

## 3. Issue Summary by Category

### 3.1 React 19 Best Practices

| Issue | Count | Severity |
|-------|-------|----------|
| Missing `use()` hook for async data | 6 | Medium |
| No Suspense boundaries | 1 | High |
| Derived state sync during render (valid but could use `useEffectEvent`) | 3 | Low |
| Missing `useMemo` for context values | 1 | Medium |

### 3.2 TanStack Query Anti-Patterns

| Issue | Count | Severity |
|-------|-------|----------|
| Manual useEffect data fetching (should be useQuery) | 5 | Medium |
| Missing optimistic updates | 2 | Medium |
| Missing onError handlers | 3 | Medium |
| Query key inconsistency | 2 | Medium |
| No default query client config | 1 | Medium |

### 3.3 Performance Issues

| Issue | Count | Severity |
|-------|-------|----------|
| Zero code splitting / lazy loading | 1 | **High** |
| Dynamic Tailwind class names (won't work) | 2 | Medium |
| Computed values without useMemo | 3 | Medium |
| Context value recreated every render | 1 | Medium |
| Multiple animation libraries loaded | 1 | **High** |

### 3.4 Code Quality Issues

| Issue | Count | Severity |
|-------|-------|----------|
| Dead route guards (AdminRoute, SurveyorRoute, UserRoute unused) | 3 | Medium |
| Hardcoded mock data | 1 | Medium |
| Inconsistent naming (profileLoading vs isPending) | 2 | Low |
| Missing TypeScript types (JSX files) | 47 | Low |
| eslint-disable without justification | 4 | Low |

### 3.5 Animation Issues

| Issue | Count | Severity |
|-------|-------|----------|
| Three animation libraries (Motion + GSAP + AOS) on same page | 1 | **High** |
| AOS initialized globally, persists across routes | 1 | High |
| PageTransition wrapper + internal GSAP on same page | 2 | Medium |

### 3.6 Design System Violations

| Issue | Count | Severity |
|-------|-------|----------|
| Invalid Tailwind class names (bg-bg-base, text-navy, etc.) | 15+ | Medium |
| Non-existent CSS variables (bg-primary, bg-elevated) | 2 | Medium |
| Inline styles instead of design system classes | 20+ | Medium |
| Hardcoded colors instead of CSS variables | 10+ | Medium |
| Duplicate CSS tokens (@theme + :root) | 1 | Low |

### 3.7 Routing Issues

| Issue | Count | Severity |
|-------|-------|----------|
| No lazy loading on any route | 1 | **High** |
| No Suspense boundaries | 1 | **High** |
| Unused route guard components | 3 | Medium |
| Missing routes referenced in Footer | 3 | Medium |

### 3.8 Form Issues

| Issue | Count | Severity |
|-------|-------|----------|
| Not using React Hook Form (manual state) | 6 | Medium |
| Missing password validation | 1 | Medium |
| Uncontrolled file inputs | 2 | Low |

### 3.9 Security Issues

| Issue | Count | Severity |
|-------|-------|----------|
| **XSS via dangerouslySetInnerHTML** | 1 | **Critical** |
| **API keys exposed in client code (ImgBB)** | 2 | **High** |
| JWT in localStorage (XSS vulnerable) | 1 | High |
| Silent error swallowing | 3 | Medium |

### 3.10 Bundle Size Issues

| Issue | Count | Severity |
|-------|-------|----------|
| No dynamic imports — all pages in initial bundle | 1 | **High** |
| Three animation libraries (Motion ~30kb + GSAP ~20kb + AOS ~15kb) | 1 | **High** |
| react-icons importing individual icons (good) | 0 | - |

---

## 4. Overall Architecture Assessment

### Strengths

- **Excellent design system** in `index.css` — comprehensive tokens, utility classes, reduced-motion support
- **Good TanStack Query usage** in hooks — proper staleTime, gcTime, query keys, invalidation
- **Clean component composition** — Card, Button, StatCard are well-abstracted
- **Role-based routing** pattern is sound
- **Good UX patterns** — skeleton loaders, empty states, error states, draft saving
- **Proper interceptor cleanup** in useAxiosSecure (though implementation has issues)

### Weaknesses

- **No code splitting** — entire app in initial bundle
- **Security vulnerabilities** — XSS, exposed API keys
- **Animation library bloat** — three libraries doing overlapping things
- **Design system inconsistency** — many components ignore the excellent CSS utilities
- **Manual data fetching** in pages despite having good query hooks
- **No error boundaries** at any level

### Architecture Score: **6.5/10**

---

## 5. Prioritized Action Items

### P0 — Critical (Fix Immediately)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 1 | **Sanitize HTML in BlogDetailPage** — add DOMPurify | `BlogDetailPage.jsx:382` | 15 min |
| 2 | **Move ImgBB uploads to backend** — remove API key from client | `SignUp.jsx:49`, `FeedbackPage.jsx:127` | 2-4 hrs |
| 3 | **Add lazy loading to all routes** — React.lazy + Suspense | `Routes.jsx`, `Home.jsx` | 2 hrs |

### P1 — High (Fix This Sprint)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 4 | **Remove AOS, consolidate to GSAP + Motion** | `GuestHome.jsx`, all pages | 4 hrs |
| 5 | **Fix axios interceptor duplication bug** | `useAxiosSecure.jsx:14-46` | 1 hr |
| 6 | **Fix invalid CSS variable references** | `MainLayout.jsx`, `Footer.jsx`, all Auth pages | 2 hrs |
| 7 | **Fix dynamic Tailwind class names** | `BlogCard.jsx:52,58` | 30 min |
| 8 | **Add default QueryClient config** | `main.jsx:9` | 15 min |
| 9 | **Replace manual useEffect fetching with useQuery** | `GuestHome.jsx`, `UserHome.jsx`, `SurveyorHome.jsx`, `AdminHome.jsx` | 4 hrs |

### P2 — Medium (Fix Next Sprint)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 10 | **Migrate forms to React Hook Form** | `Login.jsx`, `SignUp.jsx`, `FeedbackPage.jsx`, `ProfilePage.jsx`, `SurveyFeedback.jsx` | 8 hrs |
| 11 | **Add error boundaries** | New component + wrap routes | 2 hrs |
| 12 | **Fix design system violations** — replace inline styles with classes | All survey components, all pages | 6 hrs |
| 13 | **Add optimistic updates** for blog reactions/comments | `useBlogs.jsx` | 2 hrs |
| 14 | **Remove dead route guards** or wire them up | `AdminRoute.jsx`, `SurveyorRoute.jsx`, `UserRoute.jsx` | 1 hr |
| 15 | **Fix Navbar to use axios hooks** | `Navbar.jsx:10,111` | 30 min |
| 16 | **Add missing routes** or remove dead links | `Footer.jsx`, `Routes.jsx` | 1 hr |

### P3 — Low (Nice to Have)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 17 | **Remove duplicate :root tokens** from index.css | `index.css:102-181` | 15 min |
| 18 | **Add TypeScript** to all files | All `.jsx` files | 20+ hrs |
| 19 | **Memoize context values** | `AuthProvider.jsx` | 15 min |
| 20 | **Clean up eslint-disable comments** | Multiple files | 1 hr |
| 21 | **Add password strength validation** | `SignUp.jsx` | 1 hr |
| 22 | **Implement AI Insight toggle mutation** | `SurveyorProfile.jsx` | 2 hrs |
| 23 | **Replace hardcoded mock data** with API or remove | `AdminProfile.jsx` | 1 hr |

---

## 6. Estimated Total Effort

| Priority | Hours |
|----------|-------|
| P0 — Critical | 3-5 hrs |
| P1 — High | 13-15 hrs |
| P2 — Medium | 22-25 hrs |
| P3 — Low | 26+ hrs |
| **Total** | **~65+ hours** |

---

## 7. Quick Wins (Under 30 Minutes Each)

1. Fix `bg-[--color-bg-primary]` → `bg-[--color-bg-base]` in MainLayout.jsx
2. Fix `bg-[--color-bg-elevated]` → `bg-[--color-bg-surface]` in Footer.jsx
3. Fix "Pricings" → "Pricing" typo in Navbar.jsx
4. Add DOMPurify to BlogDetailPage.jsx
5. Add default QueryClient options in main.jsx
6. Fix dynamic Tailwind classes in BlogCard.jsx Avatar component
7. Remove duplicate `:root` block from index.css
8. Memoize `authInfo` in AuthProvider.jsx
