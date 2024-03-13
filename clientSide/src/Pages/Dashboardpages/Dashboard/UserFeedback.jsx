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
    const { data: feedbacks =[] } = useQuery({
        queryKey: ["feedbacks"],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/surveys/filtered/${user.email}`);
            return res.data;
        } 
    })
    console.log(feedbacks);
    return (
        <div>
            <Subtitles text={"User Feedbacks"}></Subtitles>
            <div className="overflow-x-auto">
                <table className="table">
                    {/* head */}
                    <thead>
                    <tr>
                        <th>No.</th>
                        <th>Survey Title</th>
                        <th>Feedbacks</th>
                        <th>Reports</th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            feedbacks.map((data,idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{data.title}</td>
                                    <td>
                                        <div className="indicator">
                                            <span className="indicator-item badge badge-secondary">{data.userReview?.length}</span> 
                                            <button onClick={()=>document.getElementById(`my_modal_${idx}`).showModal()}><FaMessage className="text-sky-500 text-2xl"></FaMessage></button>
                                                <dialog id={`my_modal_${idx}`} className="modal">
                                                    <div className="modal-box w-11/12 max-w-5xl">
                                                        {
                                                            data.userReview?.map((review,i) => (
                                                                <div key={i} className="mb-4">
                                                                    <div className="modal-header mb-2">
                                                                        <h2 className="text-xl font-bold">{review.username}: </h2>
                                                                    </div>
                                                                    <div className="modal-body mb-2">
                                                                        <p className="text-base">{review.comment}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                        <div className="modal-action">
                                                            <form method="dialog">
                                                                {/* if there is a button, it will close the modal */}
                                                                <button className="btn">Close</button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </dialog>
                                        </div>
                                    </td>
                                    <td>
                                        {data?.reports ? (
                                        <>
                                          <div className="indicator">
                                            <span className="indicator-item badge badge-secondary">{data.reports.length}</span> 
                                            <button onClick={() => document.getElementById(`my_report_modal_${data._id}`).showModal()}><VscReport className="text-amber-600 text-4xl"></VscReport></button>
                                            <dialog id={`my_report_modal_${data._id}`} className="modal">
                                                <div className="modal-box w-11/12 max-w-5xl">
                                                    {data.reports.map((report,i) => (
                                                        <div key={i} className="mb-4">
                                                            <div className="modal-header mb-2">
                                                                <h2 className="text-xl font-bold">{report.user}: </h2>
                                                            </div>
                                                            <div className="modal-body mb-2">
                                                                <p className="text-base">{report.comment}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="modal-action">
                                                        <form method="dialog">
                                                            <button className="btn">Close</button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </dialog>
                                            </div> 
                                        </>
                                        ) : (
                                        <h1 className="text-green-400 text-lg">No reports!</h1>
                                        )}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserFeedback;