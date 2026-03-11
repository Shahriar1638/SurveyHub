/* eslint-disable react/prop-types */
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { TbCategory2 } from "react-icons/tb";
import { Link } from "react-router-dom";

const Cards = ({ data }) => {
  const { _id, title, description, likes, dislikes, category, image, date } = data;

  // Determine if deadline has passed
  const currentDate = new Date();
  const surveyDate = new Date(date);
  const deadlinePassed = surveyDate < currentDate;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-brand-50/30 rounded-2xl shadow-sm border border-brand-100/50 overflow-hidden hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 group">
      
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Link to={`/surveys/${_id}`} className="block w-full h-full">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src={image || "https://placehold.co/600x400?text=No+Image"}
              alt={title}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        
        {/* Category Badge */}
        {category && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-brand-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 pointer-events-none">
            <TbCategory2 className="text-sm" /> {category}
          </div>
        )}

        {/* Deadline Badge */}
        {date && (
            <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-md flex items-center gap-1 pointer-events-none ${deadlinePassed ? 'bg-danger-500/90 text-white' : 'bg-ocean-500/90 text-white'}`}>
                {deadlinePassed ? "Expired" : "Active"}
            </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-6">
        <Link to={`/surveys/${_id}`}>
            <h3 className="text-lg font-bold text-navy-950 mb-3 line-clamp-1 group-hover:text-brand-600 transition-colors" title={title}>
              {title}
            </h3>
        </Link>
        
        {/* Uniform Height Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow line-clamp-3 min-h-[3.75rem]">
          {description}
        </p>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-brand-100/50 mt-auto">
          
          {/* Likes & Dislikes Pill */}
          <div className="flex items-center gap-3 text-gray-500 text-sm font-medium bg-brand-50/50 px-3 py-1.5 rounded-full border border-brand-100/30">
            <div className="flex items-center text-brand-600 gap-1" title="Likes">
              <AiOutlineLike className="text-lg" />
              <span>{likes?.length || 0}</span>
            </div>
            <div className="w-px h-4 bg-brand-200"></div>
            <div className="flex items-center text-navy-400 gap-1" title="Dislikes">
              <AiOutlineDislike className="text-lg text-red-400" />
              <span>{dislikes?.length || 0}</span>
            </div>
          </div>
          
          {/* Action Button */}
          <Link
            to={`/surveys/${_id}`}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all transform hover:rotate-45 shadow-sm border ${
                deadlinePassed 
                ? "bg-danger-50 text-danger-600 hover:bg-danger-500 hover:text-white hover:shadow-danger-500/20 border-danger-100" 
                : "bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white hover:shadow-brand-500/20 border-brand-100"
            }`}
             title={deadlinePassed ? "Survey Closed" : "View Survey details"}
          >
            <span className="text-xl">↗</span>
          </Link>
        </div>
      </div>
      
    </div>
  );
};

export default Cards;
