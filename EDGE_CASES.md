# SurveyHub — Edge Case & Missing Scenario Audit

> Audit scope: Full backend (models, routes, middleware, services) + Frontend (router, hooks, components, auth flow).
> Generated from static code analysis.

---

## Critical

### C-1. JWT Signing Endpoint Has Zero Authentication

**File:** `backend/middlewares/authRoutes.js:5-9`

**Problem:** `POST /jwt` signs a JWT using the entire `req.body` as payload with no auth, no field allowlisting, no validation. Any anonymous user can request a token with arbitrary claims.

```
POST /jwt
Body: { "email": "admin@surveyhub.com", "role": "admin" }
→ Returns valid JWT granting full admin access
```

**Impact:** Complete authentication bypass. Every `verifyToken`-protected route trusts the decoded JWT.

**Proposed fix:** Remove this endpoint entirely. The `routes/authRoutes.js` login endpoint already issues JWTs correctly after looking up the user in the database. If `/jwt` is needed for testing, gate it behind `NODE_ENV === 'development'` and strip the payload to only `{ email }` (look up role from DB, never trust client-supplied role).

---

### C-2. Double-Credit Race Condition in Payment Fulfillment

**File:** `backend/routes/paymentRoutes.js:90-143` (webhook) + `:165-237` (verify-session)

**Problem:** Credits are fulfilled in two code paths — the Stripe webhook handler and the frontend `verify-session` endpoint. The dedup check is non-atomic:

```js
const alreadyCredited = await Subscription.findOne({
  userId,
  'billingHistory.providerPaymentIntentId': paymentIntentId,
});
if (!alreadyCredited) { /* credit */ }
```

Concurrent requests (webhook + verify-session, or Stripe webhook retries) can both pass the check before either writes.

**Impact:** Double-credits on every purchase. Users get 2x the credits they paid for.

**Proposed fix:** Use `findOneAndUpdate` with a unique index on `billingHistory.providerPaymentIntentId` or an upsert pattern:

```js
// Atomic: insert only if not already present
const result = await Subscription.findOneAndUpdate(
  { userId, 'billingHistory.providerPaymentIntentId': { $ne: paymentIntentId } },
  { $push: { billingHistory: billingEvent, creditLedger: creditTx },
    $inc: { balance: credits, totalPurchased: amount } },
  { new: true }
);
if (!result) return; // already credited
```

Alternatively, add a unique sparse index on `billingHistory.providerPaymentIntentId` and let the insert fail on duplicates.

---

### C-3. Survey Response `userId` Spoofing

**File:** `backend/routes/surveyRoutes.js:503-532`

**Problem:** `POST /:id/respond` reads `userId` from the request body instead of extracting it from the JWT:

```js
const { userId, answers, isDraft } = req.body; // userId from body
const response = await Response.findOneAndUpdate(
  { surveyId: req.params.id, userId }, // trusts body userId
  ...
);
```

**Impact:** Any authenticated user can submit responses as any other user, overwrite another user's draft, and inflate `participantCount`.

**Proposed fix:** Extract userId from the decoded JWT:

```js
const user = await User.findOne({ email: req.decoded.email }).lean();
const userId = user._id.toString();
// Remove userId from req.body validation or ignore it
```

Same fix needed for: blog comments (`blogRoutes.js:663`), blog replies (`blogRoutes.js:690`), blog reactions (`blogRoutes.js:624`).

---

### C-4. Dashboard Admin Routes Missing Role Check

**File:** `backend/routes/dashboardRoutes.js:10-204`

**Problem:** The router is mounted with `verifyToken` at `index.js:108`, but admin-specific routes (`GET /admin/reports`, `PATCH /admin/reports/:id`, `GET /admin/audit-logs`, `POST /admin/broadcast`) do NOT verify admin role. Any authenticated user can access them.

**Impact:** Any logged-in user can view all reports, dismiss reports, view audit logs, and send platform-wide broadcasts.

**Proposed fix:** Add `verifyAdmin` middleware to admin routes, or add inline role checks:

```js
router.get('/admin/reports', verifyToken, verifyAdmin, async (req, res) => { ... });
router.patch('/admin/reports/:id', verifyToken, verifyAdmin, async (req, res) => { ... });
router.get('/admin/audit-logs', verifyToken, verifyAdmin, async (req, res) => { ... });
router.post('/admin/broadcast', verifyToken, verifyAdmin, async (req, res) => { ... });
```

---

## High

### H-1. Blog Reactions Runtime Error (Undefined Variable)

**File:** `backend/routes/blogRoutes.js:635`

**Problem:** The reaction toggle loop references `valid` which is never defined:

