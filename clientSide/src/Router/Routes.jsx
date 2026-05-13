import { createBrowserRouter } from "react-router";
import Login from "../Pages/Auth/Login";
import SignUp from "../Pages/Auth/SignUp";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  }
]);

export default Router;
