# SurveyHub Backend Structure

## Tech Stack
- **Express.js** (HTTP server)
- **Mongoose** (MongoDB ODM)
- **MongoDB Atlas** (database)
- **JWT** (authentication)
- **Stripe** (payments)
- **ImgBB** (image uploads)
- **Zod** (validation)

## Directory Layout

```
backend/
├── index.js                          # Express server + MongoDB connect + route mounting
├── vercel.json                       # Vercel deployment config
├── Dockerfile                        # Docker config
├── package.json
│
├── middlewares/
│   ├── authMiddleware.js             # JWT + role verification (verifyToken, verifyAdmin, verifySurveyor, verifyUser, verifySurveyorOrAdmin)
│   ├── authRoutes.js                 # POST /jwt — token generation
│   └── requestId.js                  # UUID request tracing middleware
│
├── routes/
│   ├── authRoutes.js                 # POST /sign-up, /login, /upload-avatar
│   ├── surveyRoutes.js               # Survey CRUD, respond, feedback
│   ├── blogRoutes.js                 # Paginated blogs, reactions, comments/replies
│   ├── profileRoutes.js              # GET/PATCH /me, stats
│   ├── userRoutes.js                 # GET user by email
│   ├── feedbackRoutes.js             # Site feedback + ImgBB proxy
│   ├── paymentRoutes.js              # Stripe checkout, webhook, wallet, verify-session
│   ├── dashboardRoutes.js            # Admin reports/audit/broadcast, user overview/participation/reports/support
│   ├── guestHomeRoutes.js            # Stats, featured surveys, AI spotlight
│   ├── userHomeRoutes.js             # Recommended surveys, trending, recent blogs
│   ├── surveyorHomeRoutes.js         # KPIs, published/draft surveys, blog activity
│   └── adminHomeRoutes.js            # Platform health, pending reports, revenue
│
├── models/
│   ├── User.js                       # User document (email, role, status, moderationStats)
│   ├── Survey.js                     # Survey + questions[] + aiInsight{}
│   ├── Blog.js                       # Blog + reactions{} + comments/replies
│   ├── Subscription.js               # Credit wallet + ledger + billing history
│   ├── response.js                   # Survey responses
│   ├── report.js                     # User reports (surveys)
│   ├── feedback.js                   # Survey feedback
│   ├── siteFeedback.js               # Site-wide feedback/support tickets
│   ├── AuditLog.js                   # Admin audit logs
│   └── Activity.js                   # Activity tracking
│
├── lib/
│   └── audit.js                      # Audit log helpers
│
├── scripts/                          # Utility scripts
├── data/                             # Seed data
└── test-db.js                        # DB connection test
```

## API Route Map

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| **Auth** | | | |
| POST | `/jwt` | None | Generate JWT token |
| POST | `/api/auth/sign-up` | None | Register new user |
| POST | `/api/auth/login` | None | Login (returns JWT) |
| POST | `/api/auth/upload-avatar` | None | Upload avatar to ImgBB |
| **Surveys** | | | |
| GET | `/api/surveys` | None | List surveys (sort, filter, search, pagination) |
| GET | `/api/surveys/:id` | None | Get single survey |
| POST | `/api/surveys/:id/respond` | Token | Submit/draft response (upsert) |
| GET | `/api/surveys/:id/my-response` | Token | Get user's existing response |
| POST | `/api/surveys/:id/feedback` | Token | Submit survey feedback |
| **Blogs** | | | |
| GET | `/api/blogs` | None | Paginated blog feed |
| GET | `/api/blogs/:id` | None | Single blog with comments |
| POST | `/api/blogs/:id/react` | Token | Toggle reaction (one per user) |
| POST | `/api/blogs/:id/comments` | Token | Add comment |
| POST | `/api/blogs/:id/comments/:commentId/replies` | Token | Add reply to comment |
| **Profile** | | | |
| GET | `/api/profile/me` | Token | Get current user profile |
| PATCH | `/api/profile/me` | Token | Update profile fields |
| GET | `/api/profile/stats` | Token | Role-specific stats |
| GET | `/api/profile/recent-actions` | Token | Admin recent actions |
| **Users** | | | |
| GET | `/api/users/:email` | Token | Get user by email |
| **Feedback** | | | |
| POST | `/api/feedback/upload` | None | Proxy image upload to ImgBB |
| POST | `/api/feedback` | None | Submit site feedback |
| GET | `/api/feedback` | Admin | List all feedback |
| PATCH | `/api/feedback/:id` | Admin | Update feedback status |
| **Payments** | | | |
| POST | `/api/payments/create-checkout-session` | Token | Create Stripe checkout |
| POST | `/api/payments/webhook` | None | Stripe webhook (raw body) |
| GET | `/api/payments/wallet/:userId` | Token | Get credit wallet |
| GET | `/api/payments/verify-session/:sessionId` | Token | Confirm payment completion |
| **Dashboard** | | | |
| GET | `/api/dashboard/admin/reports` | Admin | Paginated reports |
| PATCH | `/api/dashboard/admin/reports/:id` | Admin | Update report status |
| GET | `/api/dashboard/admin/audit-logs` | Admin | Paginated audit logs |
| POST | `/api/dashboard/admin/broadcast` | Admin | Create platform announcement |
| GET | `/api/dashboard/user/overview` | User | User dashboard stats |
| GET | `/api/dashboard/user/participation` | User | Participation ledger |
| GET | `/api/dashboard/user/reports` | User | User's submitted reports |
| GET | `/api/dashboard/user/support` | User | User's support tickets |
| **Homepages** | | | |
| GET | `/api/homepages/guest` | None | Stats, featured surveys, AI spotlight |
| GET | `/api/homepages/user` | User | Recommended surveys, trending, blogs |
| GET | `/api/homepages/surveyor` | Surveyor | KPIs, published/draft surveys, blog activity |
| GET | `/api/homepages/admin` | Admin | Platform health, pending reports, revenue |

