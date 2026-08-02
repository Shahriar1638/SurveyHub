# SurveyHub Frontend Structure

## Tech Stack
- **React 19** + Vite
- **TanStack Query** (data fetching/caching)
- **react-router v7** (routing)
- **Firebase Auth** (authentication + JWT)
- **Axios** (HTTP client)
- **Framer Motion** (animations)
- **Heroicons** (icons)
- **Tailwind CSS v4** (styling)

## Directory Layout

```
frontend/src/
├── main.jsx                          # Entry point: React Query + AuthProvider + Router
├── index.css                         # Tailwind v4 config + design system tokens
│
├── Router/
│   ├── Routes.jsx                    # Route definitions (public + dashboard)
│   ├── lazyPages.js                  # Lazy-loaded page components
│   └── PrivateRoute.jsx              # Auth guard (login required)
│
├── Layout/
│   ├── MainLayout.jsx                # Public layout (Navbar + Footer)
│   └── DashboardLayout.jsx           # Dashboard layout (role-based sidebar + nav)
│
├── Pages/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── SignUp.jsx
│   │
│   ├── Home/
│   │   ├── Home.jsx                  # Router: renders role-based home
│   │   ├── GuestHome.jsx
│   │   ├── UserHome.jsx
│   │   ├── SurveyorHome.jsx
│   │   └── AdminHome.jsx
│   │
│   ├── Surveys/
│   │   ├── SurveysPage.jsx           # Public survey explorer
│   │   └── SurveyDetailPage.jsx      # Survey response page
│   │
│   ├── Blogs/
│   │   ├── BlogsPage.jsx             # Public insights/blog feed
│   │   ├── BlogCards.jsx             # Card rendering
│   │   ├── BlogDetailPage.jsx        # Full blog post view
│   │   └── BlogCommentReply.jsx      # Comment threads
│   │
│   ├── Dashboard/
│   │   ├── Dashboard.jsx             # Router: renders role-based dashboard
│   │   ├── DashboardSection.jsx      # Section router (/:section)
│   │   │
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ReportSidePanel.jsx
│   │   │   └── Components/
│   │   │       ├── AdminOverview.jsx
│   │   │       ├── AdminModeration.jsx
│   │   │       ├── AuditLogs.jsx
│   │   │       ├── BroadcastControl.jsx
│   │   │       └── FeedbackManagement.jsx
│   │   │
│   │   ├── Surveyor/
│   │   │   ├── SurveyorDashboard.jsx
│   │   │   └── Components/
│   │   │       ├── SurveyorOverview.jsx
│   │   │       ├── MySurveys.jsx
│   │   │       ├── AiAnalytics.jsx
│   │   │       ├── BlogStudio.jsx
│   │   │       └── FeedbackInbox.jsx
│   │   │
│   │   └── User/
│   │       ├── UserDashboard.jsx
│   │       └── Components/
│   │           ├── UserOverview.jsx
│   │           ├── ParticipationLedger.jsx
│   │           ├── UserReports.jsx
│   │           └── UserSupport.jsx
│   │
│   ├── Profile/
│   │   ├── ProfilePage.jsx           # Router: renders role-based profile
│   │   ├── AdminProfile.jsx
│   │   ├── SurveyorProfile.jsx
│   │   └── UserProfile.jsx
│   │
│   ├── Payment/
│   │   ├── PricingPage.jsx           # Subscription comparison
│   │   └── PaymentSuccessPage.jsx    # Stripe success callback
│   │
│   └── Feedback/
│       └── FeedbackPage.jsx
│
├── Components/
│   ├── Shared/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   │
│   ├── UI/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── StatCard.jsx
│   │   ├── SurveyCard.jsx
│   │   ├── BlogCard.jsx
│   │   └── PageTransition.jsx
│   │
│   └── Surveys/
│       ├── QuestionRenderer.jsx      # Routes to correct question component
│       ├── MultipleChoice.jsx        # MCQ (radio/checkbox)
│       ├── LinearScale.jsx           # Numbered scale buttons
│       ├── Paragraph.jsx             # Long text (textarea)
│       ├── ShortAnswer.jsx           # Short text input
│       ├── CheckboxQuestion.jsx      # Checkbox group
│       └── SurveyFeedback.jsx        # Post-submission feedback
│
├── Hooks/
│   ├── useAxiosPublic.jsx            # Axios instance (no auth)
│   ├── useAxiosSecure.jsx            # Axios instance (JWT interceptor)
│   ├── useSurveys.jsx                # Survey list queries
│   ├── useSurveyDetail.jsx           # Single survey query
│   ├── useBlogs.jsx                  # Blog list queries
│   ├── useProfile.jsx                # Current user profile
│   ├── useProfileData.jsx            # Profile data by ID
│   ├── useDashboardAdmin.jsx         # Admin dashboard data
│   ├── useDashboardSurveyor.jsx      # Surveyor dashboard data
│   └── useDashboardUser.jsx          # User dashboard data
│
├── Firebase_AuthProvider/
│   └── AuthProvider.jsx              # Firebase auth context (login, signup, Google, JWT)
│
├── Firebase/
│   └── firebase.config.js            # Firebase config
│
└── assets/                           # Static images
    ├── logo.svg
    ├── logo.png
    ├── google.png
    └── *.jpg
```

## Route Map

| Path | Component | Guard | Description |
|------|-----------|-------|-------------|
| `/` | `Home` | None | Role-based home (Guest/User/Surveyor/Admin) |
| `/login` | `Login` | None | Login page |
| `/sign-up` | `SignUp` | None | Registration page |
| `/surveys` | `SurveysPage` | None | Public survey explorer |
| `/surveys/:id` | `SurveyDetailPage` | Private | Survey response form |
| `/blogs` | `BlogsPage` | None | Public insights feed |
| `/blogs/:id` | `BlogDetailPage` | None | Full blog post |
| `/pricing` | `PricingPage` | None | Subscription plans |
| `/payment/success` | `PaymentSuccessPage` | Private | Stripe callback |
| `/profile` | `ProfilePage` | Private | Role-based profile |
| `/feedback` | `FeedbackPage` | None | Feedback form |
| `/dashboard` | `Dashboard` | Private | Dashboard home |
| `/dashboard/:section` | `DashboardSection` | Private | Dashboard section view |

## Dashboard Sidebar Navigation

| Role | Sections |
|------|----------|
| **Admin** | Overview, Moderation, Audit Logs, Broadcasts, Feedback |
| **Surveyor** | Overview, My Surveys, AI Analytics, Blog Studio, Feedback Inbox |
| **User** | Overview, Participation Ledger, Report Status, Support Tickets |
