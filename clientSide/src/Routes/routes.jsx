import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../ErrorPage/ErrorPage";
import Layout from "../Layout/Layout";
import Home from "../Pages/HomePage/Home/Home";
import Login from "../Pages/Login&Registration/Login";
import Registration from "../Pages/Login&Registration/Registration";
import DashboardLayout from "../Layout/DashboardLayout";
import Dashboard from "../Pages/Dashboardpages/Dashboard/Dashboard";
import Surveys from "../Pages/Surveys/Surveys";
import ManageUsers from "../Pages/Dashboardpages/AdminPages/ManageUsers";
import ManageSuveyStatus from "../Pages/Dashboardpages/AdminPages/ManageSuveyStatus";
import CreateSurvey from "../Pages/Dashboardpages/Dashboard/CreateSurvey";
import Payment from "../Pages/Payment Page/Payment";
import SurveyDetails from "../Components/SurveyDetails/SurveyDetails";
import PrivateRoute from "./PrivateRoute";
import AdminRoutes from "./AdminRoutes";
import Statistics from "@/Pages/Dashboardpages/AdminPages/Statistics";
import AdminFeedbacks from "@/Pages/Dashboardpages/Dashboard/AdminFeedbacks";
import UserFeedback from "@/Pages/Dashboardpages/Dashboard/UserFeedback";


const routes = createBrowserRouter([
    {
        path: '/',
        element: <Layout></Layout>,
        errorElement:<ErrorPage></ErrorPage>,
        children: [
            {
                path: '/',
                element: <Home></Home>,
            },
            {
                path: '/login',
                element: <Login></Login>
            },
            {
                path: '/registration',
                element: <Registration></Registration>
            },
            {
                path: '/surveys',
                element: <Surveys></Surveys>
            },
            {
                path: '/payment',
                element: <Payment></Payment>
            },
            {
                path: '/surveys/:id',
                element: <PrivateRoute><SurveyDetails></SurveyDetails></PrivateRoute>,
                loader: ({params}) => fetch(`https://surveyhubserver.vercel.app/surveys/${params.id}`)
            }
        ]
    },
    {
        path: '/dashboard',
        element: <DashboardLayout></DashboardLayout>,
        errorElement:<ErrorPage></ErrorPage>,
        children: [
            {
                path: '/dashboard',
                element: <Dashboard></Dashboard>
            },
            {
                path: 'manageusers',
                element: <AdminRoutes><ManageUsers></ManageUsers></AdminRoutes>
            },
            {
                path: 'managesurveystatus',
                element: <PrivateRoute><AdminRoutes><ManageSuveyStatus></ManageSuveyStatus></AdminRoutes></PrivateRoute>
            },
            {
                path: 'statistics',
                element: <AdminRoutes><Statistics></Statistics></AdminRoutes>
            },
            {
                path: 'createsurvey',
                element: <PrivateRoute><CreateSurvey></CreateSurvey></PrivateRoute>
            },
            {
                path: 'userreviews',
                element: <PrivateRoute><UserFeedback></UserFeedback></PrivateRoute>
            },
            {
                path: 'adminfeedback',
                element: <PrivateRoute><AdminFeedbacks></AdminFeedbacks></PrivateRoute>
            }
        ]
    }

])
export default routes