/* eslint-disable react/prop-types */
import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";
import useAdmin from "@/Hooks/useAdmin";
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

const AdminRoutes = ({children}) => {
    const { user, loading } = useContext(AuthContext);
    const [isAdmin, isAdminLoading] = useAdmin();
    const location = useLocation();

    if(loading || isAdminLoading){
        return <div className="flex flex-col justify-center items-center relative h-[80vh]"><span className="loading loading-spinner loading-lg absolute top-1/2 bottom-1/2 left-1/2 right-1/2"></span></div>
    }

    if (user && isAdmin) {
        return children;
    }
    return <Navigate to="/login" state={{from: location}} replace></Navigate>
};

export default AdminRoutes;