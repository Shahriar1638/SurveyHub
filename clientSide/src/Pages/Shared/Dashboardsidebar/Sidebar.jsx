import { NavLink } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { RiDraftFill } from "react-icons/ri";
import { IoCreateOutline } from "react-icons/io5";
import { GrAnalytics } from "react-icons/gr";
import useAdmin from "@/Hooks/useAdmin";
import useSurveyor from "@/Hooks/useSurveyor";
import { useEffect, useState } from "react";
import { MdRateReview } from "react-icons/md";
import { VscFeedback } from "react-icons/vsc";

const Sidebar = () => {
    const [ loading, setLoading ] = useState(true);
    const [ isAdmin ] = useAdmin();
    const [ isSurveyor ] = useSurveyor();
    useEffect(() => {
        if ((isAdmin === true || isAdmin === false) && (isSurveyor === true || isSurveyor === false)) {
            setLoading(false);
        }
    }, [isAdmin, isSurveyor]);

    if (loading) {
        return <div className="flex flex-col justify-center items-center relative h-[80vh]"><span className="loading loading-spinner loading-lg absolute top-1/2 bottom-1/2 left-1/2 right-1/2"></span></div>
    }
    return (
        <div className="text-white flex flex-col">
            {
                isAdmin && (
                    <>
                        <NavLink className="mb-4" to="/dashboard/manageusers"> <IoIosPeople className="text-xl inline-block mr-2"/>Manage Users</NavLink>
                        <NavLink className="mb-4" to="/dashboard/managesurveystatus"> <RiDraftFill className="text-xl inline-block mr-2"/>Manage Survey Status</NavLink>
                        <NavLink className="mb-4" to="/dashboard/statistics"> <GrAnalytics className="text-xl inline-block mr-2"/>Statistics</NavLink>
                    </>
                )
            }
            {
                isSurveyor && (
                    <>
                        <NavLink className="mb-4" to="/dashboard/createsurvey"> <IoCreateOutline className="text-xl inline-block mr-2" />Create a Survey</NavLink>
                        <NavLink className="mb-4" to="/dashboard/userreviews"> <MdRateReview className="text-xl inline-block mr-2" />User Reviews</NavLink>
                        <NavLink className="mb-4" to="/dashboard/adminfeedback"> <VscFeedback className="text-xl inline-block mr-2" />Admin Feed backs</NavLink>
                    </>
                )
            }
            <NavLink className="mt-4 flex items-center text-lg font-bold px-8 border-2 border-solid uppercase border-white py-3 mr-4" style={{borderRadius:'0.6rem'}} to="/"><FaHome className="inline-block text-xl mr-2"/>Go back Home</NavLink>
        </div>
    );
};

export default Sidebar;