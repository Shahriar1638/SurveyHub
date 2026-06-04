# Loading & Error States Audit

> Last updated: 2026-06-04

## Priority 1 — Missing Loading State (shows empty/zero/misleading state)

| # | File | Hook(s) | Issue | Fix Status |
|---|------|---------|-------|------------|
| 1 | `Pages/Dashboard/Admin/Components/AdminOverview.jsx` | `useAdminOverview()` | StatCards show "0" during load | ✅ Fixed |
| 2 | `Pages/Dashboard/Surveyor/Components/SurveyorOverview.jsx` | `useDashboardSurveyor()`, `useProfile()` | StatCards show "0" during load | ✅ Fixed |
| 3 | `Pages/Dashboard/Surveyor/Components/MySurveys.jsx` | `useDashboardSurveyor()` | Shows "No surveys yet" during load | ✅ Fixed |
| 4 | `Pages/Dashboard/Surveyor/Components/BlogStudio.jsx` | `useDashboardSurveyor()` | Shows "No blog posts yet" during load | ✅ Fixed |
| 5 | `Pages/Dashboard/User/Components/UserOverview.jsx` | `useUserOverview()`, `useProfile()` | StatCards show "0" during load | ✅ Fixed |
| 6 | `Pages/Payment/PricingPage.jsx` | `useProfile()` | userId is undefined during load; Buy button can fire early | ✅ Fixed |
| 7 | `Pages/Dashboard/Admin/AdminDashboard.jsx` | `useProfile()` | Name falls back to Firebase displayName (minor) | ⬜ Not Fixed (low priority) |
| 8 | `Pages/Dashboard/Surveyor/SurveyorDashboard.jsx` | `useProfile()` | Name falls back to Firebase displayName (minor) | ⬜ Not Fixed (low priority) |
| 9 | `Pages/Dashboard/User/UserDashboard.jsx` | `useProfile()` | Name falls back to Firebase displayName (minor) | ⬜ Not Fixed (low priority) |

## Priority 2 — Has Loading State, Missing Error State

| # | File | Hook(s) | Fix Status |
|---|------|---------|------------|
| 10 | `Pages/Dashboard/Admin/Components/AdminModeration.jsx` | `useAdminReports()` | ✅ Fixed |
| 11 | `Pages/Dashboard/Admin/Components/AuditLogs.jsx` | `useAuditLogs()` | ✅ Fixed |
| 12 | `Pages/Dashboard/Admin/Components/FeedbackManagement.jsx` | `useAdminFeedback()` | ✅ Fixed |
| 13 | `Pages/Dashboard/User/Components/ParticipationLedger.jsx` | `useUserParticipation()` | ✅ Fixed |
| 14 | `Pages/Dashboard/User/Components/UserReports.jsx` | `useUserReports()` | ✅ Fixed |
| 15 | `Pages/Dashboard/User/Components/UserSupport.jsx` | `useUserSupport()` | ✅ Fixed |
| 16 | `Pages/Profile/ProfilePage.jsx` | `useProfile()`, `useProfileStats()` | ✅ Fixed |

## Priority 3 — Minor / Blank Page During Load

| # | File | Issue | Fix Status |
|---|------|-------|------------|
| 17 | `Pages/Dashboard/Dashboard.jsx` | Returns `null` during load (blank page) | ✅ Fixed |
| 18 | `Pages/Dashboard/DashboardSection.jsx` | Returns `null` during load (blank page) | ✅ Fixed |

## Already Fixed

| # | File | Fix |
|---|------|-----|
| 19 | `Pages/Surveys/SurveyDetailPage.jsx` | Added loading spinner + error state (2026-06-03) |
| 20 | `main.jsx` | Suspense fallback updated to use shared `LoadingPage` with brand color `#5BBCEA` |

## Shared Components

| # | File | Purpose |
|---|------|---------|
| 21 | `Components/UI/LoadingSpinner.jsx` | Centralized loading UI: `LoadingSpinner`, `LoadingPage`, `LoadingCard` |

## Pattern Used

All files now follow this pattern:

```jsx
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";

const { data, isLoading, isError } = useSomeHook();

if (isLoading) return <LoadingSpinner />;
if (isError) return <div className="text-center py-12"><p className="type-body-sm text-[--color-error]">Failed to load data.</p></div>;
```

## Remaining (Low Priority)

- **AdminDashboard.jsx, SurveyorDashboard.jsx, UserDashboard.jsx**: Name falls back to Firebase displayName during profile load. This is a cosmetic fallback, not a crash or broken UX. Can be fixed by adding `isPending` check if needed later.
