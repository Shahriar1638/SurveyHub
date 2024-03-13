/* eslint-disable no-unused-vars */
import Buttonmd from "@/Components/buttons/Buttonmd";
import useAxiosSecure from "@/Hooks/useAxiosSecure";
import { Popover } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import Subtitles from "@/Components/Sectiontitles/Subtitles";
import { useState } from "react";
import Swal from "sweetalert2";

const ManageSuveyStatus = () => {
    const [feedback, setFeedback] = useState("");
    const axiosSecure = useAxiosSecure();
    const { data: pendingSurveys =[],refetch } = useQuery({
        queryKey: ["pendingSurveys"],
        queryFn: async () =>{
            const res = await axiosSecure.get("/pending-surveys");
            return res.data;
        } 
    })
    const handleSurveyPost = (survey) => {
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
        console.log(updatedSurvey);
        axiosSecure.patch(`/pending-surveys/${survey._id}`, {status: "published"})
        .then(response => {
            if (response.data.acknowledged) {
                refetch();
            }
        })
        axiosSecure.post("/surveys", updatedSurvey)
            .then(response => {
                if (response.data.acknowledged) {
                    refetch();
                    Swal.fire({
                        icon: 'success',
                        title: 'Survey Approved',
                        text: 'Survey is now published',
                        })
                }
            });
    };
    
    const handleSurveyReject = (survey) => {
        console.log(feedback);
        axiosSecure.patch(`/pending-surveys/reject/${survey._id}`, {status: "rejected", adminFeedback: feedback})
        .then(response => {
            if (response.data.acknowledged) {
                refetch();
                Swal.fire({
                    icon: 'success',
                    title: 'Survey Rejected',
                    text: 'Your feed back is sent to the surveyor',
                    })
            }
        })
    }

    return (
        <div>
            <Subtitles text={"Manage Survey Status"}></Subtitles>
            <div className="overflow-x-auto">
                <table className="table">
                    {/* head */}
                    <thead>
                    <tr>
                        <th>No.</th>
                        <th>Title</th>
                        <th>Publisher Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* body */}
                        {
                            pendingSurveys.map((survey,idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{survey.title}</td>
                                    <td>{survey.email}</td>      
                                    <td>{survey.status}</td>    
                                    <td className="">
                                        {
                                            (survey.status !== "pending") ? <h1 style={{ borderRadius: '0.5rem' }} className="px-4 py-2 w-40 border-2 border-solid border-red-600 text-lg font-bold">{survey.status}</h1>:
                                            <div className="flex items-center gap-4">
                                                <p onClick={()=>handleSurveyPost(survey)}><Buttonmd text={"Approve"}></Buttonmd></p>
                                                <p><Popover className="">
                                                        <Popover.Button as="div"><Buttonmd text={"Reject"}></Buttonmd></Popover.Button>
                                                            <Popover.Panel className="absolute z-10 w-[30rem] h-96 left-1/2 top-1/2 bottom-1/2 right-1/2">
                                                                <div style={{ borderRadius: '0.5rem' }} className="border-2 bg-white border-solid border-[#f88703] p-4">
                                                                    <h1 className="text-lg mb-2">Your Feedback:</h1>
                                                                    <textarea style={{ borderRadius: '0.5rem' }} className="border-2 border-solid border-[#f88703] p-4 w-full" type="text" name="adminFeedback" placeholder="write here .... " onChange={e => setFeedback(e.target.value)} required/>
                                                                    <input style={{ borderRadius: '0.5rem' }} onClick={()=>handleSurveyReject(survey)} type="submit" value="Send" className="bg-[#f88703] px-4 py-2 text-white"/>
                                                                </div>
                                                            </Popover.Panel>
                                                    </Popover></p>
                                            </div>
                                        }
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

export default ManageSuveyStatus;