/* eslint-disable react/prop-types */

const Buttonlg = ({ text, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-10 py-3.5 
        text-lg font-bold uppercase tracking-wider
        border-2 border-brand-500 
        bg-white text-brand-500
        rounded-lg
        transition-all duration-200 ease-out
        hover:bg-brand-500 hover:text-white hover:shadow-xl hover:shadow-brand-500/40
        active:scale-95 active:bg-brand-600
        ${className}
      `}
    >
      {text}
    </button>
  );
};

export default Buttonlg;
