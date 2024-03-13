import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { useContext } from "react";
import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";

const useSurveyor = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const { data: isSurveyor } = useQuery({
        queryKey: [user?.email, "surveyor"],
        queryFn: async () => {
            const res = await axiosSecure.get(`/user/surveyor/${user.email}`);
            return res.data.surveyor;
        }
    });
    return [isSurveyor];
};

export default useSurveyor;