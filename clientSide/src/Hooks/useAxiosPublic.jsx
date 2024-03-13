import axios from "axios";

const axiosPublic = axios.create({
    baseURL: 'https://surveyhubserver.vercel.app'
})
const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;