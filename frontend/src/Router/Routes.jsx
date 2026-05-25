import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import MainLayout from "../Layout/MainLayout";
const Login = lazy(() => import("../Pages/Auth/Login"));
const SignUp = lazy(() => import("../Pages/Auth/SignUp"));
const Home = lazy(() => import("../Pages/Home/Home"));
import PrivateRoute from "./PrivateRoute";
const SurveysPage = lazy(() => import("../Pages/Surveys/SurveysPage"));
const ProfilePage = lazy(() => import("../Pages/Profile/ProfilePage"));
const FeedbackPage = lazy(() => import("../Pages/Feedback/FeedbackPage"));
const BlogsPage = lazy(() => import("../Pages/Blogs/BlogsPage"));
const BlogDetailPage = lazy(() => import("../Pages/Blogs/BlogDetailPage"));
const SurveyDetailPage = lazy(() => import("../Pages/Surveys/SurveyDetailPage"));
const PricingPage = lazy(() => import("../Pages/Payment/PricingPage"));
const PaymentSuccessPage = lazy(() => import("../Pages/Payment/PaymentSuccessPage"));
const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard"));

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
        element: (
          <PrivateRoute>
            <SurveysPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/surveys/:id",
        element: <SurveyDetailPage />,
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
        <Dashboard />
      </PrivateRoute>
    ),
  },
]);

export default router;
