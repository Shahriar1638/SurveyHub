/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from "react-icons/ai";
import { BsCalendarDateFill } from "react-icons/bs";
import { TbCategory2 } from "react-icons/tb";
import { Link } from 'react-router-dom';

const Cards = ({ data }) => {

    const { _id,title, description, likes, dislikes, category, image, date } = data;
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        setIsDisliked(false);
    };

    const handleDislike = () => {
        setIsDisliked(!isDisliked);
        setIsLiked(false);
    };

    return (
        <Link to={`/surveys/${_id}`}>
            <div className=" px-6 py-4 shadow-lg">
                <img style={{borderRadius:'0.5rem'}} className="h-60 object-cover w-full mb-4" src={image} alt="" />
                <h3 className="mb-6 text-xl font-semibold h-10">{title}</h3>
                <div className="bg-[#d13d30] text-xs font-semibold mb-2 flex md:flex-row items-center" style={{borderRadius:'0.375rem'}}>
                    <p className="p-2 text-white flex items-center">
                    <TbCategory2 className='text-xl mr-2'></TbCategory2> Category: <span  style={{borderRadius:'0.375rem'}} className="bg-white p-1 text-black rounded-md ml-2"> {category}</span>
                    </p>
                    <p className="p-2 text-white flex items-center">
                    <BsCalendarDateFill className='text-xl mr-2'></BsCalendarDateFill> Date: <span  style={{borderRadius:'0.375rem'}} className="bg-white p-1 text-black ml-2"> {date}</span>
                    </p>
                </div>
                <p className='mb-4'>
                    {showFullDescription ? description : description.slice(0, 80)}
                    {description.length > 80 && (
                        <span className="text-sky-500" onClick={toggleDescription}>
                            {showFullDescription ? 'Show less' : ' . . . . read more'}
                        </span>
                    )}
                </p>
                <div className='flex flex-row items-center'>
                    <p className={`flex flex-row items-center ${isLiked ? 'text-blue-500' : ''}`} onClick={handleLike}>
                        {isLiked ? <AiFillLike className="mr-2 text-2xl" /> : <AiOutlineLike className="mr-2 text-2xl" />}
                        {likes.length}
                    </p>
                    <p className={`flex flex-row items-center ml-4 ${isDisliked ? 'text-red-500' : ''}`} onClick={handleDislike}>
                        {isDisliked ? <AiFillDislike className="mr-2 text-2xl" /> : <AiOutlineDislike className="mr-2 text-2xl" />}
                        {dislikes.length}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default Cards;