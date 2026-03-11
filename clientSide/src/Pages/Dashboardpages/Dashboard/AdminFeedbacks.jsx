import Subtitles from "@/Components/Sectiontitles/Subtitles";
import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";
import useAxiosSecure from "@/Hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import Swal from "sweetalert2";
import { FaCheckDouble } from "react-icons/fa";

const AdminFeedbacks = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const { data: feedbacks = [], refetch } = useQuery({
        queryKey: ["feedbacks"],
        queryFn: async () =>{
            const res = await axiosSecure.get(`/pending-surveys/${user.email}`);
            return res.data;
        } 
    })

    const handleDelete = (id) => {
        Swal.fire({
            title: `Mark as Read?`,
            text: "This feedback will be permanently removed from your list.",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#118bb0",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Mark & Delete"
          }).then((result) => {    
            if (result.isConfirmed) {
                axiosSecure.delete(`/pending-surveys/${id}`)
                .then(() => {
                    refetch();
                    Swal.fire({
                      title: "Marked as Reak",
                      text: "Feedback cleared from inbox.",
                      icon: "success",
                      confirmButtonColor: "#118bb0"
                    });
                })
                .catch(error => {
                    console.error(error);
                    Swal.fire({
                        title: "Oops...",
                        text: "Something went wrong.",
                        icon: "error",
                        confirmButtonColor: "#d33a2f"
                      });
                })
            }
        })
    }

    return (
        <div className="p-6 md:p-12 bg-gray-50/50 min-h-screen">
            <Subtitles text={"Admin Feedback Inbox"}></Subtitles>
            
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-navy-950 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">#</th>
                                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">Survey Title</th>
                                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-light uppercase tracking-wider">Admin Feedback</th>
                                <th className="px-6 py-4 text-center text-sm font-light uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {feedbacks.map((data, idx) => (
                                <tr key={data._id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">{data.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
                                            data.status === 'published' ? "bg-green-100 text-green-700 border-green-200" :
                                            data.status === 'rejected' ? "bg-danger-50 text-danger-700 border-danger-200" :
                                            "bg-brand-50 text-brand-700 border-brand-200"
                                        }`}>
                                            {data.status}
                                        </span>
                                    </td>    
                                    
                                    <td className="px-6 py-4">
                                        {data.adminFeedback ? (
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">{data.adminFeedback}</p>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">No feedback provided</span>
                                        )}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                       {data.adminFeedback && (
                                            <button 
                                                onClick={()=>handleDelete(data._id)} 
                                                className="tooltip tooltip-top p-2 text-ocean-600 bg-ocean-50 hover:bg-ocean-500 hover:text-white rounded-lg transition-all shadow-sm border border-ocean-200"
                                                data-tip="Mark as Read"
                                            >
                                                <FaCheckDouble className="text-lg" />
                                            </button>
                                       )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="text-center text-gray-400 text-sm mt-6">
                Showing {feedbacks.length} messages
            </div>
        </div>
    );
};

export default AdminFeedbacks;