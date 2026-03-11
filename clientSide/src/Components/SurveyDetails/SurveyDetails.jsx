/* eslint-disable no-prototype-builtins */
import { useContext, useEffect, useState } from "react";
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineDislike,
  AiOutlineLike,
} from "react-icons/ai";
import { BsCalendarDateFill } from "react-icons/bs";
import { TbCategory2 } from "react-icons/tb";
import { useLoaderData } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../../Firebase AuthProvider/AuthProvider";
import useUsers from "../../Hooks/useUsers";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import { IoIosSend } from "react-icons/io";
import { MdOutlineReportProblem } from "react-icons/md";

import VerticalChart from "../Charts/VerticalChart";

const SurveyDetails = () => {
  const [hidden, setHidden] = useState(false);
  const axiosPublic = useAxiosPublic();
  const { user } = useContext(AuthContext);
  const [allowed, setAllowed] = useState(false);
  const [reportText, setReportText] = useState("");
  const [currentUser] = useUsers();
  const data = useLoaderData();
  const {
    _id,
    title,
    description,
    likes,
    dislikes,
    category,
    image,
    date,
    options,
    userReview,
    votedPeopleMails,
  } = data;
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likednum, setLiked] = useState(likes.length);
  const [dislikednum, setDisliked] = useState(dislikes.length);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    setDisplayName(user.displayName);
    if (currentUser.role === "surveyor" && data.email !== user.email) {
      setAllowed(false);
    } else {
      setAllowed(true);
    }
    const currentDate = new Date();
    const surveyDate = new Date(date);
    if (surveyDate >= currentDate) {
      setDeadline(true);
    } else {
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
    }
  }, [
    user.email,
    currentUser,
    likes,
    dislikes,
    user.displayName,
    date,
    votedPeopleMails,
    data.email,
  ]);

  const handleLike = () => {
    axiosPublic
      .patch(`/surveys/like/${_id}`, { email: user.email })
      .then((response) => {
        if (response.data.acknowledged) {
          if (isDisliked === false && isLiked === false) {
            setLiked(likednum + 1);
            setIsLiked(true);
            setIsDisliked(false);
          } else if (isDisliked === true && isLiked === false) {
            setLiked(likednum + 1);
            setDisliked(dislikednum - 1);
            setIsLiked(true);
            setIsDisliked(false);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDislike = () => {
    axiosPublic
      .patch(`/surveys/dislike/${_id}`, { email: user.email })
      .then((response) => {
        if (response.data.acknowledged) {
          if (isDisliked === false && isLiked === false) {
            setDisliked(dislikednum + 1);
            setIsDisliked(true);
            setIsLiked(false);
          } else if (isDisliked === false && isLiked === true) {
            setLiked(likednum - 1);
            setDisliked(dislikednum + 1);
            setIsDisliked(true);
            setIsLiked(false);
          }
        }
      })
      .catch((error) => {
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
      confirmButtonText: "Yes, Vote it!",
    }).then((result) => {
      axiosPublic
        .patch(`/surveys/vote/${_id}`, { option: key, email: user.email })
        .then((response) => {
          console.log(response.data);
          if (result.isConfirmed) {
            Swal.fire({
              title: "Voted",
              text: "Your vote has been recorded.",
              icon: "success",
            });
            window.location.reload();
          }
        })
        .catch((error) => {
          console.log(error);
          Swal.fire({
            title: "Already Voted",
            text: "Your already complete your vote in this survey.",
            icon: "error",
          });
        });
    });
  };
  const handleCommentSubmit = () => {
    axiosPublic
      .patch(`/surveys/comment/${_id}`, { username: displayName, comment })
      .then((response) => {
        console.log(response.data);
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleReportSend = () => {
    axiosPublic
      .patch(`/surveys/report/${_id}`, { email: user.email, reportText })
      .then((response) => {
        if (response.data.acknowledged) {
          Swal.fire({
            title: "Reported",
            text: "Your report has been recorded.",
            icon: "success",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="mt-32 max-w-7xl lg:max-w-6xl mx-auto px-6 mb-24">
      <div className="bg-white rounded-2xl shadow-xl shadow-brand-500/5 p-8 border border-gray-100 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-bl-full pointer-events-none -z-10 opacity-60"></div>

        {/* --------------------- image header category description deadline */}
        <div className="relative h-96 w-full rounded-xl overflow-hidden mb-8 shadow-sm">
            <img
            className="w-full h-full object-cover"
            src={image}
            alt={title}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent"></div>
        </div>
        
        <h3 className="mb-4 text-3xl font-bold text-navy-950 leading-tight">{title}</h3>
        
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="bg-ocean-50 text-ocean-700 text-sm font-bold px-4 py-2 rounded-lg flex items-center border border-ocean-100/50 shadow-sm">
            <TbCategory2 className="text-xl mr-2"></TbCategory2> 
            Category: <span className="ml-2 font-black">{category}</span>
          </div>
          <div className="bg-brand-50 text-brand-700 text-sm font-bold px-4 py-2 rounded-lg flex items-center border border-brand-100/50 shadow-sm">
            <BsCalendarDateFill className="text-xl mr-2"></BsCalendarDateFill>
            Date: <span className="ml-2 font-black">{date}</span>
          </div>
        </div>
        
        <div className="prose prose-lg text-gray-600 mb-12 max-w-none">
            <p className="leading-relaxed whitespace-pre-line">{description}</p>
        </div>

        {/* -----------  Vote handle --------------- */}
        <div className="mb-12 bg-gray-50 p-8 rounded-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-500"></div>
          <p className="text-xl font-bold text-navy-950 mb-6">Cast Your Vote</p>
          <ul className="flex flex-wrap gap-4">
            {deadline ? (
              Object.entries(options).map(([key, value]) => (
                <li
                  onClick={() => handleVote(key)}
                  className="uppercase rounded-xl bg-white border border-gray-200 text-navy-700 font-semibold px-6 py-3 hover:border-brand-500 hover:text-brand-600 hover:shadow-md hover:shadow-brand-500/10 cursor-pointer transition-all flex items-center gap-3 "
                  key={key}
                >
                  {key} 
                  <div className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded-md font-black">{value}</div>
                </li>
              ))
            ) : (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-6 py-4 rounded-xl font-semibold flex items-center w-full">
                  <span className="text-2xl mr-3">⌛</span>
                  Voting is closed. The deadline has passed.
              </div>
            )}
           </ul>
        </div>
        {hidden ? (
          <div className="my-10 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner">
            <h4 className="text-center font-bold text-navy-900 mb-6 uppercase tracking-widest text-sm">Real-time Results</h4>
            <VerticalChart data={options}></VerticalChart>
          </div>
        ) : null}

        <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-xl border border-gray-100">
          {/* ------------     Like and Dislike button ---------- */}
          <div className="flex flex-row items-center gap-6">
            <button
              className={`flex flex-row items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm border ${isLiked ? "bg-ocean-50 text-ocean-600 border-ocean-200" : "bg-white text-gray-500 border-gray-200 hover:text-ocean-500 hover:border-ocean-300"}`}
              onClick={handleLike}
            >
              {isLiked ? (
                <AiFillLike className="text-2xl" />
              ) : (
                <AiOutlineLike className="text-2xl" />
              )}
              {likednum}
            </button>
            <button
              className={`flex flex-row items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm border ${isDisliked ? "bg-danger-50 text-danger-600 border-danger-200" : "bg-white text-gray-500 border-gray-200 hover:text-danger-500 hover:border-danger-300"}`}
              onClick={handleDislike}
            >
              {isDisliked ? (
                <AiFillDislike className="text-2xl" />
              ) : (
                <AiOutlineDislike className="text-2xl" />
              )}
              {dislikednum}
            </button>
          </div>

          {/* ------------     Report button ---------- */}

          <div>
             <button
              className="group flex flex-row items-center gap-2 px-5 py-2 rounded-lg font-bold bg-white text-danger-500 border border-danger-200 hover:bg-danger-50 hover:text-danger-600 transition-all shadow-sm"
              onClick={() =>
                document.getElementById(`my_report_modal_1`).showModal()
              }
            >
                <MdOutlineReportProblem className="text-xl group-hover:scale-110 transition-transform"></MdOutlineReportProblem>
                <span className="text-sm">Report</span>
            </button>
            <dialog id={`my_report_modal_1`} className="modal">
              <div className="modal-box rounded-2xl p-8 bg-white max-w-md relative">
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-400 hover:text-navy-900 border-none">
                    ✕
                  </button>
                </form>
                <h3 className="font-bold text-xl text-navy-900 mb-2">
                  Report this Survey
                </h3>
                <p className="text-gray-500 text-sm mb-4">Please provide detailed reasoning.</p>
                <textarea
                  className="w-full h-32 p-4 mb-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger-500/50 focus:border-danger-500 transition-all bg-gray-50 text-navy-900 resize-none"
                  placeholder="I am reporting this because..."
                  onChange={(e) => setReportText(e.target.value)}
                />
                <form method="dialog">
                  <button 
                  onClick={handleReportSend}
                  className="w-full py-3 bg-danger-500 hover:bg-danger-600 text-white font-bold rounded-xl transition-all shadow-md shadow-danger-500/20"
                  >
                    Submit Report
                  </button>
                </form>
              </div>
               <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
          </div>
        </div>
        
        <div className="border-b border-gray-100 my-12 relative flex justify-center">
            <span className="bg-white px-4 text-gray-300 text-sm uppercase tracking-widest absolute -top-3">Discussion</span>
        </div>
        
        {/* --------------------- Comments ---------------------- */}
        <div className="bg-gray-50/30 p-8 rounded-2xl border border-gray-100">
          <p className="text-2xl font-bold text-navy-950 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-ocean-100 text-ocean-600 flex justify-center items-center text-sm">{userReview.length}</span>
              Comments
            </p>
            <div className="space-y-4 mb-8">
              {userReview.length > 0 ? userReview.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col w-full bg-white p-5 border border-gray-100 shadow-sm rounded-xl"
                >
                  <p className="text-sm font-bold text-ocean-700 mb-1">{item.username}</p>
                  <p className="text-base text-gray-700 leading-relaxed">{item.comment}</p>
                </div>
              )) : (
                  <p className="text-gray-400 italic bg-white p-6 text-center border border-gray-100 rounded-xl">Be the first to comment on this survey!</p>
              )}
          </div>
          
          {allowed ? (
            <div className="mt-4 bg-white rounded-xl border border-brand-100 p-6 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
              <h4 className="text-sm font-bold text-brand-600 mb-3 uppercase tracking-wider">
                Join the Discussion
              </h4>
              <textarea
                className="w-full h-24 p-4 mb-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all bg-gray-50/50 resize-y"
                placeholder="Share your insights..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl flex items-center transition-all shadow-md shadow-brand-500/20"
                onClick={handleCommentSubmit}
              >
                <IoIosSend className="text-xl mr-2"></IoIosSend> Post Comment
              </button>
            </div>
          ) : (
            <div className="mt-4 p-5 bg-danger-50 border border-danger-200 rounded-xl">
              <p className="text-danger-700 text-sm font-semibold flex items-center gap-3">
                <span className="text-2xl bg-white p-2 rounded-full shadow-sm">🔒</span> Surveyors can only comment on their own created surveys.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyDetails;
