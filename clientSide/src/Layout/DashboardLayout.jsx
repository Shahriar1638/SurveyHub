import { Outlet } from "react-router-dom";
import Sidebar from "../Pages/Shared/Dashboardsidebar/Sidebar";

const DashboardLayout = () => {
    return (
        <div className=" bg-[#0DD3FA]">
            <h1 className="text-5xl font-extrabold text-center py-12 uppercase">dashboard</h1>
            <div className="flex">           
                <div className="w-96 ml-20">
                    <Sidebar></Sidebar>
                </div>
                <div className="px-10 py-6 bg-white rounded-tl-2xl w-full">
                    <Outlet></Outlet>
                </div>            
            </div>
        </div>
    );
};

export default DashboardLayout;