```js
for (const type of valid) { // ReferenceError: valid is not defined
```

**Impact:** `POST /api/blogs/:id/react` throws 500 on every call. All blog reactions are broken.

**Proposed fix:** Replace `valid` with the reaction type keys:

```js
const reactionTypes = ['like', 'insightful', 'disagree', 'interesting', 'funny'];
for (const type of reactionTypes) {
```

---

### H-2. `my-response` Endpoint Leaks Any User's Responses

**File:** `backend/routes/surveyRoutes.js:856-866`

**Problem:** `GET /:id/my-response` accepts `userId` as a query parameter and returns the response without verifying it belongs to the authenticated user.

**Impact:** Any authenticated user can enumerate and read any other user's survey responses (drafts and submissions).

**Proposed fix:** Ignore the query parameter and extract userId from JWT:

```js
const user = await User.findOne({ email: req.decoded.email }).lean();
const response = await Response.findOne({ surveyId: req.params.id, userId: user._id }).lean();
```

---

### H-3. User Profile Endpoint Exposes Sensitive Fields

**File:** `backend/routes/userRoutes.js:6-20`

**Problem:** `GET /api/users/:email` returns the full User document including `subscription`, `providerCustomerId`, `moderationStats`, etc.

**Impact:** Any authenticated user can see any other user's Stripe customer ID, subscription details, and internal moderation stats.

**Proposed fix:** Project only public-safe fields:

```js
const user = await User.findOne({ email })
  .select('name email avatar role status bio location occupation socialLinks preferences')
  .lean();
```

---

### H-4. Regex Injection / ReDoS in Search Queries

**File:** `backend/routes/surveyRoutes.js:44-46`, `surveyRoutes.js:211-214`, `blogRoutes.js:84-85`, `blogRoutes.js:519-523`

**Problem:** User-supplied `search` parameters are injected directly into MongoDB `$regex` without escaping:

```js
query.title = { $regex: search.trim(), $options: 'i' };
```

**Impact:** Malicious regex like `((a+)+$)` causes catastrophic backtracking (ReDoS). Regex metacharacters (`.` `*`) also match unintended content.

**Proposed fix:** Escape regex special characters:

```js
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
if (search && search.trim()) {
  query.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
}
```

---

### H-5. `auto-ai-insight` Toggle Passes Wrong Filter to `findOneAndUpdate`

**File:** `backend/routes/profileRoutes.js:157`

**Problem:** `User.findOneAndUpdate(email, ...)` passes the email string directly instead of an object:

```js
await User.findOneAndUpdate(email, { $set: { autoAIInsight: newValue } });
// Should be: User.findOneAndUpdate({ email }, { ... })
```

**Impact:** Mongoose may throw, match the wrong document, or silently fail. The auto-AI-insight toggle is unreliable.

**Proposed fix:** Change to `{ email }`.

---

### H-6. Frontend PrivateRoute Redirects to "/" Instead of "/login"

**File:** `frontend/src/Router/PrivateRoute.jsx:15`

**Problem:** `<Navigate to="/" state={{ from: location }} replace />` sends unauthenticated users to the home page instead of `/login`. The `from` state is lost because the user navigates to `/` first, then would need to manually click "Sign In".

**Impact:** Broken redirect-back flow. Users silently land on home with no indication they need to log in.

**Proposed fix:** Redirect to `/login` and preserve the return location:

```jsx
<Navigate to="/login" state={{ from: location.pathname }} replace />
```

Ensure the Login page reads `location.state?.from` and navigates back after successful login.

---

### H-7. Frontend Missing `<Suspense>` Boundaries for Lazy Routes

**File:** `frontend/src/Router/Routes.jsx`

**Status:** ~~High~~ → **Dismissed (False Positive)**

**Original claim:** Lazy-loaded pages have no `<Suspense>` wrapper, causing blank screens.

**Verification:** `main.jsx:27` wraps `<RouterProvider>` in `<Suspense fallback={<LoadingPage />}>`. Since the entire route tree renders inside this boundary, all lazy-loaded routes are covered. No crashes occur.

**Action:** No changes required.

---

### H-8. Survey Expiry During Response Editing — No Warning or Auto-Save

**File:** `frontend/src/Pages/Surveys/SurveyDetailPage.jsx:384-468`

**Problem:** If a user is filling out a survey and the deadline passes, `isExpired` flips to `true` (via refetch), the questions section disappears, and the "Save Draft" button vanishes — with no notification.

**Impact:** Users lose in-progress work silently.

**Proposed fix:** Add a expiry warning banner and auto-save trigger:

