# 📊 SurveyHub

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Site-blue?style=for-the-badge)](https://practice-2-firebase.web.app/)

> SurveyHub is a comprehensive, full-stack survey management platform designed to facilitate survey creation, voting, and real-time result analysis. Built with a robust Role-Based Access Control (RBAC) system, it empowers users to gather feedback, conduct market research, and engage communities effectively.

---

## 🎯 Key Features

SurveyHub implements a secure, role-based architecture to provide tailored experiences for different types of users:

**🟢 Regular Users**

- **Authentication:** Secure login/registration via Email or Google Sign-In (Firebase).
- **Engagement:** Browse featured surveys, vote on active polls, and leave comments.
- **Analytics:** View real-time distributions of votes via interactive charts after participating.

**🔵 Surveyors (Creators)**

- **Dashboard Management:** Dedicated portal to create, edit, and manage custom surveys.
- **Audience Interaction:** Track user reviews and interact with participants on their own surveys.
- **Admin Feedback:** View moderation statuses and feedback from platform administrators.

**🔴 Administrators**

- **User Management:** Promote users to Surveyors or Admins, managing the platform's hierarchy.
- **Content Moderation:** Approve, publish, or reject pending surveys submitted by Surveyors.
- **Platform Analytics:** Access high-level statistics, participation rates, and graphical data representing platform health.

---

## 💻 Tech Stack

**Frontend**

- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS, DaisyUI
- **Routing & State:** React Router DOM, TanStack Query (React Query)
- **Data Visualization:** Recharts

**Backend**

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** Firebase (Client) & JWT (Server)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js installed on your machine
- MongoDB instance (local or Atlas)
- Firebase Project setup

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/SurveyHub.git
   cd SurveyHub
   ```

2. **Setup Server**

   ```bash
   cd surveyhubserver
   npm install
   ```

   *Create a `.env` file in the `surveyhubserver` directory and add your environment variables (MongoDB URI, JWT Secret).*

3. **Setup Client**

   ```bash
   cd ../clientSide
   npm install
   ```

   *Create a `.env.local` file in the `clientSide` directory and add your Firebase config.*

4. **Run the Application**
   - Start Backend: `nodemon index.js` (inside `surveyhubserver`)
   - Start Frontend: `npm run dev` (inside `clientSide`)

---

<!-- ## 📸 Screenshots

*(Replace this text with high-quality screenshots of your application. Include the Homepage, the Dashboard, and the Analytics charts to impress recruiters!)* -->

> **Note for Recruiters:** To fully explore the dashboard functionalities, Admin or Surveyor access is required. Please feel free to reach out if you would like me to provide you with test credentials.
