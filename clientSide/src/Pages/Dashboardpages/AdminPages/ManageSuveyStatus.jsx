/* eslint-disable no-unused-vars */
import Buttonmd from "@/Components/buttons/Buttonmd";
import useAxiosSecure from "@/Hooks/useAxiosSecure";
import { Popover } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import Subtitles from "@/Components/Sectiontitles/Subtitles";
import { useState } from "react";
import Swal from "sweetalert2";
import { FaCheck, FaTimes } from "react-icons/fa";

const ManageSuveyStatus = () => {
    const [feedback, setFeedback] = useState("");
    const axiosSecure = useAxiosSecure();
    
    const { data: pendingSurveys = [], refetch } = useQuery({
        queryKey: ["pendingSurveys"],
        queryFn: async () =>{
            const res = await axiosSecure.get("/pending-surveys");
            return res.data;
        } 
    })

    const handleSurveyPost = async (survey) => {
        const updatedSurvey = {
            email: survey.email,
            title: survey.title,
            description: survey.description,
            date: survey.deadline,
            category: survey.category,
            image: survey.image,
            options: survey.options,
            likes: [],
            dislikes: [],
            userReview: [],
            votedPeopleMails: []
        };

        try {
            // FIX: Use Promise.all to ensure strong atomicity/synchronous awaiting 
            const [patchRes, postRes] = await Promise.all([
                axiosSecure.patch(`/pending-surveys/${survey._id}`, {status: "published"}),
                axiosSecure.post("/surveys", updatedSurvey)
            ]);

            if (patchRes.data.acknowledged && postRes.data.acknowledged) {
                refetch();
                Swal.fire({
                    icon: 'success',
                    title: 'Survey Approved',
                    text: 'Survey has been successfully published to the main platform.',
                    confirmButtonColor: '#f98602'
                });
            }
        } catch (err) {
            console.error(err);
             Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to publish the survey.',
                confirmButtonColor: '#d33a2f'
            });
        }
    };
    
    const handleSurveyReject = async (survey) => {
        if(!feedback.trim()){
            Swal.fire({
                icon: 'warning',
                title: 'Missing Feedback',
                text: 'Please provide a reason for rejecting the survey.',
                confirmButtonColor: '#f98602'
            });
            return;
        }

        try {
            const response = await axiosSecure.patch(`/pending-surveys/reject/${survey._id}`, {status: "rejected", adminFeedback: feedback});
            if (response.data.acknowledged) {
                refetch();
                setFeedback(""); // clear
                Swal.fire({
                    icon: 'success',
                    title: 'Survey Rejected',
                    text: 'Feedback successfully sent to the surveyor.',
                    confirmButtonColor: '#d33a2f'
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="p-6 md:p-12 bg-gray-50/50 min-h-screen">
            <Subtitles text={"Manage Survey Status"}></Subtitles>
            
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-navy-950 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">#</th>
                                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">Publisher</th>
                                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-sm font-light uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pendingSurveys.map((survey, idx) => (
                                <tr key={survey._id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">{survey.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{survey.email}</td>      
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
                                            survey.status === 'published' ? "bg-green-100 text-green-700 border-green-200" :
                                            survey.status === 'rejected' ? "bg-danger-50 text-danger-700 border-danger-200" :
                                            "bg-brand-50 text-brand-700 border-brand-200"
                                        }`}>
                                            {survey.status}
                                        </span>
                                    </td>    
                                    <td className="px-6 py-4 text-center">
                                        {(survey.status !== "pending") ? (
                                             <div className="text-gray-400 text-xs uppercase font-bold tracking-widest opacity-50">Processed</div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-3">
                                                <button 
                                                    onClick={()=>handleSurveyPost(survey)} 
                                                    className="tooltip tooltip-top p-2 text-green-600 bg-green-50 hover:bg-green-500 hover:text-white rounded-lg transition-all shadow-sm border border-green-200"
                                                    data-tip="Publish Survey"
                                                >
                                                    <FaCheck className="text-sm" />
                                                </button>
                                                
                                                <Popover className="relative">
                                                    <Popover.Button className="tooltip tooltip-top p-2 text-danger-600 bg-danger-50 hover:bg-danger-500 hover:text-white rounded-lg transition-all shadow-sm border border-danger-200 outline-none focus:outline-none" data-tip="Reject Survey">
                                                        <FaTimes className="text-sm" />
                                                    </Popover.Button>
                                                    <Popover.Panel className="absolute z-20 w-80 right-0 mt-3 top-full">
                                                        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-5 ring-1 ring-black/5">
                                                            <h4 className="text-sm font-bold text-navy-900 mb-3 text-left">Provide Rejection Reason</h4>
                                                            <textarea 
                                                                className="w-full h-24 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-danger-500/50 focus:border-danger-500 transition-all bg-gray-50 text-sm mb-3 resize-none" 
                                                                placeholder="Explain why this was rejected..." 
                                                                onChange={e => setFeedback(e.target.value)} 
                                                                value={feedback}
                                                                required
                                                            />
                                                            <button 
                                                                onClick={()=>handleSurveyReject(survey)} 
                                                                className="w-full py-2 bg-danger-500 hover:bg-danger-600 text-white font-semibold rounded-lg transition-colors text-sm"
                                                            >
                                                                Send Feedback & Reject
                                                            </button>
                                                        </div>
                                                    </Popover.Panel>
                                                </Popover>
                                            </div>
                                        )}
                                    </td>                       
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="text-center text-gray-400 text-sm mt-6">
                Showing {pendingSurveys.length} pending requests
            </div>
        </div>
    );
};

export default ManageSuveyStatus;