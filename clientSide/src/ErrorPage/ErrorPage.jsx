import { Link } from "react-router-dom";
import error from "../assets/error.png"
const ErrorPage = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <img className=" h-[30rem]" src={error} alt="" />
            <h1 className="text-5xl text-center font-bold my-8"> Page Not Found. <br /> <br /> The page you are looking for does not exist.</h1>
            <button className="btn font-bold btn-primary border-none bg-[#0DD3FA]"><Link to='/'>Go back Home</Link></button>
        </div>
    );
};

export default ErrorPage;