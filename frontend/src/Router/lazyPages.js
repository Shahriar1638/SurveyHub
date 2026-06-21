import { lazy } from "react";

export const Login = lazy(() => import("../Pages/Auth/Login"));
export const SignUp = lazy(() => import("../Pages/Auth/SignUp"));
export const Home = lazy(() => import("../Pages/Home/Home"));
export const SurveysPage = lazy(() => import("../Pages/Surveys/SurveysPage"));
export const FeedbackPage = lazy(() => import("../Pages/Feedback/FeedbackPage"));
export const BlogsPage = lazy(() => import("../Pages/Blogs/BlogsPage"));
export const BlogDetailPage = lazy(() => import("../Pages/Blogs/BlogDetailPage"));
export const SurveyDetailPage = lazy(() => import("../Pages/Surveys/SurveyDetailPage"));
export const SurveyResults = lazy(() => import("../Pages/Surveys/SurveyResults"));
export const PricingPage = lazy(() => import("../Pages/Payment/PricingPage"));
export const PaymentSuccessPage = lazy(() => import("../Pages/Payment/PaymentSuccessPage"));
export const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard"));
export const NotFoundPage = lazy(() => import("../Pages/NotFoundPage"));
