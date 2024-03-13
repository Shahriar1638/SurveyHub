import logo from "../../../assets/Logo.png";
import { MdFacebook } from "react-icons/md";
import { FaXTwitter,FaLinkedin } from "react-icons/fa6";

const Footer = () => {
  return (
    <div className="mt-52 bg-[#080705]">
      <footer className="footer p-10 text-base-content z-50">
        <aside>
          <div className=" flex sm:flex-row md:flex-col lg:flex-row items-center">
              <img className="lg:ml-48 w-28 h-full mr-4 border-2 border-solid border-white rounded-full" src={logo} alt="" />
              <h1 className="text-5xl font-extrabold text-white">Survey<span className="text-[#0DD3FA]">Hub</span></h1> 
          </div>
        </aside>
        <nav className="">
          <header className="text-xl font-semibold mb-1 text-[#FFE72F]">Company</header>
          <a className="link link-hover text-lg font-medium -mb-2 text-sky-400">About us</a>
          <a className="link link-hover text-lg font-medium -mb-2 text-sky-400">Contact</a>
          <a className="link link-hover text-lg font-medium -mb-2 text-sky-400">Jobs</a>
          <a className="link link-hover text-lg font-medium -mb-2 text-sky-400">Press kit</a>
        </nav>
        <nav>
          <header className="text-xl font-semibold mb-1 text-[#FFE72F]">Legal</header> 
          <a className="link link-hover text-lg font-medium -mb-2 text-sky-400">Terms of use</a>
          <a className="link link-hover text-lg font-medium -mb-2 text-sky-400">Privacy policy</a>
          <a className="link link-hover text-lg font-medium -mb-2 text-sky-400">Cookie policy</a>
        </nav>
        <nav>
          <header className="mb-1 text-[#FFE72F] text-xl font-semibold">Social</header> 
          <div className="grid grid-flow-col gap-4">
            <MdFacebook className="text-4xl text-[#316FF6]"></MdFacebook>
            <FaXTwitter className="text-4xl text-white"></FaXTwitter>
            <FaLinkedin className="text-4xl text-[#0077b5]"></FaLinkedin>
          </div>
        </nav>
      </footer>
      <p className="pb-8 ml-10 text-white md:ml-0 md:text-center">Copyright © 2023 - All right reserved by DevJunction Industries Ltd</p>
    </div>
  );
};

export default Footer;
