/* eslint-disable react/prop-types */
import { useState } from "react";

const Buttonmd = ({text}) => {
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => {
            setIsClicked(false);
          }, 300);
      };
    const clickStyle = {
        borderRadius: '0.45rem',
        transform: isClicked ? 'scale(0.95)' : 'scale(1)',
        backgroundColor: isClicked ? '#f88703' : '#fff',
        color: isClicked ? 'white' : '',
        transition: 'transform 0.2s ease-out',
      };
    return (
        <button className={`px-4 font-bold border-2 border-solid uppercase border-[#f88703] py-2`} style={clickStyle} onClick={handleClick}>{text}</button>
    );
};

export default Buttonmd;