import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";

const axiosSecure = axios.create({
    baseURL: 'https://surveyhubserver.vercel.app'
})
const useAxiosSecure = () => {

    const navigate = useNavigate();
    const { logout } = useContext(AuthContext)
    axiosSecure.interceptors.request.use(
        function(config) {
            const token = localStorage.getItem('access-token');
            config.headers.authorization = `Bearer ${token}`
            return config
        },
        error => {
            return Promise.reject(error)
        }
    )
    axiosSecure.interceptors.response.use(
        function(response) {
            return response;
        }, async function(error) {
            const status = error.response.status;
            if (status === 401 || status === 403){
                await logout();
                navigate('/login')
            }
            return Promise.reject(error);
        }
    )
    return axiosSecure;
};

export default useAxiosSecure;