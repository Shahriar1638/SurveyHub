/* eslint-disable no-unused-vars */
import { useState,useContext, useEffect } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { TbPlaylistX } from "react-icons/tb";
import { BsPersonCircle } from "react-icons/bs";
import { Link,NavLink } from "react-router-dom";
import logo from "../../../assets/Logo.png";
import { AuthContext } from "../../../Firebase AuthProvider/AuthProvider";
import { useLocation } from "react-router-dom";

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const { user, logOut } = useContext(AuthContext)
    const location = useLocation();
    const handleLogOut = () =>{
        logOut()
        .then(result => {
            console.log(result.user)
        })
        .catch(error => {
            console.error(error);
        })
    }  
    const Options = 
    <>
        <li className="text-base font-semibold"><NavLink to="/" className={({ isActive, isPending }) =>isPending ? "pending" : isActive ? "text-[#0DD3FA]" : ""}>Home</NavLink></li>
        <li className="text-base font-semibold"><NavLink to={`/surveys`} className={({ isActive, isPending }) =>isPending ? "pending" : isActive ? "text-[#0DD3FA]" : ""}>Surveys</NavLink></li>
        {/* <li className="text-base font-semibold"><NavLink to={`/myjobs?email=${user?.email}`} className={({ isActive, isPending }) =>isPending ? "pending" : isActive ? "text-[#0DD3FA]" : ""}>My Posted Job</NavLink></li> */}
        <li className="text-base font-semibold"><NavLink to={`/dashboard`} className={({ isActive, isPending }) =>isPending ? "pending" : isActive ? "text-[#0DD3FA]" : ""}>Dashboard</NavLink></li>
        <li className="text-base font-semibold"><NavLink to={`/payment`} className={({ isActive, isPending }) =>isPending ? "pending" : isActive ? "text-[#0DD3FA]" : ""}>Become a Premium member</NavLink></li>
        <li className={'text-base font-semibold'}><NavLink to='/login' className={({ isActive, isPending }) =>isPending ? "pending" : isActive ? "text-[#0DD3FA]" : ""}>Login</NavLink></li>
    </>
    const isHomePage = location.pathname === "/";

    return (
        <nav className={`flex flex-row h-24 justify-between items-center px-4 md:px-8 border-2 border-solid border-black absolute inset-0 text-white ${isHomePage ? "" : "bg-black"}`}>
            {/* When device is larger or equal to mid size device logo below will show left */}
            <div className="hidden lg:block">
                <div className=" flex flex-row items-center">
                   <img className="w-full h-16 mr-4 border-2 border-solid border-white rounded-full" src={logo} alt="" />
                   <h1 className="text-2xl font-bold">Survey<span className="text-[#0DD3FA]">Hub</span></h1> 
                </div>          
            </div>
            
            <div>
                {/* Icon for drop down navbar */}
                <div className="lg:hidden" onClick={()=> setOpen(!open)}>
                    {
                        open === true ? <TbPlaylistX className="text-4xl text-[#FFE72F]"></TbPlaylistX> : <AiOutlineMenu className="text-4xl text-[#FFE72F]"></AiOutlineMenu>
                    }   
                </div> 
                <div>
                    <ul className={`md:flex md:gap-8 items-center absolute lg:static ${open? 'top-20 duration-1000 text-left left-2 bg-[#101326] rounded-md p-4': '-top-40 text-left left-2 '}`}>
                        {Options}
                    </ul>          
                </div>          
            </div>
            {/* When it is mid size device or below , Logo at center will be visible */}
            <div className="lg:hidden">
                <div className=" flex flex-row items-center">
                   <img className="w-full h-16 mr-2 border-2 border-solid border-white rounded-full" src={logo} alt="" />
                   <h1 className="text-2xl font-bold">Dev<span className="text-[#0DD3FA]">Junction</span></h1> 
                </div>  
            </div>
            {/* User name of navbar */}
            <div className="flex flex-row items-center">
                {
                    user ? <>
                        <div className="flex flex-row items-center">
                            {
                                user.photoURL? <div className="avatar">
                                                    <div className="w-10 mr-4 rounded-full">
                                                            <img src={user.photoURL} />
                                                    </div>
                                                </div>:
                                                <BsPersonCircle className="text-4xl text-[#0DD3FA] mr-4"></BsPersonCircle>
                                }
                                <span className="mr-4 text-xl hidden md:block">{user.displayName}</span>
                            </div>                     
                            <a className="btn bg-[#FFE72F] border-none" onClick={handleLogOut}>Sign Out</a>
                        </>
                        :
                        <div className="flex flex-row items-center">
                                <BsPersonCircle className="text-4xl text-[#0DD3FA] mr-4"></BsPersonCircle>
                                <Link className="btn bg-[#FFE72F] border-none font-semibold" to="/login">Log In</Link>
                        </div>                         
                    }
            </div>          
        </nav>
    );
};

export default Navbar;