/* eslint-disable no-unused-vars */
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Firebase AuthProvider/AuthProvider";
import GoogleSignIn from "./GoogleSignIn";


const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [error , setError] = useState('')
    const [success, setSuccess] = useState('')
    const { signInUser } = useContext(AuthContext)
    const handleLogin = e => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        const email = form.get('email')
        const password = form.get('password')
        setError('')    
        setSuccess('')
        signInUser(email, password)
            .then(result => {
                console.log(result.user)
                setSuccess('SuccessFully Verified')
                e.target.reset()
                navigate(location?.state ? location.state : '/')
                })
            .catch(error => {
                console.error(error);
                setError(error.code);
            })
    }
    
    return (
        <div className="max-w-7xl my-52 lg:max-w-[90rem] mx-auto">
            {/* <div className="rounded-xl bg-white"> */}
                <h1 className="text-center text-[#f88703] my-10 text-5xl font-bold">Login your account</h1>
                <div className="my-12">
                    <form onSubmit={handleLogin} className="md:w-3/4 mx-auto">
                        <h1 className="mb-4 text-lg text-[#f88703]">Your Email</h1>
                        <input style={{borderRadius:'0.5rem'}} className="mb-4 rounded-lg px-6 py-3 w-full border border-solid border-[#f88703]" type="email" name="email" id="1" placeholder="Enter email..." required/>
                        <h1 className="mb-4 text-lg text-[#f88703]">Your Password</h1>
                        <input style={{borderRadius:'0.5rem'}} className="mb-4 rounded-lg px-6 py-3 w-full border border-solid border-[#f88703]" type="password" name="password" id="2" placeholder="Enter password..." required/>
                        <div className="form-control mt-4">
                            <button className="btn btn-primary text-white font-semibold text-lg bg-[#FFE72F] border-none">Login</button>
                        </div>
                        {
                            error && <p className="text-red-700">{error}</p>
                        }
                        {
                            success && <p className="text-green-700">{success}</p>
                        }
                        <div className="flex mt-6 flex-col items-center">
                            <p className="mb-2 text-base font-medium">Dont Have Any Account?<Link to="/registration"><span className="text-[#FFE72F] underline font-bold"> Click Here to Register!</span></Link></p>
                            {/* The "or" portion*/}
                            <div>
                                <div className="flex flex-row items-center w-full">
                                    <div className="border border-solid border-[#f88703] w-48">
                                    </div>
                                    <p className="mx-4">or</p>
                                    <div className="border border-solid border-[#f88703] w-48">
                                    </div>
                                </div>
                            </div>
                            <GoogleSignIn></GoogleSignIn>
                        </div>     
                    </form>
                </div>
            {/* </div> */}
        </div>
               
    );
};

export default Login;