```jsx
useEffect(() => {
  if (isExpired && existingResponse?.status !== 'submitted') {
    // Auto-save draft
    handleSaveDraft();
    // Show expiry notice
    Swal.fire({ title: 'Survey Expired', text: 'Your progress has been saved as a draft.', icon: 'info' });
  }
}, [isExpired]);
```

---

### H-9. SignUp Rollback Doesn't Handle Firebase Delete Failure

**File:** `frontend/src/Pages/Auth/SignUp.jsx:153-198`

**Problem:** When MongoDB registration fails after Firebase auth succeeds, `firebaseUser.delete()` is called. This requires recent authentication and will likely fail for newly created users, leaving a phantom Firebase account.

**Impact:** Users with server errors get stuck — can't sign up again (email in use), can't log in (no MongoDB record).

**Proposed fix:** Instead of deleting the Firebase user, catch the failure and show a recovery message:

```js
try {
  await firebaseUser.delete();
} catch {
  // Firebase delete requires re-auth; show recovery message
  Swal.fire({
    title: 'Account Partially Created',
    text: 'Please contact support to complete your registration.',
    icon: 'warning'
  });
}
```

---

### H-10. `useProfile` staleTime of 30 Minutes Is Too Long for Role Changes

**File:** `frontend/src/Hooks/useProfile.jsx:13`

**Problem:** `staleTime: 1000 * 60 * 30` caches the profile (including role) for 30 minutes. If an admin promotes/demotes/bans a user, the frontend continues using stale role data.

**Impact:** Banned users see their dashboard for up to 30 minutes. Newly promoted admins can't access admin features.

**Proposed fix:** Reduce staleTime to 5 minutes, or add `refetchOnWindowFocus: true`:

```js
staleTime: 1000 * 60 * 5,
refetchOnWindowFocus: true,
```

---

### H-11. Auth Routes from `middlewares/authRoutes.js` Mounted Without Rate Limiter

**File:** `backend/index.js:95`

**Problem:** `app.use(require('./middlewares/authRoutes'))` mounts the `/jwt` endpoint at root level without any rate limiter, unlike `routes/authRoutes.js` which gets `authLimiter`.

**Impact:** The JWT signing endpoint can be hammered unlimited times.

**Proposed fix:** Remove this endpoint entirely (see C-1), or mount it under `/api/auth` with the auth limiter.

---

## Medium

### M-1. `useAxiosSecure` Module-Level Mutable Globals

**File:** `frontend/src/Hooks/useAxiosSecure.jsx:10-14`

**Problem:** `currentToken`, `currentLogOut`, `currentNavigate` are module-level variables shared across all hook instances. Multiple components overwrite each other's references.

**Impact:** A 401 response could call the wrong logout function or navigate to the wrong location.

**Proposed fix:** Refactor to use a React context for the axios instance, or use `useRef` within the hook and register interceptors per-instance (accepting the overhead of multiple interceptor registrations).

---

### M-2. Blog Comment/Reply/Reaction `userEmail` Spoofing

**File:** `backend/routes/blogRoutes.js:624, 663, 690`

**Problem:** `userEmail` is taken from `req.body` instead of the JWT for comments, replies, and reactions.

**Impact:** Impersonation of other users in comments/reactions.

**Proposed fix:** Extract from JWT:

```js
const userEmail = req.decoded.email;
```

Remove `userEmail` from the Zod validation schemas for these endpoints.

---

### M-3. Login Error Leaves AuthProvider in Permanent Loading State

**File:** `frontend/src/Pages/Auth/Login.jsx:148-150`

**Status:** ~~Medium~~ → **Dismissed (False Positive)**

**Original claim:** On login failure, `logOut()` might throw and leave `loading` as `true`.

**Verification:** Tracing the full flow:
1. `signInUser` fails → AuthProvider catch (line 34) calls `setLoading(false)` before throwing
2. Login.jsx catch (line 148) calls `logOut()` → AuthProvider catch (line 43) calls `setLoading(false)` before throwing
3. If `logOut()` itself fails, the `.catch()` in Login.jsx swallows it, and `setLoading(false)` already ran in step 2

Every code path resets loading.

**Action:** No changes required.

---

### M-4. QuestionRenderer Default Case Blocks Required Questions

**File:** `frontend/src/Components/Surveys/QuestionRenderer.jsx:21-25`

**Problem:** Unknown question types render "Unknown question type" with no way to respond. If the question is required, the user cannot submit.

**Impact:** Incompatible question types make surveys un-submitable.

**Proposed fix:** Render unknown types as a short text input as fallback, and log a console warning for developers.

---

