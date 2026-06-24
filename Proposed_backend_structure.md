# Proposed backend structure for SurveyHub 2.0

backend/
├── index.js                          # ~60 lines: just bootstrap
├── routes/
│   ├── index.js                      # barrel: mounts all domain routers
│   ├── auth/
│   │   ├── auth.routes.js            # POST sign-up, login, upload-avatar
│   │   └── index.js                  # exports router
│   ├── users/
│   │   ├── user.routes.js            # GET /:email
│   │   ├── profile.routes.js         # GET/PATCH /me, stats, auto-ai-insight
│   │   └── index.js                  # mounts child routers
│   ├── surveys/
│   │   ├── survey.routes.js          # CRUD + respond + results + moderation
│   │   ├── analytics.routes.js       # AI insights + chat
│   │   └── index.js                  # mounts child routers
│   ├── blogs/
│   │   ├── blog.routes.js            # CRUD + reactions + comments + reports
│   │   └── index.js
│   ├── homepages/
│   │   ├── guestHome.routes.js
│   │   ├── userHome.routes.js
│   │   ├── surveyorHome.routes.js
│   │   ├── adminHome.routes.js
│   │   └── index.js                  # mounts all 4
│   ├── admin/
│   │   ├── dashboard.routes.js       # reports, audit, broadcast
│   │   └── index.js
│   ├── payments/
│   │   ├── payment.routes.js         # Stripe checkout + webhook
│   │   ├── package.routes.js         # Pricing packages
│   │   └── index.js
│   ├── feedback/
│   │   ├── feedback.routes.js        # Site feedback + ImgBB
│   │   └── index.js
│   └── usage/
│       ├── usage.routes.js           # Gemini usage stats
│       └── index.js
├── models/
│   ├── User.js                       # unchanged (User + Activity + AuditLog)
│   ├── Survey.js                     # unchanged (Survey + Response)
│   ├── Blog.js                       # unchanged (Blog + comments)
│   ├── Subscription.js               # unchanged (Subscription + billing)
│   ├── PricingPackage.js             # unchanged
│   └── index.js                      # barrel: re-exports all models
├── services/
│   ├── ai/
│   │   ├── provider.js               # shared Gemini→OpenRouter→OpenCode chain
│   │   ├── insights.js               # AI analytics
│   │   ├── moderation.js             # content moderation
│   │   └── index.js
│   └── index.js
├── middlewares/
│   ├── auth.js                       # verifyToken, verifyAdmin, etc. (renamed)
│   ├── requestId.js                  # unchanged
│   └── index.js                      # barrel
├── lib/
│   ├── redis.js
│   ├── audit.js
│   ├── creditConfig.js
│   └── index.js                      # barrel
├── jobs/
│   ├── aggregateStats.js
│   ├── surveyExpiry.js
│   └── index.js
├── validations/
│   ├── schemas.js
│   ├── validate.js
│   └── index.js
└── scripts/

