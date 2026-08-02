# SurveyHub - File Structure

## Root

```
SurveyHub/
├── .agents/                    # Agent skills & configs
├── .git/                       # Git repository
├── .gitignore
├── BackUp/                     # Backup of old frontend
├── Reports/                    # Documentation & design docs
├── backend/                    # Node.js/Express backend
├── frontend/                   # React (Vite) frontend
├── README.md
├── skills-lock.json
└── start.txt
```

---

## Frontend (`frontend/`)

```
frontend/
├── .env.local                  # Environment variables
├── .firebase/                  # Firebase hosting cache
├── .firebaserc                 # Firebase project config
├── .gitignore
├── dist/                       # Build output
│   ├── assets/                 # Compiled JS/CSS bundles
│   ├── favicon.svg
│   ├── icons.svg
│   ├── index.html
│   └── *.png                   # Static images
├── eslint.config.js
├── firebase.json               # Firebase hosting config
├── index.html                  # Entry HTML
├── Issues/                     # Issue screenshots
│   ├── login page ss.png
│   ├── prompt.png
│   └── signup pagee ss.png
├── package.json
├── package-lock.json
├── public/                     # Static assets
│   ├── edited-photo.png
│   ├── favicon.svg
│   ├── icons.svg
│   ├── surveyor-hero.png
│   ├── surveyor-hero-removebg-preview.png
│   └── user-hero.png
├── src/
│   ├── assets/                 # Images & static resources
│   │   ├── entertainment.jpg
│   │   ├── google.png
│   │   ├── howitworks.jpg
│   │   ├── laptop on desk.jpg
│   │   ├── laptop on a table 2.jpg
│   │   ├── logo.png
│   │   ├── logo.svg
│   │   ├── statistics paper on table.png
│   │   └── technology.jpg
│   ├── Components/
│   │   ├── Shared/             # Shared layout components
│   │   │   ├── Footer.jsx
│   │   │   └── Navbar.jsx
│   │   ├── Surveys/            # Survey-specific components
│   │   │   ├── CheckboxQuestion.jsx
│   │   │   ├── LinearScale.jsx
│   │   │   ├── MultipleChoice.jsx
│   │   │   ├── Paragraph.jsx
│   │   │   ├── QuestionRenderer.jsx
│   │   │   ├── ShortAnswer.jsx
│   │   │   ├── SurveyFeedback.jsx
│   │   │   ├── SurveyFeedbackModal.jsx
│   │   │   └── SurveyReport.jsx
│   │   └── UI/                 # Reusable UI components
│   │       ├── BlogCard.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── LoadingSpinner.jsx
│   │       ├── MarkdownRenderer.jsx
│   │       ├── PageTransition.jsx
│   │       ├── ReportModal.jsx
│   │       ├── StatCard.jsx
│   │       └── SurveyCard.jsx
│   ├── Firebase/
│   │   └── firebase.config.js  # Firebase configuration
│   ├── Firebase_AuthProvider/
│   │   └── AuthProvider.jsx    # Auth context provider
│   ├── Hooks/                  # Custom React hooks
│   │   ├── useAxiosPublic.jsx
│   │   ├── useAxiosSecure.jsx
│   │   ├── useBlogs.jsx
│   │   ├── useBlogsMutation.js
│   │   ├── useDashboardAdmin.jsx
│   │   ├── useDashboardSurveyor.jsx
│   │   ├── useDashboardUser.jsx
│   │   ├── useGeminiUsage.js
│   │   ├── useMySurveys.js
│   │   ├── useProfile.jsx
│   │   ├── useProfileData.jsx
│   │   ├── useSurveyDetail.jsx
│   │   ├── useSurveys.jsx
│   │   └── useSurveysMutation.js
│   ├── index.css               # Global styles
│   ├── Layout/                 # Layout wrappers
│   │   ├── DashboardLayout.jsx
│   │   └── MainLayout.jsx
│   ├── main.jsx                # App entry point
│   ├── Pages/
│   │   ├── Auth/               # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   └── SignUp.jsx
│   │   ├── BlankPage.jsx
│   │   ├── Blogs/              # Blog pages
│   │   │   ├── BlogCards.jsx
│   │   │   ├── BlogCommentReply.jsx
│   │   │   ├── BlogDetailPage.jsx
│   │   │   └── BlogsPage.jsx
│   │   ├── Dashboard/          # Dashboard pages
│   │   │   ├── Admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── Components/
│   │   │   │   │   ├── AdminModeration.jsx
│   │   │   │   │   ├── AdminOverview.jsx
│   │   │   │   │   ├── AdminReports.jsx
│   │   │   │   │   ├── AuditLogs.jsx
│   │   │   │   │   ├── BlogTable.jsx
│   │   │   │   │   ├── BroadcastControl.jsx
│   │   │   │   │   ├── ContentModerationQueue.jsx
│   │   │   │   │   ├── ContentReviewModal.jsx
│   │   │   │   │   ├── FeedbackManagement.jsx
│   │   │   │   │   ├── ModerationShared.jsx
│   │   │   │   │   ├── ReportsTable.jsx
│   │   │   │   │   ├── SurveyReviewModal.jsx
│   │   │   │   │   └── SurveyTable.jsx
│   │   │   │   ├── FeedbackSidePanel.jsx
│   │   │   │   └── ReportSidePanel.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DashboardSection.jsx
│   │   │   ├── Shared/
│   │   │   │   ├── MyProfile.jsx
│   │   │   │   └── ProfileSettings.jsx
│   │   │   ├── Surveyor/
│   │   │   │   ├── Components/
│   │   │   │   │   ├── AiAnalytics.jsx
│   │   │   │   │   ├── AiChat.jsx
│   │   │   │   │   ├── BlogStudio.jsx
│   │   │   │   │   ├── CreateBlog.jsx
│   │   │   │   │   ├── CreateSurvey.jsx
│   │   │   │   │   ├── FeedbackInbox.jsx
│   │   │   │   │   ├── MySurveys.jsx
│   │   │   │   │   ├── RecycleBin.jsx
│   │   │   │   │   └── SurveyorOverview.jsx
│   │   │   │   └── SurveyorDashboard.jsx
│   │   │   └── User/
│   │   │       ├── Components/
│   │   │       │   ├── ParticipationLedger.jsx
│   │   │       │   ├── UserOverview.jsx
│   │   │       │   ├── UserReports.jsx
│   │   │       │   └── UserSupport.jsx
│   │   │       └── UserDashboard.jsx
│   │   ├── Feedback/
│   │   │   └── FeedbackPage.jsx
│   │   ├── Home/               # Home pages by role
│   │   │   ├── AdminHome.jsx
│   │   │   ├── GuestHome.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── SurveyorHome.jsx
│   │   │   └── UserHome.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── Payment/            # Payment pages
│   │   │   ├── PaymentSuccessPage.jsx
│   │   │   └── PricingPage.jsx
│   │   └── Surveys/            # Survey pages
│   │       ├── SurveyDetailPage.jsx
│   │       ├── SurveyResults.jsx
│   │       └── SurveysPage.jsx
│   └── Router/                 # Route definitions
│       ├── AdminRoute.jsx
│       ├── lazyPages.js
│       ├── PrivateRoute.jsx
│       ├── Routes.jsx
│       ├── SurveyorRoute.jsx
│       └── UserRoute.jsx
└── vite.config.js              # Vite build config
```

