import { updateProfile } from "firebase/auth";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import swal from 'sweetalert';
import { AuthContext } from "../../Firebase AuthProvider/AuthProvider";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import GoogleSignIn from "./GoogleSignIn";

const Registration = () => {
    const navigate = useNavigate();
    const {createUser} = useContext(AuthContext)
    const axiosPublic = useAxiosPublic()
    const handleRegister = e => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        const password = form.get('password')
        const name = form.get('name')
        const email = form.get('email')
        // eslint-disable-next-line no-unused-vars
        const photo = form.get('photoURL')
        //Create user in firebase
        if (password.length<6){            
            return swal("Ooops...!", "Password has to be 6 character long", "error");
        }
        else if (!/[A-Z]/.test(password)) {
            return swal("Ooops...!", "Password must contain at least one capital letter.", "error");            
        }
        // eslint-disable-next-line no-useless-escape
        else if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) {
            return swal("Ooops...!", "Password must contain at least one special character", "error");            
        }else{
            createUser(email, password)
            .then(result => {
                console.log(result.user)             
                updateProfile(result.user, {
                    displayName: name,
                    photoURL: photo
                })
                const userInfo = {
                    email: result.user?.email,
                    name: name,
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
            .catch(error => {
                console.error(error);
                swal("Ooops...!", "Account already exist", "error");
            })
        }
    }

    return (
        <div className="max-w-7xl mx-auto my-40 px-6 rounded-xl py-3">
            <div className="p-10 my-6">           
                <form onSubmit={handleRegister}>
                    <h2 className="text-5xl mb-10 text-left font-semibold text-[#f88703]">Register your account</h2>
                    <h1 className="mb-4 text-lg text-[#f88703">Your Name</h1>
                    <input style={{borderRadius:'0.5rem'}} className="mb-4 rounded-lg px-6 py-3 w-4/5 border border-solid border-[#f88703]" type="name" name="name" id="011" placeholder="Enter name...." required/>
                    <h1 className="mb-4 text-lg text-[#f88703">Your Photo URL</h1>
                    <input style={{borderRadius:'0.5rem'}} className="mb-4 rounded-lg px-6 py-3 w-4/5 border border-solid border-[#f88703]" type="name" name="photoURL" id="012" placeholder="Enter photo url...."/>
                    <h1 className="mb-4 text-lg text-[#f88703">Your Email</h1>
                    <input style={{borderRadius:'0.5rem'}} className="mb-4 rounded-lg px-6 py-3 w-4/5 border border-solid border-[#f88703]" type="email" name="email" id="1" placeholder="Enter email..." required/>
                    <h1 className="mb-4 text-lg text-[#f88703">Your Password</h1>
                    <input style={{borderRadius:'0.5rem'}} className="mb-4 rounded-lg px-6 py-3 w-4/5 border border-solid border-[#f88703]" type="password" name="password" id="2" placeholder="Enter password..." required/>
                    <input className="btn btn-primary text-white text-lg mb-4 w-4/5 bg-[#FFE72F] border-none" type="submit" name="" id="3" value="REGISTER"/>
                </form>             
                <p className="my-4 text-base font-medium">Already Have an Account?<Link to="/login"><span className="text-[#FFE72F] underline text-lg font-bold"> Login Now</span></Link></p> 
                {/* The "or" portion*/}
                <div className="flex flex-row items-center w-full">
                    <div className="border border-solid border-[#f88703] w-36">
                    </div>
                    <p className="mx-4">or</p>
                    <div className="border border-solid border-[#f88703] w-36">
                    </div>
                </div>
                <GoogleSignIn></GoogleSignIn>
            </div>         
        </div>
    );
};

export default Registration;