### M-5. Blog Delete Has No Soft-Delete / Recycle Bin

**File:** `backend/routes/blogRoutes.js` (DELETE handler), `frontend/src/Hooks/useBlogsMutation.js:48-63`

**Problem:** Blogs are hard-deleted with no recycle bin. The confirmation dialog says "Delete Blog?" but doesn't emphasize permanence.

**Impact:** Accidental blog deletion is irreversible.

**Proposed fix:** Add a `deleted` boolean field to `Blog.js` (same pattern as `Survey.js`). Implement soft-delete with recycle bin in the surveyor dashboard. Update the confirmation dialog to say "Permanently delete this blog?" for hard deletes.

---

### M-6. BroadcastControl Has No Confirmation Dialog

**File:** `frontend/src/Pages/Dashboard/Admin/Components/BroadcastControl.jsx:23-33`

**Problem:** Platform-wide broadcasts are sent with only empty-field validation. No "Are you sure?" confirmation.

**Impact:** Accidental broadcasts to all users with no undo.

**Proposed fix:** Add `Swal.fire({ showCancelButton: true, confirmButtonText: 'Send Broadcast' })` before `broadcastMutation.mutateAsync()`.

---

### M-7. Missing 404 Catch-All Route

**File:** `frontend/src/Router/Routes.jsx`

**Problem:** No catch-all route for undefined paths. Users see `MainLayout` with an empty `<Outlet>`.

**Impact:** Blank page with no guidance on invalid URLs.

**Proposed fix:** Add a catch-all at the end of each layout's children:

```jsx
{ path: "*", element: <NotFoundPage /> }
```

---

### M-8. `useBlogsInfinite` May Stop Pagination Early

**File:** `frontend/src/Hooks/useBlogs.jsx:9-26`

**Problem:** First page fetches 6 items, subsequent pages fetch 2. If the server counts returned items against the limit, `hasMore` may be `false` after page 2 even when more items exist.

**Impact:** Infinite scroll stops loading prematurely.

**Proposed fix:** Use consistent page sizes or fetch the next page speculatively (request `stepSize + 1` items and use the extra item as a "has more" indicator).

---

### M-9. ContentReviewModal vs SurveyReviewModal Inconsistent Note Requirement

**File:** `frontend/src/Pages/Dashboard/Admin/Components/ContentReviewModal.jsx:34` vs `SurveyReviewModal.jsx:13-14`

**Problem:** `ContentReviewModal` requires `adminNote.trim()` before allowing moderation. `SurveyReviewModal` allows moderation with an empty note.

**Impact:** Inconsistent UX for the same admin action.

**Proposed fix:** Standardize — either require notes on both or make both optional.

---

### M-10. SignUp Doesn't Validate Avatar File Size

**File:** `frontend/src/Pages/Auth/SignUp.jsx:110, 134-151`

**Problem:** Avatar upload accepts `image/*` with no client-side size limit. Large files encoded as base64 can crash the browser tab.

**Impact:** Browser memory exhaustion on large file uploads.

**Proposed fix:** Add client-side validation:

```js
if (file.size > 5 * 1024 * 1024) {
  Swal.fire({ title: 'File Too Large', text: 'Avatar must be under 5MB.' });
  return;
}
```

---

## Low

### L-1. `CheckboxQuestion` useCallback Uses `JSON.stringify` in Dependencies

**File:** `frontend/src/Components/Surveys/CheckboxQuestion.jsx:14`

**Problem:** `JSON.stringify(selectedValues)` defeats memoization by running on every render.

**Proposed fix:** Use `useRef` to track previous values or shallow-compare arrays.

---

### L-2. BlogStudio `useMemo` Depends on `appealModal` Object

**File:** `frontend/src/Pages/Dashboard/Surveyor/Components/BlogStudio.jsx:236`

**Problem:** `useMemo(() => [...], [sortConfig, appealModal])` — `appealModal` is an object that gets a new reference on every open/close, causing unnecessary table re-renders.

**Proposed fix:** Memoize the `appealModal` state or use primitive flags (`appealModalOpen` boolean).

---

### L-3. MyProfile Avatar Missing `onError` Fallback

**File:** `frontend/src/Pages/Dashboard/Shared/MyProfile.jsx:107`

**Problem:** `<img src={profile.avatar}>` has no `onError` handler. Broken URLs show a broken image icon.

**Proposed fix:** Add fallback:

```jsx
<img src={profile.avatar || '/default-avatar.png'} onError={(e) => e.target.src = '/default-avatar.png'} />
```

---

### L-4. SurveyResults `question.breakdown` May Be Undefined

