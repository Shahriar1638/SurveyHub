import { useContext, useState } from 'react';
import { AuthContext } from '../../Firebase AuthProvider/AuthProvider';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { useNavigate } from 'react-router-dom';

import Swal from 'sweetalert2';
import Gicon from "../../assets/google.png";

const GoogleSignIn = () => {
    const {signInWithGoogle} = useContext(AuthContext)
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = () => {
        setIsLoading(true);
        signInWithGoogle()
        .then(result =>{
            const userInfo = {
                email: result.user?.email,
                name: result.user?.displayName,
                role: 'user'
            }
            axiosPublic.post('/users', userInfo)
            .then(res => {
                if(res.data.insertedId){
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Authenticated Successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            })
            setIsLoading(false);
            navigate('/');
        })
        .catch(err => {
             console.error(err);
             setIsLoading(false);
        });
    }

    return (
        <button 
            disabled={isLoading}
            onClick={handleGoogleSignIn} 
            className="w-full flex items-center justify-center gap-4 bg-white hover:bg-gray-50 text-navy-900 border border-gray-200 hover:border-brand-500 rounded-xl px-6 py-3.5 shadow-sm transition-all hover:-translate-y-0.5"
        >
            <img className="w-6 h-6 object-contain" src={Gicon} alt="Google sign in" />
            <span className="font-bold text-sm">Continue with Google</span>
            {isLoading && <span className="loading loading-spinner text-brand-500 loading-sm ml-2"></span>}
        </button>  
    );
};

export default GoogleSignIn;