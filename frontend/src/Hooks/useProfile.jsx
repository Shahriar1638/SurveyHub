import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { useContext } from "react";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";

const useProfile = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["profile", user?.email],
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 5, // 5 minutes — keeps role/ban status reasonably fresh
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: true,
    queryFn: async () => {
      // Get the full profile including role (admin, user, surveyor)
      const res = await axiosSecure.get(`/api/users/${user.email}`);
      return res.data;
    },
  });
};

export default useProfile;
