import CircleChart from "@/Components/Charts/CircleChart";
import HorizontalChart from "@/Components/Charts/HorizontalChart";
import useAxiosSecure from "@/Hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { IoIosPeople } from "react-icons/io";
import { RiSurveyLine } from "react-icons/ri";

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
        <div>
            <div className="grid grid-col-1 md:grid-cols-2 lg:grid-cols-4">
                <div style={{borderRadius:'0.75rem'}} className="flex flex-col justify-center items-center bg-white rounded-lg shadow-lg p-4 m-4">
                    <h1 className="text-2xl font-bold uppercase mb-2">Total Surveys</h1>
                    <p className="text-4xl font-bold flex items-center"><RiSurveyLine className="mr-2 text-5xl font-bold"></RiSurveyLine>{statistics.totalSurveys}</p>
                </div>
                <div style={{borderRadius:'0.75rem'}} className="flex flex-col justify-center items-center bg-white rounded-lg shadow-lg p-4 m-4">
                    <h1 className="text-2xl font-bold uppercase mb-2">Total User</h1>
                    <p className="text-4xl font-bold flex items-center"><IoIosPeople className="mr-2 text-5xl font-bold"></IoIosPeople>{statistics.totalUsers}</p>
                </div>
                <div style={{borderRadius:'0.75rem'}} className="flex flex-col justify-center items-center bg-white rounded-lg shadow-lg p-4 m-4">
                    <h1 className="text-2xl font-bold uppercase mb-2">Average Participations</h1>
                    <p className="text-4xl font-bold flex items-center">{statistics.avgParticipation}<IoIosPeople className="ml-2 text-5xl font-bold"></IoIosPeople>/<sub>per survey</sub></p>
                </div>
                <div style={{borderRadius:'0.75rem'}} className="flex flex-col justify-center items-center bg-white rounded-lg shadow-lg p-4 m-4">
                    <h1 className="text-2xl font-bold uppercase mb-2">Total User</h1>
                    <p className="text-4xl font-bold">{statistics.totalRevenue}$</p>
                </div>
            </div>
            <div className="flex items-center justify-around">
             <HorizontalChart data={statistics}></HorizontalChart>
             <CircleChart data={statistics}></CircleChart>
            </div>
        </div>
    );
};

export default Statistics;