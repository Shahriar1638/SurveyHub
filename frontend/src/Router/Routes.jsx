import { createBrowserRouter } from "react-router";
import MainLayout from "../Layout/MainLayout";
import Login from "../Pages/Auth/Login";
import SignUp from "../Pages/Auth/SignUp";
import Home from "../Pages/Home/Home";
import PrivateRoute from "./PrivateRoute";
import SurveysPage from "../Pages/Surveys/SurveysPage";
import ProfilePage from "../Pages/Profile/ProfilePage";
import FeedbackPage from "../Pages/Feedback/FeedbackPage";
import BlogsPage from "../Pages/Blogs/BlogsPage";
import BlogDetailPage from "../Pages/Blogs/BlogDetailPage";
import SurveyDetailPage from "../Pages/Surveys/SurveyDetailPage";

const Router = createBrowserRouter([
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
]);

export default Router;
