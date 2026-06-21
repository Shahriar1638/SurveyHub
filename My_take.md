# SurveyHub — Consolidated Edge Case & Security Audit Verification

This document consolidates the static audit findings, custom developer feedback, and codebase-verified realities to establish a clear action plan for the SurveyHub platform.

---

## Executive Summary & Priorities

Based on codebase cross-verification:

1. **Critical Vulnerabilities (C-1 through C-4)** are verified true positives. These expose the system to authentication bypasses, race conditions, role spoofing, and privilege escalation. They must be resolved immediately before staging.
2. **High-Severity Backend/Auth Bugs** (specifically H-1, H-2, H-3, H-5, H-11) are real and verified. They will cause runtime failures or data leaks.
3. **Confirmed False Positives/Overstated Claims** (H-7, M-3, L-4, L-5, L-7) have been identified and documented below with detailed technical justifications to avoid waste of effort.

---

## 1. Critical Severity Issues

### C-1. JWT Signing Endpoint Has Zero Authentication

* **Status:** **Confirmed True Positive (Critical Security Bypass)**
* **File:** [authRoutes.js:5-9](file:///f:/Job%20stuff/Projects/SurveyHub/backend/middlewares/authRoutes.js#L5-L9)
* **Reality:** The endpoint `POST /jwt` signs a token using whatever object is passed in `req.body` without verification. Any client can request a token with `role: "admin"` and bypass all server controls.
* **Fix Action:** Remove the `/jwt` signing endpoint from `authRoutes.js` entirely. Rely on the DB-verified login routes for issuing tokens.

### C-2. Double-Credit Race Condition in Payment Fulfillment

* **Status:** **Confirmed True Positive (Critical Billing Logic Bug)**
* **File:** [paymentRoutes.js:90-143](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/paymentRoutes.js#L90-L143) (webhook) & [paymentRoutes.js:165-237](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/paymentRoutes.js#L165-L237) (success check)
* **Reality:** Credits are added in both the webhook and client verification endpoints. The checking process is non-atomic and lacks deduplication logic in the webhook.
* **Fix Action:** Refactor to use a single idempotent fulfillment path. Implement a unique sparse index on `billingHistory.providerPaymentIntentId` and verify fulfillment atomically using a query containing `$ne`:

  ```javascript
  const result = await Subscription.findOneAndUpdate(
    { userId, 'billingHistory.providerPaymentIntentId': { $ne: paymentIntentId } },
    { 
      $push: { billingHistory: billingEvent, creditLedger: creditTx },
      $inc: { balance: credits, totalPurchased: amount } 
    },
    { new: true }
  );
  ```

### C-3. Survey Response `userId` Spoofing

* **Status:** **Confirmed True Positive (Critical Data Integrity Issue)**
* **File:** [surveyRoutes.js:503-532](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/surveyRoutes.js#L503-L532)
* **Reality:** `POST /:id/respond` checks the `userId` passed inside the request body, trusting user inputs. Authenticated users can modify responses or drafts of other accounts.
* **Fix Action:** Extract the user email from `req.decoded.email` to retrieve the database `userId` securely. Replicate this fix across comments, replies, and reactions in [blogRoutes.js](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/blogRoutes.js).

### C-4. Dashboard Admin Routes Missing Role Check

* **Status:** **Confirmed True Positive (Critical Authorization Bypass)**
* **File:** [dashboardRoutes.js:10-204](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/dashboardRoutes.js#L10-L204)
* **Reality:** Admin-specific dashboard endpoints under `/admin/*` are protected only by `verifyToken` on the dashboard route mount in `index.js`. There is no role assertion verifying the user is an administrator.
* **Fix Action:** Apply the `verifyAdmin` middleware inline on all admin-facing endpoints.

---

## 2. High Severity Issues

### H-1. Blog Reactions Runtime Error (Undefined Variable)

* **Status:** **Confirmed True Positive (High Severity Code Crash)**
* **File:** [blogRoutes.js:635](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/blogRoutes.js#L635)
* **Reality:** The endpoint loops over a variable named `valid` (`for (const type of valid)`), which is never declared. This causes a `ReferenceError` on all reaction payloads.
* **Fix Action:** Declare the valid reaction types list (`['like', 'insightful', 'disagree', 'interesting', 'funny']`) and loop over it.

### H-2. `my-response` Endpoint Leaks Any User's Responses

* **Status:** **Confirmed True Positive (High Severity Data Disclosure)**
* **File:** [surveyRoutes.js:856-866](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/surveyRoutes.js#L856-L866)
* **Reality:** `GET /:id/my-response` processes the query parameter `userId` directly, returning user responses to any client token.
* **Fix Action:** Query the DB using the authenticated requester's `_id` retrieved via `req.decoded.email`.

### H-3. User Profile Endpoint Exposes Sensitive Fields

* **Status:** **Confirmed True Positive (High Severity Data Leak)**
* **File:** [userRoutes.js:6-20](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/userRoutes.js#L6-L20)
* **Reality:** `GET /api/users/:email` queries the database and outputs the entire raw User document including internal transaction IDs, customer IDs, and moderation tallies.
* **Fix Action:** Select safe fields only using `.select('name email avatar role status bio location occupation socialLinks preferences')`.

### H-4. Regex Injection / ReDoS in Search Queries

* **Status:** **Confirmed True Positive (High Severity Resource Exhaustion)**
* **File:** [surveyRoutes.js:142](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/surveyRoutes.js#L142), [surveyRoutes.js:212](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/surveyRoutes.js#L212), and [blogRoutes.js:85](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/blogRoutes.js#L85)
* **Reality:** User text inputs are passed directly to MongoDB `$regex` parameters without sanitization. Malicious searches could crash query workers.
* **Fix Action:** Escape regular expression metacharacters before building query objects.

### H-5. `auto-ai-insight` Toggle Passes Wrong Filter

* **Status:** **Confirmed True Positive (High Severity Syntax Bug)**
* **File:** [profileRoutes.js:157](file:///f:/Job%20stuff/Projects/SurveyHub/backend/routes/profileRoutes.js#L157)
* **Reality:** `User.findOneAndUpdate(email, ...)` passes the email string directly instead of `{ email }` object.
* **Fix Action:** Correct the signature to `User.findOneAndUpdate({ email }, ...)`.

### H-6. Frontend PrivateRoute Redirects to "/" Instead of "/login"

* **Status:** **Confirmed True Positive (High Severity UX Fault)**
* **File:** [PrivateRoute.jsx:15](file:///f:/Job%20stuff/Projects/SurveyHub/frontend/src/Router/PrivateRoute.jsx#L15)
* **Reality:** If a user is not logged in, they are redirected to the homepage (`/`) instead of `/login`, which drops their history return state.
* **Fix Action:** Redirect to `/login` and save the location state to allow redirect-back actions.

### H-7. Frontend Missing `<Suspense>` Boundaries for Lazy Routes

* **Status:** **False Positive (With UX Caveat)**
* **File:** [main.jsx:27](file:///f:/Job%20stuff/Projects/SurveyHub/frontend/src/main.jsx#L27)
* **Reality:** The application **will not crash**. The root `<Suspense>` wrapper covers `<RouterProvider>`. However, nesting local Suspense boundaries around components improves layout continuity (preventing full-page flashes).
* **Fix Action:** Downgrade priority. Fix as a UX refinement rather than a critical code crash.

### H-8 & H-9. Survey Expiry Warning & SignUp Rollbacks

* **Status:** **Confirmed True Positives (High Severity Edge Cases)**
* **File:** [SurveyDetailPage.jsx](file:///f:/Job%20stuff/Projects/SurveyHub/frontend/src/Pages/Surveys/SurveyDetailPage.jsx) & [SignUp.jsx](file:///f:/Job%20stuff/Projects/SurveyHub/frontend/src/Pages/Auth/SignUp.jsx)
* **Reality:** If a survey expires while editing, data disappears without auto-saving. For SignUp, if MongoDB fails post-Firebase-auth, a rollback failure leaves a phantom account.
* **Fix Action:** Implement warning auto-saves on survey expiration and handle Firebase deletes gracefully in `SignUp.jsx`.

### H-10. `useProfile` staleTime of 30 Minutes Is Too Long

* **Status:** **Confirmed True Positive (High Severity Authorization Delay)**
* **File:** [useProfile.jsx:13](file:///f:/Job%20stuff/Projects/SurveyHub/frontend/src/Hooks/useProfile.jsx#L13)
* **Reality:** User roles are cached on the client for 30 minutes, preventing role/permission updates (such as bans or admin promotions) from applying immediately.
* **Fix Action:** Reduce `staleTime` to 5 minutes or less, and enable focus refetches.

### H-11. Auth Routes Mounted Without Rate Limiter

* **Status:** **Confirmed True Positive (High Severity Abuse Risk)**
* **File:** [index.js:95](file:///f:/Job%20stuff/Projects/SurveyHub/backend/index.js#L95)
* **Reality:** `/jwt` is exposed on root without the security rate limiter applied to `/api/auth/*`.
* **Fix Action:** Apply the auth rate limiter to all token endpoints.

---

## 3. Medium & Low Severity Issues

### M-1. `useAxiosSecure` Module-Level Mutable Globals

* **Status:** **Confirmed True Positive (Medium Severity Code Smell)**
* **File:** [useAxiosSecure.jsx:10-14](file:///f:/Job%20stuff/Projects/SurveyHub/frontend/src/Hooks/useAxiosSecure.jsx#L10-L14)
* **Reality:** Global variables for interceptor IDs, navigation, and logout references will overwrite each other across concurrent layouts.
* **Fix Action:** Re-scope the mutable configuration hooks.

### M-3. Login Error Leaves AuthProvider in Permanent Loading State

* **Status:** **False Positive**
* **File:** [AuthProvider.jsx](file:///f:/Job%20stuff/Projects/SurveyHub/frontend/src/Firebase_AuthProvider/AuthProvider.jsx)
* **Reality:** The codebase correctly resets the `loading` variable on all failure scenarios (lines 40-46) and triggers state corrections inside the state change hook.
* **Fix Action:** Disregard this claim; no changes are required.

### L-4. SurveyResults `question.breakdown` May Be Undefined

* **Status:** **False Positive**
* **File:** [SurveyResults.jsx:41](file:///f:/Job%20stuff/Projects/SurveyHub/frontend/src/Pages/Surveys/SurveyResults.jsx#L41)
* **Reality:** The API returns `breakdown` as an object inside all survey results queries. It is never null or undefined, meaning the UI rendering logic will not crash.
* **Fix Action:** Disregard this claim; no changes are required.

### L-5. Missing SEO Metadata

* **Status:** **Overstated Claim**
* **File:** [main.jsx](file:///f:/Job%20stuff/Projects/SurveyHub/frontend/src/main.jsx)
* **Reality:** Global SEO tags are present in `index.html`. The actual requirement is dynamic route-specific header injection.
* **Fix Action:** Implement dynamic header rendering as a secondary SEO task.

### L-7. `useProfile` Waterfall on Initial Load

* **Status:** **Overstated Claim**
* **File:** [useProfile.jsx](file:///f:/Job%20stuff/Projects/SurveyHub/frontend/src/Hooks/useProfile.jsx)
* **Reality:** React Query automatically dedupes concurrent queries sharing query keys, preventing redundant network requests.
* **Fix Action:** Disregard this claim.
