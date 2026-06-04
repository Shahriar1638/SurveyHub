# SurveyHub — Project Context

> **Last updated:** 2026-06-03
> **Purpose:** Persistent context file for AI sessions. Update after every significant change.

---

## 1. Project Overview

SurveyHub is a **data-driven survey platform** being revamped from a basic voting app into a full-featured marketplace with:

- **AI-powered insights** (Gemini 3.1 Flash-Lite) for survey analytics
- **Credit-based payment model** (Stripe) — users buy credits to create surveys and run AI analysis
- **Insight Blogs** — surveyors publish blog posts based on their survey findings
- **4 user roles**: Guest, User, Surveyor, Admin
- **Subscription/credit system** — one-time credit purchases (not recurring)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, TanStack Query, react-router v7, Framer Motion, Heroicons |
| Auth | Firebase Auth (Google + email/password) + JWT (server-generated) |
| Backend | Express.js, Mongoose, MongoDB Atlas |
| Payments | Stripe (Checkout Sessions + Webhooks) |
| Image Upload | ImgBB API (server-side proxy) |
| Validation | Zod (backend) |
| Deployment | Render (backend), Firebase Hosting (frontend) |

---

## 3. Architecture

### 3.1 Frontend Structure
```
frontend/src/
├── main.jsx                 # React Query + AuthProvider + Router
├── Router/                  # Routes.jsx, role guards (Private, Admin, Surveyor, User)
├── Layout/                  # MainLayout (public), DashboardLayout (sidebar)
├── Pages/
│   ├── Auth/                # Login, SignUp
│   ├── Home/                # GuestHome, UserHome, SurveyorHome, AdminHome
│   ├── Surveys/             # SurveysPage, SurveyDetailPage
│   ├── Blogs/               # BlogsPage, BlogDetailPage, BlogCards, BlogCommentReply
│   ├── Dashboard/
│   │   ├── Admin/           # Overview, Moderation, AuditLogs, Broadcasts, Feedback
│   │   ├── Surveyor/        # Overview, MySurveys, AiAnalytics, BlogStudio, FeedbackInbox
│   │   └── User/            # Overview, ParticipationLedger, UserReports, UserSupport
│   ├── Profile/             # AdminProfile, UserProfile, SurveyorProfile
│   ├── Payment/             # PricingPage, PaymentSuccessPage
│   └── Feedback/            # FeedbackPage
├── Components/
│   ├── Shared/              # Navbar, Footer
│   ├── UI/                  # Button, Card, StatCard, SurveyCard, BlogCard, PageTransition
│   └── Surveys/             # QuestionRenderer, MCQ, LinearScale, Paragraph, ShortAnswer, Checkbox
├── Hooks/                   # useAxiosPublic, useAxiosSecure, useSurveys, useBlogs, useProfile, useDashboard*
├── Firebase_AuthProvider/   # AuthProvider (Firebase + JWT)
└── index.css                # Tailwind v4 theme + design system tokens
```

### 3.2 Backend Structure
```
backend/
├── index.js                 # Express + MongoDB + route mounting
├── middlewares/
│   ├── authMiddleware.js    # verifyToken, verifyAdmin, verifySurveyor, verifyUser, verifySurveyorOrAdmin
│   ├── authRoutes.js        # POST /jwt
│   └── requestId.js         # UUID tracing
├── routes/
│   ├── authRoutes.js        # /sign-up, /login, /upload-avatar
│   ├── surveyRoutes.js      # Survey CRUD, respond, feedback
│   ├── blogRoutes.js        # Blogs, reactions, comments/replies
│   ├── profileRoutes.js     # /me, stats
│   ├── userRoutes.js        # Get user by email
│   ├── feedbackRoutes.js    # Site feedback + ImgBB proxy
│   ├── paymentRoutes.js     # Stripe checkout, webhook, wallet
│   ├── dashboardRoutes.js   # Admin reports/audit/broadcast, user overview/participation
│   ├── guestHomeRoutes.js   # Stats, featured surveys, AI spotlight
│   ├── userHomeRoutes.js    # Recommended, trending, recent blogs
│   ├── surveyorHomeRoutes.js # KPIs, published/draft, blog activity
│   └── adminHomeRoutes.js   # Platform health, pending reports, revenue
├── models/ (10 models)
│   ├── User.js, Survey.js, Blog.js, Subscription.js
│   ├── response.js, report.js, feedback.js, siteFeedback.js
│   ├── AuditLog.js, Activity.js
└── data/                    # Seed data (fake_blogs, fake_surveys, fake_responses)
```

### 3.3 Route Map

**Public routes:**
- `/` → Role-based home (Guest/User/Surveyor/Admin)
- `/surveys` → Public survey explorer
- `/blogs` → Public insights feed
- `/blogs/:id` → Blog detail
- `/pricing` → Subscription plans
- `/login`, `/sign-up` → Auth pages

**Authenticated routes:**
- `/surveys/:id` → Survey response form (Private)
- `/profile` → Role-based profile (Private)
- `/payment/success` → Stripe callback (Private)
- `/feedback` → Site feedback

**Dashboard routes** (all Private + role guard):
- `/dashboard` → Dashboard home
- `/dashboard/:section` → Dashboard section

**API base:** `https://surveyhub-bfmp.onrender.com/api/`

---

## 4. Design System

- **Source:** `.agents/design/DESIGN.md` + `frontend/src/index.css`
- **Fonts:** Satoshi (headings), Inter (body), Public Sans (UI), JetBrains Mono (code)
- **Role colors:** Admin = red `#DB3725`, User = orange `#F67724`, Surveyor = blue `#5BBDEA`, Visitor = blue `#207EC5`
- **Brand:** Navy `#1B2D4F`
- **Semantic:** Success green, Warning amber, Error red, Info blue
- **Components:** buttons, badges, cards, forms, tables, overlays, side panels, skeleton loaders, reaction buttons, blog cards, survey cards, progress bars, auth prompts

