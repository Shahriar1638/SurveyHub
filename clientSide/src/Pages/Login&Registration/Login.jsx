/* eslint-disable no-unused-vars */
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Firebase AuthProvider/AuthProvider";
import GoogleSignIn from "./GoogleSignIn";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [error , setError] = useState('')
    const [success, setSuccess] = useState('')
    const { signInUser } = useContext(AuthContext)
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = e => {
        e.preventDefault()
        setIsSubmitting(true);
        const form = new FormData(e.currentTarget)
        const email = form.get('email')
        const password = form.get('password')
        setError('')    
        setSuccess('')
        
        signInUser(email, password)
            .then(result => {
                setSuccess('Successfully Verified')
                e.target.reset()
                navigate(location?.state ? location.state : '/')
                setIsSubmitting(false)
            })
            .catch(error => {
                setError("Invalid email or password. Please try again.");
                setIsSubmitting(false)
            })
    }
    
    return (
        <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-gray-50/50 px-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-brand-500/5 border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-50 rounded-bl-full pointer-events-none -z-10 opacity-70"></div>
                
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-black text-navy-950 mb-3 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-xl font-medium text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl font-medium text-center">
                            {success}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-900 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <FaEnvelope />
                            </div>
                            <input 
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-navy-950 font-medium placeholder-gray-400" 
                                type="email" 
                                name="email" 
                                placeholder="name@example.com" 
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-900 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <FaLock />
                            </div>
                            <input 
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-navy-950 font-medium placeholder-gray-400" 
                                type="password" 
                                name="password" 
                                placeholder="••••••••" 
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            disabled={isSubmitting}
                            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center ${
                                isSubmitting ? 'bg-brand-400 cursor-not-allowed opacity-70' : 'bg-brand-500 hover:bg-brand-600 hover:-translate-y-0.5 shadow-brand-500/20'
                            }`}
                        >
                            {isSubmitting ? (
                                <span className="loading loading-spinner text-white loading-sm"></span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 mb-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <GoogleSignIn />
                </div>

                <div className="text-center text-sm font-medium text-gray-600">
                    Don't have an account? 
                    <Link to="/registration" className="ml-2 text-brand-600 hover:text-brand-700 font-bold hover:underline transition-colors">
                        Create one now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;