---

## Backend (`backend/`)

```
backend/
├── .dockerignore
├── .env.local                  # Environment variables
├── .gitignore
├── data/                       # Seed/mock data
│   ├── fake_blogs.json
│   ├── fake_responses.json
│   ├── fake_surveys.json
│   ├── generate_responses.js
│   ├── moderation-policies.json
│   ├── packages.json
│   └── temp.json
├── Dockerfile
├── index.js                    # App entry point
├── jobs/                       # Background jobs
│   ├── aggregateStats.js
│   └── surveyExpiry.js
├── lib/                        # Shared utilities
│   ├── audit.js
│   ├── creditConfig.js
│   └── redis.js
├── middlewares/                 # Express middleware
│   ├── authMiddleware.js
│   ├── authRoutes.js
│   └── requestId.js
├── models/                     # Mongoose models
│   ├── Activity.js
│   ├── AuditLog.js
│   ├── Blog.js
│   ├── GeminiKey.js
│   ├── GeminiUsage.js
│   ├── ModerationPolicy.js
│   ├── PricingPackage.js
│   ├── report.js
│   ├── response.js
│   ├── siteFeedback.js
│   ├── Subscription.js
│   ├── Survey.js
│   ├── surveyFeedBack.js
│   └── User.js
├── package.json
├── package-lock.json
├── routes/                     # API route handlers
│   ├── adminHomeRoutes.js
│   ├── analyticsRoutes.js
│   ├── authRoutes.js
│   ├── blogRoutes.js
│   ├── dashboardRoutes.js
│   ├── feedbackRoutes.js
│   ├── guestHomeRoutes.js
│   ├── packageRoutes.js
│   ├── paymentRoutes.js
│   ├── profileRoutes.js
│   ├── surveyorHomeRoutes.js
│   ├── surveyRoutes.js
│   ├── usageRoutes.js
│   ├── userHomeRoutes.js
│   └── userRoutes.js
├── scripts/                    # Utility scripts
│   ├── fix-dates.js
│   ├── fix-packages.js
│   ├── fix-publishedAt.js
│   ├── fix-surveyorid-types.js
│   ├── seed-dashboard-data.js
│   ├── seed-fake-response.js
│   ├── seed-moderation-policies.js
│   ├── seed-test-survey.js
│   ├── seed-test-surveys.js
│   └── test-moderation.js
├── services/                   # Business logic
│   ├── aiInsights.js
│   ├── aiProvider.js
│   └── moderation.js
├── test-db.js                  # DB connection test
├── validations/                # Request validation
│   ├── schemas.js
│   └── validate.js
└── vercel.json                 # Vercel deployment config
```
