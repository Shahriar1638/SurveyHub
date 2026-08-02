# SurveyHub — Intelligent Survey & Community Platform

> A full-stack SaaS platform for creating, distributing, and analyzing surveys — built with a modern React + Node.js stack, integrated AI analytics, content moderation, and a credit-based monetization system.

**Live:** [https://practice-2-firebase.web.app/](https://practice-2-firebase.web.app/)
**Repository:** [https://github.com/Shahriar1638/SurveyHub](https://github.com/Shahriar1638/SurveyHub)

---

## 🚀 What It Does

SurveyHub empowers users to build dynamic surveys with 5 question types, publish them to a public browse feed, and collect responses with real-time analytics. Surveyors can unlock AI-powered insights that automatically summarize response patterns, generate key findings, and provide actionable recommendations — all at zero additional cost. The platform also features a community blog engine with nested comments, reactions, and content moderation.

---

## 🚧 Coming Soon: SurveyGuard AI & SurveyLens AI

> Two dedicated AI agents are being built specifically for SurveyHub. Details, previews, and launch date — coming soon.

| Agent | Role |
|-------|------|
| **🛡️ SurveyGuard AI** | A dedicated AI content **moderator** — purpose-built to keep surveys, blogs, comments, and reports clean and safe |
| **🔍 SurveyLens AI** | A dedicated AI **analysis agent** — purpose-built for deeper survey insights, smarter Q&A, and richer data exploration |

---

## ✨ Key Features

### Survey Engine

- **Dynamic Survey Builder** — Drag-and-drop style dual-panel editor supporting Short Answer, Paragraph, Multiple Choice, Checkbox, and Linear Scale (with Matrix grid mode) question types
- **Smart Response Capture** — Auto-save drafts, progress tracking, and one-response-per-user enforcement at the database level
- **Flexible Result Access** — Surveyors control who sees results: only me, participants only, or everyone
- **Deadline Automation** — BullMQ + Redis scheduled jobs automatically expire surveys, aggregate statistics, and trigger AI insight generation

### AI-Powered Analytics

- **Automatic Insight Generation** — On expiry, a 3-provider AI cascade (Gemini → OpenRouter → OpenCode Zen) generates a natural language summary, key findings, and recommendations
- **AI Chat Sandbox** — Surveyors can ask natural language questions about their data and receive answers with inline chart visualizations (bar, pie, horizontal bar)
- **User-Controlled AI Toggle** — Per-survey opt-in/opt-out for AI insight generation, seeded from user preferences

### Community & Content

- **Blog Engine** — Markdown-supported blog posts with versioned edit history
- **Nested Comments** — Full comment + reply threading on blog posts
- **5-Type Reaction System** — Like, Insightful, Disagree, Interesting, and Funny reactions with toggle logic
- **Infinite Scroll Feed** — Performance-optimized blog browsing with IntersectionObserver pagination

### Moderation & Trust

- **AI Content Moderation** — Every survey and blog is pre-screened by a multi-provider AI moderation pipeline before going public
- **User Reporting** — Structured reporting system for surveys, blogs, comments, and replies with admin resolution workflow
- **Appeal System** — Content creators can appeal rejected content once per item
- **Audit Logging** — Full traceability with request ID propagation across the stack

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS, TanStack Query v5, Framer Motion, Recharts |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), BullMQ |
| **Authentication** | Firebase Auth (OAuth + Email/Password), JWT (1h expiry) |
| **AI / ML** | Gemini (key rotation), OpenRouter (dynamic model selection), OpenCode Zen |
| **Payments** | Stripe Checkout (one-time sessions), webhook fulfillment |
| **Queue / Cache** | BullMQ + Redis (delayed jobs for survey expiry) |
| **Image Hosting** | ImgBB proxy |

---

## 🏗 Architecture Highlights

### Authentication & Authorization

- **Dual-Layer Security** — Firebase Auth handles identity (OAuth, email/password), while JWT handles API authorization. Decoupled so either can be swapped independently.
- **Short-Lived Tokens** — JWT 1-hour expiry limits exposure if compromised.
- **Fail-Fast Startup** — Server refuses to start if `ACCESS_TOKEN_SECRET` is missing. No silent fallback to weak secrets.
- **Role-Based Middleware** — Factory-pattern auth middleware exports independently testable guards (`verifyToken`, `verifyAdmin`, `verifySurveyor`, `verifyUser`, `verifySurveyorOrAdmin`). Separation of concerns: auth check ≠ role check.
- **Banned User Detection** — Role middlewares check `user.status === 'banned'` from DB on every request, blocking banned users even with a valid JWT.
- **Graceful Partial Failure** — If MongoDB insert fails after Firebase account creation, the Firebase user is cleaned up automatically.

### Input Validation & API Security

- **Zod Schemas** — All user-facing inputs are validated before touching route handlers.
- **Regex Escape** — `escapeRegex()` on all search queries prevents ReDoS attacks.
- **Rate Limiting** — 3-tier system: general (100 req/min), auth (20 req/min), payment (10 req/min), all per-IP.
- **Stripe Webhook Verification** — Raw body parser + `stripe.webhooks.constructEvent()` ensures webhook authenticity.
- **Payment Deduplication** — `findOne` + `findOneAndUpdate` with `providerPaymentIntentId` prevents double-crediting.
- **Atomic Credit Deduction** — Wallet check + deduction + ledger write in a single `findOneAndUpdate` call with atomic `$inc` and `$push` operators, with `min: 0` schema constraint as a secondary guard.
- **Content Moderation Gate** — Every survey and blog passes AI moderation before going public. Rejected content never reaches the platform.

### Data Integrity & Modeling

- **Compound Unique Indexes** — `{surveyId, userId}` on Response model enforces one response per user per survey at the database level.
- **Toggle Logic for Reactions** — Remove from all types, add to selected. Prevents duplicate reactions.
- **Duplicate Report Guard** — One report per reporter per content item, with self-report rejection.
- **Single Appeal Per Content** — `moderation.appeal.submittedAt` existence check prevents repeated appeals.
- **Soft-Delete with Recycle Bin** — Surveys use `deleted` flag, not hard delete. Published surveys with 5+ responses or expired status are protected from permanent deletion for data retention.
- **Array Caps with Pre-Save Hooks** — `creditLedger` (500), `billingHistory` (200), `editHistory` (50), `comments` (200), `reactions` (500/type). Self-trimming prevents the 16MB document limit.
- **Denormalized Counts** — `participantCount` on Survey, `moderationStats` on User. Avoids expensive aggregation on every read.
- **Status Lifecycle State Machines** — Survey: `draft → published → expired`, with `pending_review`, `rejected`, `banned`, `soft-deleted` branches. Blog: similar with `active` instead of `published`.

### Backend Architecture

- **Factory-Pattern Auth Middleware** — `authMiddleware.js` exports a function returning independently testable guards. Each middleware is independently testable.
- **Shared AI Provider Service** — `services/aiProvider.js` centralizes Gemini key rotation, OpenRouter dynamic model selection, OpenCode Zen fallback, and the 3-provider cascade. Imported by `aiInsights.js`, `moderation.js`, and `analyticsRoutes.js`.
- **BullMQ + Redis Expiry Pipeline** — Survey deadlines are scheduled as delayed jobs. Worker aggregates stats + generates AI insights on expiry. Re-schedules all published surveys on server boot.
- **Separation of Concerns** — Routes handle HTTP, services handle business logic (`moderation.js`, `aiInsights.js`), models handle data, jobs handle async work (`surveyExpiry.js`).
- **Graceful Redis Degradation** — Server starts without Redis. Worker + queue disable transparently. No hard dependency.
- **Request ID Propagation** — Every request gets a `req.id` via `crypto.randomUUID()`, propagated to response header `x-request-id`. Enables end-to-end traceability.
- **Startup Health Checks** — Fails fast if `ACCESS_TOKEN_SECRET` or MongoDB connection config is missing.

### Frontend Architecture

- **Lazy-Loaded Routes** — All page components are dynamically imported via `React.lazy()`. Reduces initial bundle size.
- **TanStack React Query v5** — Server state management with automatic cache invalidation, optimistic updates with rollback on mutations.
- **Framer Motion** — Consistent page transitions, staggered list animations, and micro-interactions across all pages.
- **Role-Based Route Guards** — `PrivateRoute`, `AdminRoute`, `SurveyorRoute` components protect routes by role.
- **Axios Interceptor with Auto-Logout** — `useAxiosSecure` reads token fresh from localStorage on every request. 401/403 triggers automatic logout + redirect.
- **SweetAlert2 Confirmations** — Destructive actions require confirmation dialogs. Prevents accidental operations.
- **Responsive Design Patterns** — Mobile-first with `sm:`, `md:`, `lg:` breakpoints. Dashboard sidebar collapses on mobile. Filter drawers slide in on small screens.

### AI Integration

- **3-Provider Fallback Chain** — Gemini (key rotation, up to 10 keys) → OpenRouter (dynamic best free model) → OpenCode Zen (OpenAI-compatible). Sequential, not parallel.
- **Key Rotation** — Gemini keys are tried in sequence. 429/quota errors trigger automatic fallback to next key.
- **Dynamic Model Selection** — OpenRouter's best free model is fetched via API, cached for 1 hour. No hardcoded model ID.
- **Gated AI Insight Generation** — `aiInsight.autoGenerate` flag per survey. Stats are always aggregated (for charts), but expensive AI calls only run when the user opts in.
- **User Preference Seeding** — `User.autoAIInsight` boolean seeds new survey's `aiInsight.autoGenerate` on creation.
- **Content Moderation Cascade** — Gemini primary, OpenRouter fallback, OpenCode Zen last resort. 45s timeout on fallback providers.
- **Zero-Cost AI Features** — AI insights and AI chat read pre-computed stats. No credits deducted.

### Observability

- **Request ID Propagation** — `req.id` set by middleware, included in audit logs via `lib/audit.js`.
- **Audit Log Model** — Tracks actor email/role/userId, action string, IP, userAgent, requestId.
- **Moderation Stats on User Document** — `reportsResolved`, `surveysReviewed`, `usersModerated`, `totalActions`. Denormalized for fast dashboard reads.
- **Gemini Usage Tracking** — `GeminiUsage` model tracks daily request count and token usage.
- **Structured Console Logging** — `[Moderation]`, `[AI Insights]`, `[AI Chat]` prefixes for easy log filtering.

---

## 📊 Role-Based Access

| Role | Capabilities |
|------|-------------|
| **Guest** | Browse public surveys, submit site feedback |
| **User** | Take surveys, save drafts, react/comment on blogs, purchase credits |
| **Surveyor** | Create/edit/delete surveys and blogs, view feedback inbox, toggle AI insights, access AI chat, manage recycle bin, appeal rejected content |
| **Admin** | Moderate content, resolve reports, view audit logs, issue broadcasts, manage site feedback, ban users |

---

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance
- Redis (optional — server runs without it)
- Firebase project credentials
- Stripe account (for payments)
- Gemini / OpenRouter API keys (for AI features)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd surveyhub

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Configure environment variables
# Backend: .env (MongoDB URI, Firebase config, Stripe keys, JWT secret, AI API keys)
# Frontend: .env (Firebase config, API base URL)

# Start development servers
cd ../backend && nodemon index.js   # Express server on :3000
cd ../frontend && npm run dev  # Vite dev server on :5173
```

---

## 📁 Project Structure

> **Want the full file-by-file breakdown?** See [`FILE_STRUCTURE.md`](FILE_STRUCTURE.md) for the complete directory listing.

```
surveyhub/
├── backend/
│   ├── data/                    # Seed data & fixtures
│   │   ├── moderation-policies.json
│   │   ├── packages.json
│   │   └── fake_*.json          # Test data generators
│   ├── jobs/                    # BullMQ workers & queue setup
│   │   ├── aggregateStats.js    # Response → aiInsight.stats aggregation
│   │   └── surveyExpiry.js      # Delayed jobs for survey deadlines
│   ├── lib/                     # Core utilities
│   │   ├── audit.js             # Audit log helper (wraps AuditLog model)
│   │   ├── creditConfig.js      # CREDIT_COSTS constants + deductCredits()
│   │   └── redis.js             # ioredis connection + waitForReady()
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Factory: verifyToken, verifyAdmin, verifySurveyor, verifyUser
│   │   ├── authRoutes.js        # Placeholder (empty)
│   │   └── requestId.js         # crypto.randomUUID() → req.id
│   ├── models/                  # Mongoose schemas (14 models)
│   │   ├── User.js              # Users with roles, subscription, moderationStats
│   │   ├── Survey.js            # Surveys with aiInsight, moderation, questions
│   │   ├── response.js          # Survey responses (compound unique index)
│   │   ├── Blog.js              # Blogs with comments, reactions, editHistory
│   │   ├── Subscription.js      # Credit wallets with ledger + billing history
│   │   ├── PricingPackage.js    # Credit packages
│   │   ├── Report.js            # Content reports
│   │   ├── SiteFeedback.js      # Site feedback tickets
│   │   ├── AuditLog.js          # Admin audit trail
│   │   ├── GeminiUsage.js       # Daily AI usage tracking
│   │   ├── ModerationPolicy.js  # AI moderation rules
│   │   └── ...
│   ├── routes/                  # Domain-based route barrels
│   │   ├── index.js             # Barrel: exports all domain routers + aliases
│   │   ├── auth/                # POST /sign-up, /login, /upload-avatar
│   │   ├── users/               # user.routes (GET /:email) + profile.routes
│   │   ├── surveys/             # Full CRUD + respond + results + moderation
│   │   ├── blogs/               # Full CRUD + reactions + comments + reports
│   │   ├── admin/               # Admin reports, audit logs, user overview
│   │   ├── payments/            # Stripe checkout + webhook + wallet + packages
│   │   ├── analytics/           # GET /ai-insights, POST /chat
│   │   ├── feedback/            # Site feedback + ImgBB proxy
│   │   ├── usage/               # Gemini usage stats
│   │   └── homepages/           # guest / user / surveyor / admin home data
│   ├── scripts/                 # Seed & fix scripts
│   │   ├── seed-*.js            # Database seeding
│   │   └── fix-*.js            # Data migration scripts
│   ├── services/                # Business logic
│   │   ├── aiProvider.js        # Gemini → OpenRouter → OpenCode Zen cascade
│   │   ├── aiInsights.js        # AI-powered survey analytics
│   │   └── moderation.js        # AI content moderation
│   ├── validations/
│   │   ├── schemas.js           # Zod schemas for all inputs
│   │   └── validate.js          # Express middleware wrapper
│   ├── index.js                 # Express app entry point
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── assets/              # Static assets (images, icons)
│       ├── Components/
│       │   ├── Shared/          # Survey-related shared components
│       │   ├── Surveys/         # Survey interaction components
│       │   └── UI/              # Reusable UI primitives
│       │       ├── BlogCard.jsx
│       │       ├── MarkdownRenderer.jsx
│       │       ├── LoadingSpinner.jsx
│       │       ├── PageTransition.jsx
│       │       ├── ReportModal.jsx
│       │       ├── StatCard.jsx
│       │       ├── SurveyCard.jsx
│       │       └── ...
│       ├── Firebase/            # Firebase config
│       ├── Firebase_AuthProvider/ # Auth context provider
│       ├── Hooks/               # Custom React hooks (14 hooks)
│       │   ├── useAxiosSecure.jsx   # Axios interceptor with auto-logout
│       │   ├── useProfile.jsx       # User profile query
│       │   ├── useBlogs.jsx         # Blog infinite query
│       │   ├── useBlogsMutation.js  # Blog create/update/delete
│       │   ├── useSurveys.jsx       # Survey queries
│       │   ├── useSurveysMutation.js# Survey mutations
│       │   └── ...
│       ├── Layout/
│       │   ├── MainLayout.jsx      # Public layout (navbar + footer)
│       │   └── DashboardLayout.jsx # Dashboard sidebar layout
│       ├── Pages/
│       │   ├── Auth/           # Login, SignUp
│       │   ├── Home/           # GuestHome, UserHome, SurveyorHome, AdminHome
│       │   ├── Surveys/        # SurveysPage, SurveyDetailPage, SurveyResults
│       │   ├── Blogs/          # BlogsPage, BlogDetailPage, BlogCommentReply
│       │   ├── Payment/        # PricingPage, PaymentSuccessPage
│       │   ├── Feedback/       # FeedbackPage
│       │   ├── Dashboard/
│       │   │   ├── Dashboard.jsx       # Entry redirect
│       │   │   ├── DashboardSection.jsx# Lazy-loaded section resolver
│       │   │   ├── User/Components/    # UserOverview, ParticipationLedger, etc.
│       │   │   ├── Surveyor/Components/# CreateSurvey, MySurveys, AiAnalytics, etc.
│       │   │   ├── Admin/Components/   # AdminOverview, Moderation, AuditLogs, etc.
│       │   │   └── Shared/            # MyProfile, ProfileSettings
│       │   ├── NotFoundPage.jsx
│       │   └── BlankPage.jsx
│       ├── Router/
│       │   ├── Routes.jsx       # createBrowserRouter config
│       │   ├── lazyPages.js     # Lazy-loaded page imports
│       │   ├── PrivateRoute.jsx # Auth guard
│       │   ├── AdminRoute.jsx   # Admin role guard
│       │   ├── SurveyorRoute.jsx# Surveyor role guard
│       │   └── UserRoute.jsx    # User role guard
│       ├── main.jsx
│       └── index.css            # Tailwind + CSS variables
│
├── Reports/                     # Project documentation
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE_DECISIONS.md
│   ├── DESIGN_Prompt.md
│   ├── FEATURES.md
│   └── SYSTEM_DESIGN_REVIEW.md
│
├── TODO.md
└── README.md
```

---

## 📝 License

This project was built for educational and portfolio purposes.

---

> **Built with curiosity, persistence, and a lot of console.log() debugging.**
