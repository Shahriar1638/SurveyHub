import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { useContext } from "react";
import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";

const useSurveyor = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const { data: isSurveyor, isPending: isSurveyorLoading } = useQuery({
        queryKey: [user?.email, "surveyor"],
        enabled: !!user?.email && !!localStorage.getItem('access-token'),
        queryFn: async () => {
            const res = await axiosSecure.get(`/user/surveyor/${user.email}`);
            return res.data.surveyor;
        }
    });
    return [isSurveyor, isSurveyorLoading];
};

export default useSurveyor;