---

## 5. Database Models

### User
```
email (unique), name, role (admin|user|surveyor), status (active|banned),
avatar, coverPhoto, bio, location, occupation, socialLinks,
subscription {plan, status, autoRenew, provider, providerCustomerId},
preferences [String], autoAIInsight Boolean,
moderationStats {reportsResolved, surveysReviewed, usersModerated, totalActions}
```

### Survey
```
surveyorId → User, title, description, useCase (≤20 words),
questions [{id, label, type (short_answer|paragraph|multiple_choice|checkbox|linear_scale), options[], required}],
status (draft|published|expired|banned), publishedAt, category,
participantCount, deadline (Date string), image,
aiInsight {enabled, autoGenerate, status, stats, summary, keyFindings[], recommendations[], modelInfo}
```

### Blog
```
surveyId → Survey, surveyorEmail, status (active|banned),
title, content (markdown),
reactions {like[], insightful[], disagree[], interesting[], funny[]},
comments [{userEmail, text, replies[{userEmail, text}]}]
```

### Subscription (Credit Wallet)
```
userId → User (unique), providerCustomerId,
balance, totalPurchased, totalSpent,
creditLedger [{type, credits, surveyId, description, occurredAt}],
billingHistory [{eventType, amount, currency, creditsTransacted, providerPaymentIntentId, occurredAt}]
```

### Response
```
surveyId → Survey, userId → User,
answers [{questionId, label, value (String|Array|Number)}],
status (draft|submitted), startedAt, submittedAt, durationSeconds
```

### Report
```
surveyId → Survey, reporterEmail, reportReason (Spam|Hate Speech|Inappropriate Content|Other),
details, status (pending|investigating|resolved|dismissed),
adminResponse {adminEmail, message, actionTaken, respondedAt}
```

### SiteFeedback
```
userEmail, feedbackType (bug|feature_request|general|complaint),
affectedPage, comment, attachments[], status (open|reviewing|resolved|dismissed),
adminResponse {adminEmail, message, respondedAt}
```

### AuditLog
```
actor {userId, email, role}, action, resource, resourceId,
timestamp, ip, userAgent, detail, requestId
```

---

## 6. Credit Packages (Stripe)

| Package | Credits | Price (USD) |
|---------|---------|-------------|
| Starter | 20 | $19 |
| Growth | 50 | $39 |
| Pro | 110 | $79 |
| Enterprise | 250 | $159 |

- Purchasing credits **promotes user to Surveyor** (one-way, never reverted)
- Credits are spent on: survey creation, AI analysis
- Webhook + session verification for payment fulfillment

---

## 7. Current Issues / Tech Debt

1. **Mongoose deprecation warning** — `{ new: true }` in `findOneAndUpdate()` needs to be replaced with `{ returnDocument: 'after' }` across:
   - `paymentRoutes.js` (webhook + verify-session)
   - `profileRoutes.js` (profile update)
   - `dashboardRoutes.js` (report update)
   - `feedbackRoutes.js` (feedback update)

2. **Unused models** — `Activity.js` exists but isn't used in any routes yet

3. **Placeholder data** — Several homepage routes return mocked/placeholder values:
   - `userHomeRoutes.js`: `inProgressSurveys: []`, `monthlyParticipations: 0`, `streak: 0`
   - `surveyorHomeRoutes.js`: `avgCompletionRate: 0`, `newResponses7d: 0`
   - `profileRoutes.js`: `recent-actions` returns empty array

4. **Missing admin features** — No user role management endpoints (promote/demote users), no survey approval queue

5. **No blog CRUD for surveyors** — Blogs can only be created via API; no create/edit/publish UI or routes for surveyors to manage their own blogs (only reaction/comment routes exist)

6. **No notification system** — Notification Hub mentioned in features.md but no model or routes exist

---

## 8. Key Files to Know

| File | Purpose |
|------|---------|
| `backend/index.js` | Server entry, route mounting, MongoDB connect |
| `backend/middlewares/authMiddleware.js` | All auth/role verification functions |
| `backend/routes/paymentRoutes.js` | Stripe integration + credit wallet |
| `backend/routes/dashboardRoutes.js` | All dashboard data endpoints |
| `backend/models/Survey.js` | Core survey schema with aiInsight |
| `backend/models/Blog.js` | Blog schema with reactions/comments |
| `backend/models/Subscription.js` | Credit wallet + billing |
| `frontend/src/Router/Routes.jsx` | All route definitions |
| `frontend/src/Layout/DashboardLayout.jsx` | Role-based sidebar navigation |
| `frontend/src/Firebase_AuthProvider/AuthProvider.jsx` | Auth context + JWT |
| `frontend/src/index.css` | Design system tokens + utility classes |

---

## 9. Environment Variables

**Backend (.env.local):**
- `PORT`, `MONGODB_URI` (or `DB_USER`/`DB_PASS`)
- `ACCESS_TOKEN_SECRET` (JWT)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `IMGBB_API_KEY`
- `FRONTEND_URL`

**Frontend (.env):**
- `VITE_IMGBB_API_KEY` (not used directly — server proxies uploads)

---

## 10. Recent Session History

- **2026-06-03:** Read all frontend/backend code, created FRONTEND_STRUCTURE.md, BACKEND_STRUCTURE.md, and this PROJECT_CONTEXT.md
- Identified Mongoose `new: true` deprecation warning across multiple route files
