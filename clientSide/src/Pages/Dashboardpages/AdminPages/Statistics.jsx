import CircleChart from "@/Components/Charts/CircleChart";
import HorizontalChart from "@/Components/Charts/HorizontalChart";
import useAxiosSecure from "@/Hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { IoIosPeople } from "react-icons/io";
import { RiSurveyLine } from "react-icons/ri";
import { FaMoneyBillWave } from "react-icons/fa";
import Subtitles from "@/Components/Sectiontitles/Subtitles";

const Statistics = () => {
    const axiosSecure = useAxiosSecure();
    const { data: statistics = [] } = useQuery({
        queryKey: ["statistics"],
        queryFn: async () =>{
            const res = await axiosSecure.get("/admin-statistics");
            return res.data;
        } 
    })
    
    return (
        <div className="p-6 md:p-12 bg-gray-50/50 min-h-screen">
            <Subtitles text={"Platform Statistics & Data"}></Subtitles>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 mt-8">
                {/* Total Surveys Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-brand-500/5 p-6 border border-gray-100 flex flex-col justify-center items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-full pointer-events-none -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-4 text-3xl shadow-sm">
                        <RiSurveyLine />
                    </div>
                    <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Surveys</h1>
                    <p className="text-4xl font-black text-navy-950">{statistics.totalSurveys || 0}</p>
                </div>
                
                {/* Total Users Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-brand-500/5 p-6 border border-gray-100 flex flex-col justify-center items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-ocean-50 rounded-bl-full pointer-events-none -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="w-16 h-16 rounded-full bg-ocean-100 text-ocean-600 flex items-center justify-center mb-4 text-3xl shadow-sm">
                        <IoIosPeople />
                    </div>
                    <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</h1>
                    <p className="text-4xl font-black text-navy-950">{statistics.totalUsers || 0}</p>
                </div>
                
                {/* Average Participations Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-brand-500/5 p-6 border border-gray-100 flex flex-col justify-center items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full pointer-events-none -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4 text-3xl shadow-sm">
                        <IoIosPeople />
                    </div>
                    <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Avg Participation</h1>
                    <div className="flex items-end">
                        <p className="text-4xl font-black text-navy-950">{statistics.avgParticipation || 0}</p>
                        <span className="text-gray-400 text-sm font-semibold mb-1 ml-1 tracking-widest">/SURVEY</span>
                    </div>
                </div>
                
                {/* Total Revenue Card */}
                 <div className="bg-white rounded-2xl shadow-xl shadow-brand-500/5 p-6 border border-gray-100 flex flex-col justify-center items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-danger-50 rounded-bl-full pointer-events-none -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="w-16 h-16 rounded-full bg-danger-100 text-danger-600 flex items-center justify-center mb-4 text-3xl shadow-sm">
                        <FaMoneyBillWave />
                    </div>
                    <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</h1>
                    <p className="text-4xl font-black text-navy-950">0$</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center bg-white rounded-2xl shadow-xl shadow-brand-500/5 border border-gray-100 p-8">
             <div className="w-full h-full flex justify-center items-center border border-gray-100 rounded-2xl p-4 bg-gray-50/30">
                 <HorizontalChart data={statistics}></HorizontalChart>
             </div>
             <div className="w-full h-full flex justify-center items-center border border-gray-100 rounded-2xl p-4 bg-gray-50/30">
                 <CircleChart data={statistics}></CircleChart>
             </div>
            </div>
        </div>
    );
};

export default Statistics;