**File:** `frontend/src/Pages/Surveys/SurveyResults.jsx:41`

**Status:** ~~Low~~ → **Dismissed (False Positive)**

**Original claim:** `Object.entries(question.breakdown)` crashes if `breakdown` is null/undefined.

**Verification:** The backend results endpoint (both the `aiInsight.stats` path and the fallback aggregation path) always constructs `breakdown` as an object — either `{}` (empty) or populated. `Object.entries({})` returns `[]`, which is handled by the `data.length === 0` check at line 46. This cannot crash.

**Action:** No changes required.

---

### L-5. Missing SEO Metadata for Public Pages

**File:** `frontend/src/main.jsx`

**Status:** ~~Low~~ → **Overstated (Downgraded)**

**Original claim:** No `<title>` or `<meta description>` set per page.

**Verification:** `index.html` contains global SEO tags: `<title>SurveyHub — AI-Powered Survey & Insights Platform</title>` and `<meta name="description" content="...">`. The actual gap is **dynamic per-page** SEO (e.g., `/surveys/abc123` should show the survey title). This is an enhancement, not a missing critical feature.

**Action:** Implement dynamic header rendering (`react-helmet-async`) as a secondary SEO task. Global tags already provide baseline coverage.

---

### L-6. Firebase Config Env Var Naming Inconsistency

**File:** `frontend/src/Firebase/firebase.config.js:9-14`

**Problem:** Mix of `VITE_apiKey` (camelCase) and `VITE_API_URL` (SCREAMING_SNAKE_CASE).

**Proposed fix:** Standardize to `VITE_` prefix with consistent casing.

---

### L-7. `useProfile` Waterfall on Initial Load

**File:** `frontend/src/Hooks/useProfile.jsx`

**Status:** ~~Low~~ → **Dismissed (Overstated)**

**Original claim:** `useProfile` called in 12+ components triggers redundant requests.

**Verification:** React Query deduplicates concurrent queries sharing the same query key. Multiple components calling `useProfile(email)` simultaneously share a single network request.

**Action:** No changes required.

---

### L-8. Search Debounce Uses `window` Global

**File:** `frontend/src/Pages/Dashboard/Surveyor/Components/MySurveys.jsx:97`

**Problem:** Debounce timer stored on `window` can conflict in Strict Mode or HMR.

**Proposed fix:** Use `useRef` for the timer instead of `window`.

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 4 | Must fix before production |
| High | 6 | Fix before beta launch (H-7 dismissed as false positive) |
| Medium | 9 | Fix before v1.0 (M-3 dismissed as false positive) |
| Low | 5 | Backlog / tech debt (L-4, L-7 dismissed; L-5 downgraded) |
| Dismissed | 5 | False positives / overstated (H-7, M-3, L-4, L-5, L-7) |
| **Total** | **29** | (down from 33 after cross-verification) |

---

## Priority Fix Order

1. **C-1** — Remove `/jwt` endpoint or gate behind dev-only flag
2. **C-2** — Atomic payment fulfillment (unique index or atomic update)
3. **C-3** — Extract userId from JWT on all mutation routes
4. **C-4** — Add `verifyAdmin` to dashboard admin routes
5. **H-1** — Fix undefined `valid` variable in blog reactions
6. **H-2** — Fix `my-response` endpoint to use JWT userId
7. **H-3** — Project safe fields on user profile endpoint
8. **H-4** — Escape regex in all search queries
9. **H-5** — Fix `findOneAndUpdate` filter in auto-ai-insight
10. **H-6** — Fix PrivateRoute redirect to `/login`
11. **H-8** — Add survey expiry warning + auto-save
12. **H-9** — Handle SignUp Firebase delete failure gracefully
13. **H-10** — Reduce `useProfile` staleTime to 5 minutes
14. **H-11** — Remove or rate-limit `/jwt` endpoint

---

## Cross-Verification Log

Verified against developer review (`My_take.md`). 5 findings dismissed as false positives or overstated:

| Issue | Original Verdict | Verified Verdict | Reason |
|-------|-----------------|------------------|--------|
| H-7 | High | **Dismissed** | `main.jsx:27` root `<Suspense>` covers all lazy routes |
| M-3 | Medium | **Dismissed** | All error paths in AuthProvider reset `loading` correctly |
| L-4 | Low | **Dismissed** | Backend always returns `breakdown` as an object |
| L-5 | Low | **Overstated** | `index.html` has global SEO tags; gap is dynamic per-page only |
| L-7 | Low | **Dismissed** | React Query deduplicates concurrent `useProfile` calls |
12. **H-8** — Add survey expiry warning + auto-save
