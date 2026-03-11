import Subtitles from "@/Components/Sectiontitles/Subtitles";
import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { FaMessage } from "react-icons/fa6";
import { VscReport } from "react-icons/vsc";

const UserFeedback = () => {
    const { user } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    
    const { data: feedbacks = [] } = useQuery({
        queryKey: ["feedbacks"],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/surveys/filtered/${user.email}`);
            return res.data;
        } 
    })

    return (
        <div className="p-6 md:p-12 bg-gray-50/50 min-h-screen">
            <Subtitles text={"User Reviews & Reports"}></Subtitles>
            
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-navy-950 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">#</th>
                                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">Survey Title</th>
                                <th className="px-6 py-4 text-center text-sm font-light uppercase tracking-wider">Comments</th>
                                <th className="px-6 py-4 text-center text-sm font-light uppercase tracking-wider">Reports</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {feedbacks.map((data, idx) => (
                                <tr key={data._id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">{data.title}</td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        <div className="indicator">
                                            <span className="indicator-item badge badge-sm bg-ocean-500 text-white border-none">{data.userReview?.length || 0}</span> 
                                            <button 
                                                onClick={()=>document.getElementById(`my_modal_${idx}`).showModal()}
                                                className="tooltip tooltip-top p-2 text-ocean-600 bg-ocean-50 hover:bg-ocean-500 hover:text-white rounded-lg transition-all shadow-sm border border-ocean-200"
                                                data-tip="View Comments"
                                            >
                                                <FaMessage className="text-lg"/>
                                            </button>
                                            
                                            <dialog id={`my_modal_${idx}`} className="modal">
                                                <div className="modal-box w-11/12 max-w-2xl bg-white rounded-2xl p-8">
                                                    <h3 className="font-bold border-b border-gray-100 pb-4 mb-6 text-xl text-navy-900">Comments for: <span className="text-ocean-600">{data.title}</span></h3>
                                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-left">
                                                        {data.userReview?.length > 0 ? data.userReview.map((review, i) => (
                                                            <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                                <h4 className="font-semibold text-ocean-700 text-sm mb-1">{review.username} <span className="text-gray-400 font-normal">commented:</span></h4>
                                                                <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                                                            </div>
                                                        )) : (
                                                            <p className="text-center text-gray-500 italic py-8">No comments yet.</p>
                                                        )}
                                                    </div>
                                                    <div className="modal-action border-t border-gray-100 pt-6">
                                                        <form method="dialog">
                                                            <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold transition-colors">Close</button>
                                                        </form>
                                                    </div>
                                                </div>
                                                {/* Backdrop to close when clicking outside */}
                                                <form method="dialog" className="modal-backdrop">
                                                    <button>close</button>
                                                </form>
                                            </dialog>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        {data?.reports && data.reports.length > 0 ? (
                                            <div className="indicator">
                                                <span className="indicator-item badge badge-sm bg-danger-500 text-white border-none">{data.reports.length}</span> 
                                                <button 
                                                    onClick={() => document.getElementById(`my_report_modal_${data._id}`).showModal()}
                                                    className="tooltip tooltip-top p-2 text-danger-600 bg-danger-50 hover:bg-danger-500 hover:text-white rounded-lg transition-all shadow-sm border border-danger-200"
                                                    data-tip="View Reports"
                                                >
                                                    <VscReport className="text-xl"/>
                                                </button>
                                                
                                                <dialog id={`my_report_modal_${data._id}`} className="modal">
                                                    <div className="modal-box w-11/12 max-w-2xl bg-white rounded-2xl p-8 text-left">
                                                        <h3 className="font-bold border-b border-danger-100 pb-4 mb-6 text-xl text-navy-900">Reports for: <span className="text-danger-600">{data.title}</span></h3>
                                                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                                            {data.reports.map((report, i) => (
                                                                <div key={i} className="bg-danger-50 p-4 rounded-xl border border-danger-100">
                                                                    <h4 className="font-semibold text-danger-700 text-sm mb-1">{report.user} <span className="text-gray-500 font-normal">reported:</span></h4>
                                                                    <p className="text-gray-800 text-sm leading-relaxed">{report.comment || report.reportText}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="modal-action border-t border-gray-100 pt-6">
                                                            <form method="dialog">
                                                                <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold transition-colors">Close</button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                    <form method="dialog" className="modal-backdrop">
                                                        <button>close</button>
                                                    </form>
                                                </dialog>
                                            </div> 
                                        ) : (
                                            <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200 text-xs font-semibold whitespace-nowrap">Clean</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="text-center text-gray-400 text-sm mt-6">
                Showing {feedbacks.length} surveys
            </div>
        </div>
    );
};

export default UserFeedback;