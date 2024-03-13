import { useContext } from 'react';
import { AuthContext } from '../../Firebase AuthProvider/AuthProvider';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import Swal from 'sweetalert2';
import Gicon from "../../assets/google.png"

const GoogleSignIn = () => {
    const {signInWithGoogle} = useContext(AuthContext)
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const handleGoogleSignIn = () => {
        signInWithGoogle()
        .then(result =>{
            const userInfo = {
                email: result.user?.email,
                name: result.user?.displayName,
                role: 'user'
            }
            axiosPublic.post('/users', userInfo)
            .then(res => {
                console.log(res.data);
                if(res.data.insertedId){
                    console.log('User created in firebase')                   
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'You are using free membership',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            })
            navigate('/');
            swal("SuccessFully Registered", "Your registration is done. Redirecting to Home page", "success");
        })
    }
    return (
        <div onClick={handleGoogleSignIn} className="flex flex-row gap-4 my-4 w-72 items-center px-4 py-2 rounded-l-full rounded-r-full border border-solid border-[#FFE72F]" style={{ cursor: 'pointer' }}>
            <img className="w-10 h-10" src={Gicon} />
            <p className="text-base font-medium text-black">Continue with Google</p>              
        </div>  
    );
};

export default GoogleSignIn;