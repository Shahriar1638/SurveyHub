/* eslint-disable react/prop-types */
import { MdDateRange, MdHowToVote, MdCategory } from "react-icons/md";
import { Link } from "react-router-dom";

const SurveyCard = ({ survey, type = "standard" }) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-brand-50/30 rounded-2xl shadow-sm border border-brand-100/50 overflow-hidden hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 group">
      {/* Image Container with Hover Effect */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={survey.image || "https://placehold.co/600x400?text=No+Image"}
          alt={survey.title}
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Category Badge */}
        {survey.category && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-brand-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
            <MdCategory /> {survey.category}
          </div>
        )}
      </div>

      {/* Content Section - Flex Grow ensures footer aligns at bottom */}
      <div className="flex flex-col flex-grow p-6">
        <h3
          className="text-lg font-bold text-navy-950 mb-3 line-clamp-1 group-hover:text-brand-600 transition-colors"
          title={survey.title}
        >
          {survey.title}
        </h3>

        {/* Fixed min-height for description to align footers even with short text */}
        <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow line-clamp-3 min-h-[3.75rem]">
          {survey.description ||
            "Start exploring this survey to learn more details."}
        </p>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-brand-100/50 mt-auto">
          <div className="flex items-center text-gray-500 text-xs font-medium bg-brand-50/50 px-3 py-1 rounded-full border border-brand-100/30">
            {type === "latest" ? (
              <>
                <MdDateRange className="mr-1.5 text-base text-brand-500" />
                {survey.date}
              </>
            ) : (
              <>
                <MdHowToVote className="mr-1.5 text-base text-brand-500" />
                {survey.totalVotes} Votes
              </>
            )}
          </div>

          <Link
            to={`/surveys/${survey._id}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white transition-all transform hover:rotate-45 shadow-sm hover:shadow-brand-500/20 border border-brand-100"
            title="View Survey"
          >
            <span className="text-xl">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SurveyCard;