## Middleware Stack

```
Request
  ↓
CORS (localhost:5173, localhost:5174, production domains)
  ↓
express.json() (skipped for /api/payments/webhook — raw body for Stripe)
  ↓
Route-specific middleware:
  ├── verifyToken     → JWT decode, sets req.user / req.decoded
  ├── verifyAdmin     → Checks role === 'admin' + not banned
  ├── verifySurveyor  → Checks role === 'surveyor' + not banned
  ├── verifyUser      → Checks role === 'user' + not banned
  └── verifySurveyorOrAdmin → Either surveyor or admin + not banned
```

## Database Models

### User
```
email, name, role (admin|user|surveyor), status (active|banned),
avatar, coverPhoto, bio, location, occupation, socialLinks,
subscription {plan, status, autoRenew, provider, providerCustomerId},
preferences [String], autoAIInsight Boolean,
moderationStats {reportsResolved, surveysReviewed, usersModerated, totalActions}
```

### Survey
```
surveyorId → User, title, description, useCase,
questions [{id, label, type (short_answer|paragraph|multiple_choice|checkbox|linear_scale), options [], required}],
status (draft|published|expired|banned), publishedAt, category,
participantCount, deadline, image,
aiInsight {enabled, autoGenerate, status (idle|pending|ready|failed),
           stats {totalResponses, perQuestion []}, summary, keyFindings [], recommendations [], modelInfo}
```

### Blog
```
surveyId → Survey, surveyorEmail, status (active|banned),
title, content (markdown/HTML),
reactions {like [], insightful [], disagree [], interesting [], funny []},
comments [{userEmail, text, replies [{userEmail, text}]}]
```

### Subscription (Credit Wallet)
```
userId → User (unique), providerCustomerId,
balance, totalPurchased, totalSpent,
creditLedger [{type (purchase|survey_creation|ai_analysis|refund|bonus), credits, surveyId, description, occurredAt}],
billingHistory [{eventType (purchase|refund), amount, currency, creditsTransacted, providerPaymentIntentId, occurredAt}]
```

### Other Models
- **Response** — Survey answers (userId, surveyId, answers[], status: draft|submitted)
- **Report** — User reports on surveys (reporterEmail, surveyId, reason, status)
- **Feedback** — Survey-specific feedback (userEmail, surveyId, rating, comment)
- **SiteFeedback** — Site-wide support tickets (userEmail, feedbackType, comment, attachments[], status)
- **AuditLog** — Admin action audit trail (actor, action, resource, resourceId, detail)
- **Activity** — Activity tracking

## Credit Packages (Stripe)

| Package | Credits | Price (USD) |
|---------|---------|-------------|
| Starter | 20 | $19 |
| Growth | 50 | $39 |
| Pro | 110 | $79 |
| Enterprise | 250 | $159 |
