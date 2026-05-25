import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { useContext } from "react";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";

/**
 * useDashboardSurveyor — fetches surveyor dashboard data from /api/homepages/surveyor
 * Returns: { kpis, publishedSurveys, draftSurveys, recentBlogActivity }
 */
const useDashboardSurveyor = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["dashboard", "surveyor", user?.email],
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 2, // 2 minutes — dashboard data should be fairly fresh
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/api/homepages/surveyor?email=${encodeURIComponent(user.email)}`
      );
      return res.data?.data || {};
    },
  });
};

export default useDashboardSurveyor;
