import { updateProfile } from "firebase/auth";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import swal from 'sweetalert';
import { AuthContext } from "../../Firebase AuthProvider/AuthProvider";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import GoogleSignIn from "./GoogleSignIn";
import { FaEnvelope, FaLock, FaUser, FaImage } from "react-icons/fa";

const Registration = () => {
    const navigate = useNavigate();
    const {createUser} = useContext(AuthContext)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const axiosPublic = useAxiosPublic()
    
    const handleRegister = e => {
        e.preventDefault()
        setIsSubmitting(true);
        const form = new FormData(e.currentTarget)
        const password = form.get('password')
        const name = form.get('name')
        const email = form.get('email')
        const photo = form.get('photoURL')
        
        // Password Verification
        if (password.length < 6){            
            setIsSubmitting(false);
            return swal("Wait!", "Password has to be at least 6 characters long.", "error");
        }
        else if (!/[A-Z]/.test(password)) {
            setIsSubmitting(false);
            return swal("Wait!", "Password must contain at least one capital letter.", "error");            
        }
        else if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) {
            setIsSubmitting(false);
            return swal("Wait!", "Password must contain at least one special character.", "error");            
        } else {
            createUser(email, password)
            .then(result => {            
                updateProfile(result.user, {
                    displayName: name,
                    photoURL: photo
                });
                const userInfo = {
                    email: result.user?.email,
                    name: name,
                    role: 'user'
                };
                axiosPublic.post('/users', userInfo)
                .then(res => {
                    if(res.data.insertedId){                 
                        Swal.fire({
                            position: 'top-end',
                            icon: 'success',
                            title: 'Welcome to SurveyHub!',
                            text: 'You now have a free membership.',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    }
                })
                navigate('/');
                setIsSubmitting(false);
            })
            .catch(error => {
                console.error(error);
                setIsSubmitting(false);
                swal("Registration Failed", "This email account already exists.", "error");
            })
        }
    }

    return (
        <div className="min-h-screen pt-28 pb-24 flex items-center justify-center bg-gray-50/50 px-6">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl shadow-brand-500/5 border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-ocean-50 rounded-bl-full pointer-events-none -z-10 opacity-70"></div>
                
                <div className="text-center mb-10">
                     <h1 className="text-3xl sm:text-4xl font-black text-navy-950 mb-3 tracking-tight">Create Account</h1>
                     <p className="text-gray-500 text-sm">Join the platform to share your voice</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-900 ml-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <FaUser />
                            </div>
                            <input 
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-navy-950 font-medium placeholder-gray-400" 
                                type="text" 
                                name="name" 
                                placeholder="John Doe" 
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-navy-900 ml-1">Profile Photo URL (Optional)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <FaImage />
                            </div>
                            <input 
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-navy-950 font-medium placeholder-gray-400" 
                                type="url" 
                                name="photoURL" 
                                placeholder="https://..."
                            />
                        </div>
                    </div>

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
                        <p className="text-xs text-gray-400 ml-1 mt-1">Must be at least 6 characters with 1 uppercase and 1 special character.</p>
                    </div>

                    <div className="pt-4">
                         <button 
                            disabled={isSubmitting}
                            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center ${
                                isSubmitting ? 'bg-brand-400 cursor-not-allowed opacity-70' : 'bg-brand-500 hover:bg-brand-600 hover:-translate-y-0.5 shadow-brand-500/30'
                            }`}
                        >
                            {isSubmitting ? (
                                <span className="loading loading-spinner text-white loading-sm"></span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>
                </form>             
                
                <div className="mt-8 mb-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-400 font-medium">Or register using</span>
                    </div>
                </div>
                
                <div className="flex justify-center mb-8">
                    <GoogleSignIn />
                </div>

                <div className="text-center text-sm font-medium text-gray-600">
                    Already have an account? 
                    <Link to="/login" className="ml-2 text-ocean-600 hover:text-ocean-700 font-bold hover:underline transition-colors">
                        Login instead
                    </Link>
                </div>
            </div>         
        </div>
    );
};

export default Registration;