/* eslint-disable react/prop-types */

const Buttonmd = ({ text, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-2.5 
        font-bold uppercase tracking-wide
        border-2 border-brand-500 
        bg-white text-brand-500
        rounded-lg
        transition-all duration-200 ease-out
        hover:bg-brand-500 hover:text-white hover:shadow-lg hover:shadow-brand-500/30
        active:scale-95 active:bg-brand-600
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-brand-500 disabled:shadow-none
        ${className}
      `}
      {...props}
    >
      {text}
    </button>
  );
};

export default Buttonmd;
