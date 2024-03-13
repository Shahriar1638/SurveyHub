/* eslint-disable no-prototype-builtins */
import { useContext, useEffect, useState } from "react";
import { AiFillDislike, AiFillLike, AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import { BsCalendarDateFill } from "react-icons/bs";
import { TbCategory2 } from "react-icons/tb";
import { useLoaderData } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../../Firebase AuthProvider/AuthProvider";
import useUsers from "../../Hooks/useUsers";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import { IoIosSend } from "react-icons/io";
import { MdOutlineReportProblem } from "react-icons/md";
import Buttonmd from "../buttons/Buttonmd";
import VerticalChart from "../Charts/VerticalChart";


const SurveyDetails = () => {
    const [hidden, setHidden] = useState(false);
    const axiosPublic = useAxiosPublic();
    const { user } = useContext(AuthContext);
    const [allowed , setAllowed] = useState(false);
    const [reportText, setReportText] = useState("");
    const [ currentUser ] = useUsers();
    const data = useLoaderData()
    const { _id,title, description, likes, dislikes, category, image, date, options, userReview,votedPeopleMails } = data;
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likednum, setLiked] = useState(likes.length);
    const [dislikednum, setDisliked] = useState(dislikes.length);
    const [comment, setComment] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [deadline, setDeadline] = useState('');
    
    useEffect(() => {
        setDisplayName(user.displayName);
        if (currentUser.role !== 'user') {
            setAllowed(true);
        } else {
            setAllowed(false);
        }
        const currentDate = new Date();
        const surveyDate = new Date(date);
        if (surveyDate >= currentDate) {
            setDeadline(true);
        }else{
            setDeadline(false);
        }
        if (votedPeopleMails.includes(user.email)) {
            setHidden(true);
        }
        if (likes.includes(user.email)) {
            //setLiked(likes.length);
            setIsLiked(true);
            setIsDisliked(false);
        } else if (dislikes.includes(user.email)) {
            //setDisliked(dislikes.length);
            setIsDisliked(true);
            setIsLiked(false);
        }}, [user.email, currentUser, likes, dislikes, user.displayName, date, votedPeopleMails])

    const handleLike = () => {
        axiosPublic.patch(`/surveys/like/${_id}`, { email: user.email })
        .then(response => {
            if (response.data.acknowledged) {
                if (isDisliked===false && isLiked===false) {
                    setLiked(likednum+1);
                    setIsLiked(true);
                    setIsDisliked(false);
                } else if (isDisliked===true && isLiked===false) {
                    setLiked(likednum+1);
                    setDisliked(dislikednum-1);
                    setIsLiked(true);
                    setIsDisliked(false);
                }
            }
        })
        .catch(error => {
            console.log(error);
        });
    };
    
    const handleDislike = () => {
        axiosPublic.patch(`/surveys/dislike/${_id}`, { email: user.email })
        .then(response => {
            if (response.data.acknowledged) {
                if (isDisliked===false && isLiked===false) {
                    setDisliked(dislikednum+1);
                    setIsDisliked(true);
                    setIsLiked(false);
                } else if (isDisliked===false && isLiked===true) {
                    setLiked(likednum-1);
                    setDisliked(dislikednum+1);
                    setIsDisliked(true);
                    setIsLiked(false);
                }
            }
        })
        .catch(error => {
            console.log(error);
        });
    };
    const handleVote = (key) => {
        setHidden(true);
        Swal.fire({
            title: `Are you sure You want to Vote ${key.toUpperCase()}?`,
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Vote it!"
          }).then((result) => {    
            axiosPublic.patch(`/surveys/vote/${_id}`, { option: key, email: user.email })
            .then(response => {
                console.log(response.data);
                if (result.isConfirmed) {
                    Swal.fire({
                      title: "Voted",
                      text: "Your vote has been recorded.",
                      icon: "success"
                    });
                    window.location.reload();
                  }  
            })
            .catch(error => {
                console.log(error);
                Swal.fire({
                    title: "Already Voted",
                    text: "Your already complete your vote in this survey.",
                    icon: "error"
                  });
            });
          });
    }
    const handleCommentSubmit = () => {
        axiosPublic.patch(`/surveys/comment/${_id}`, { username: displayName, comment })
        .then(response => {
            console.log(response.data);
            window.location.reload();
        })
        .catch(error => {
            console.log(error);
        });
    };
    const handleReportSend = () => {
        axiosPublic.patch(`/surveys/report/${_id}`, { email: user.email, reportText })
        .then(response => {
            if (response.data.acknowledged) {
                Swal.fire({
                    title: "Reported",
                    text: "Your report has been recorded.",
                    icon: "success"
                    });
            }
        })
        .catch(error => {
            console.log(error);
        });
    };
    return (
        <div className="mt-32 max-w-7xl lg:max-w-[90rem] mx-auto">
            <div style={{borderRadius:'0.75rem'}} className="border-2 border-solid border-[#0DD3FA] rounded-lg px-6 py-4 shadow-lg">

                {/* --------------------- image header category description deadline */}
                <img className="object-cover w-full rounded-lg mb-4"  style={{borderRadius:'0.6rem'}} src={image} alt="" />
                <h3 className="mb-6 text-xl font-semibold h-10">{title}</h3>
                <div className="bg-[#d13d30] text-xs font-semibold rounded-md mb-2 flex flex-row items-center"  style={{borderRadius:'0.375rem'}}>
                    <p className="p-2 text-white flex items-center">
                    <TbCategory2 className='text-xl mr-2'></TbCategory2> Category: <span className="bg-white p-1 text-black rounded-md ml-2"  style={{borderRadius:'0.375rem'}}> {category}</span>
                    </p>
                    <p className="p-2 text-white flex items-center">
                    <BsCalendarDateFill className='text-xl mr-2'></BsCalendarDateFill> Date: <span  style={{borderRadius:'0.375rem'}} className="bg-white p-1 text-black rounded-md ml-2"> {date}</span>
                    </p>
                </div>
                <p className='mb-4'>
                    {description}
                </p>
                {/* -----------  Vote handle --------------- */}
                <div className="mb-8">
                    <p className="text-lg font-medium mb-4">Vote now</p>
                    <ul className="flex sm:flex-row flex-col">
                        { deadline ? Object.entries(options).map(([key, value]) => (
                            <li onClick={()=>handleVote(key)} style={{borderRadius:'0.375rem'}} className="uppercase rounded-md bg-[#d13d30] text-white px-8 py-3 md:mr-6 mb-4 hover:cursor-pointer" key={key}>{key}    <div className="badge">{value}</div></li>
                        )) : <p className="text-red-500">Voting is closed Dealine is over</p> }
                    </ul>
                </div>
                {/* --------------------- show cart ----------------- */}
                
                {
                    hidden ? <div className="my-10 border-y-2 border-solid border-[#d13d30]"><VerticalChart data={options}></VerticalChart></div> : null
                }
                
                <div className="flex justify-between items-center">
                    {/* ------------     Like and Dislike button ---------- */}
                    <div className='flex flex-row items-center mb'>
                        <p className={`flex flex-row items-center hover:cursor-pointer ${isLiked ? 'text-blue-500' : ''}`} onClick={handleLike}>
                            {isLiked ? <AiFillLike className="mr-2 text-2xl" /> : <AiOutlineLike className="mr-2 text-2xl" />}
                            {likednum}
                        </p>
                        <p className={`flex flex-row items-center hover:cursor-pointer ml-4 ${isDisliked ? 'text-red-500' : ''}`} onClick={handleDislike}>
                            {isDisliked ? <AiFillDislike className="mr-2 text-2xl" /> : <AiOutlineDislike className="mr-2 text-2xl" />}
                            {dislikednum}
                        </p>
                    </div> 

                    {/* ------------     Report button ---------- */}

                    <div style={{borderRadius:'0.375rem'}} className="text-amber-600 border-2 px-6 py-2 border-solid border-amber-600">
                        <button onClick={() => document.getElementById(`my_report_modal_1`).showModal()}>
                            <div className="flex items-center">
                                <MdOutlineReportProblem className="text-2xl mr-2"></MdOutlineReportProblem>
                                <p className="text-xl font-semibold">Report</p>
                            </div>
                        </button>
                        <dialog id={`my_report_modal_1`} className="modal">
                            <div className="modal-box">
                                <form method="dialog">
                                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                                </form>
                                <h3 className="font-bold text-lg mb-2">Tell you reason please:</h3>
                                <textarea
                                    style={{borderRadius:'0.375rem'}}
                                    className="w-full h-28 p-3 mb-2 border-2 border-gray-300 text-black" 
                                    placeholder="Write your reason here..."
                                    onChange={(e) => setReportText(e.target.value)}
                                />
                                <form method="dialog">
                                    <p onClick={handleReportSend}><Buttonmd text={"Send"}></Buttonmd></p>
                                </form>
                            </div>
                        </dialog>
                    </div>
                </div> 
                <div className="border-b-2 border-solid border-[#0DD3FA] my-12"></div>
                {/* --------------------- Comments ---------------------- */}
                <div>
                    <p className="text-xl font-semibold mb-4">Comments:</p>
                    {
                        userReview.map((item, index) => (
                            <div  style={{borderRadius:'0.375rem'}} key={index} className="flex flex-row items-start justify-start w-full max-w-2xl p-4 border-2 border-solid border-[#0DD3FA] rounded-lg mb-4">
                                <p className="text-lg font-semibold mr-3">{item.username} :</p>
                                <p className="text-lg font-semibold">{item.comment}</p>
                            </div>
                        ))
                    }
                    {
                        allowed ? 
                        <div>
                            <textarea 
                                style={{borderRadius:'0.375rem'}}
                                className="w-full h-20 p-3 mb-2 border-2 border-gray-300 rounded-md" 
                                placeholder="Write your comment here..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <button  style={{borderRadius:'0.375rem'}} className="px-4 py-2 bg-[#f88703] text-white rounded-md flex items-center" onClick={handleCommentSubmit}>
                                <IoIosSend className="text-xl mr-2"></IoIosSend>Comment
                            </button>
                        </div>
                        : 
                        <p className="text-red-500 my-2">You cannot comment. You have to become a pro member in order to comment in a survey</p>
                    }
                </div>
            </div>
        </div>
    );
};

export default SurveyDetails;