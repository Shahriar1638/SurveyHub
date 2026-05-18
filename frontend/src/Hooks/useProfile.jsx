import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { useContext } from "react";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";

const useProfile = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: [user?.email, "profile"],
    enabled: !!user?.email && !!localStorage.getItem("access-token"),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour (gcTime replaced cacheTime in v5)
    queryFn: async () => {
      // Get the full profile including role (admin, user, surveyor)
      const res = await axiosSecure.get(`/api/users/${user.email}`);
      return res.data;
    },
  });
};

export default useProfile;
