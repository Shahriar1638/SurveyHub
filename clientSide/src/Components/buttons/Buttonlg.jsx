import { useState } from "react";

/* eslint-disable react/prop-types */
const Buttonlg = ({text}) => {
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => {
            setIsClicked(false);
          }, 300);
      };
    const clickStyle = {
      borderRadius: '0.5rem',
      transform: isClicked ? 'scale(0.95)' : 'scale(1)',
      backgroundColor: isClicked ? '#f88703' : '',
      color: isClicked ? 'white' : '',
      transition: 'transform 0.2s ease-out',
      };
    return (
        <button className={`px-8 text-lg font-bold border-2 border-solid uppercase border-[#f88703] py-3`} style={clickStyle} onClick={handleClick}>{text}</button>
    );
};

export default Buttonlg;