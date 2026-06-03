import { createBrowserRouter } from "react-router";
import MainLayout from "../Layout/MainLayout";
import DashboardLayout from "../Layout/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import DashboardSection from "../Pages/Dashboard/DashboardSection";
import {
  Login,
  SignUp,
  Home,
  SurveysPage,
  ProfilePage,
  FeedbackPage,
  BlogsPage,
  BlogDetailPage,
  SurveyDetailPage,
  PricingPage,
  PaymentSuccessPage,
  Dashboard,
} from "./lazyPages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/surveys",
        element: <SurveysPage />,
      },
      {
        path: "/surveys/:id",
        element: (
          <PrivateRoute>
            <SurveyDetailPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: "/feedback",
        element: <FeedbackPage />,
      },
      {
        path: "/blogs",
        element: <BlogsPage />,
      },
      {
        path: "/blogs/:id",
        element: <BlogDetailPage />,
      },
      {
        path: "/pricing",
        element: <PricingPage />,
      },
      {
        path: "/payment/success",
        element: (
          <PrivateRoute>
            <PaymentSuccessPage />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: ":section", element: <DashboardSection /> },
      { path: "surveys/:id", element: <Dashboard /> },
    ],
  },
]);

export default router;
