import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Firebase AuthProvider/AuthProvider";


// eslint-disable-next-line react/prop-types
const PrivateRoute = ({children}) => {
    const { user, loading } = useContext(AuthContext)
    const location = useLocation()
    if(loading) {
        return <div className="flex flex-col justify-center items-center relative h-[80vh]"><span className="loading loading-spinner loading-lg absolute top-1/2 bottom-1/2 left-1/2 right-1/2"></span></div>
    }
    if(user) {
        return children
    }
    return (
        <Navigate state={location.pathname} to={`/login`}></Navigate>
    );
};

export default PrivateRoute;