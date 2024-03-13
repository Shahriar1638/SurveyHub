import Subtitles from "@/Components/Sectiontitles/Subtitles";
import Buttonmd from "@/Components/buttons/Buttonmd";
import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";
import useAxiosSecure from "@/Hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import Swal from "sweetalert2";

const AdminFeedbacks = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const { data: feedbacks =[],refetch } = useQuery({
        queryKey: ["feedbacks"],
        queryFn: async () =>{
            const res = await axiosSecure.get(`/pending-surveys/${user.email}`);
            return res.data;
        } 
    })
    const handleDelete = (id) => {
        Swal.fire({
            title: `Once your mark as read it will be deleted from the list`,
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Mark as read and delete it!"
          }).then((result) => {    
            axiosSecure.delete(`/pending-surveys/${id}`)
            .then(response => {
                console.log(response.data);
                if (result.isConfirmed) {
                    refetch();
                    Swal.fire({
                      title: "Marked as read",
                      text: "We wish luck next time",
                      icon: "success"
                    });}  
            })
            .catch(error => {
                console.log(error);
                Swal.fire({
                    title: "..Oops",
                    text: "Something went wrong",
                    icon: "error"
                  });
            })
        })
    }
    return (
        <div>
            <Subtitles text={"Admin Feedbacks"}></Subtitles>
            <div className="overflow-x-auto">
                <table className="table">
                    {/* head */}
                    <thead>
                    <tr>
                        <th>No.</th>
                        <th>Survey Title</th>
                        <th>Status</th>
                        <th>Feedbacks</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* body */}
                        {
                            feedbacks.map((data,idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{data.title}</td>
                                    <td>{data.status}</td>      
                                    {
                                        (data.adminFeedback) ? <>
                                        <td>{data.adminFeedback}</td>
                                        <td><p onClick={()=>handleDelete(data._id)}><Buttonmd text={"mark as read"}></Buttonmd></p></td>
                                        </> : <td>No feedbacks</td>
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminFeedbacks;