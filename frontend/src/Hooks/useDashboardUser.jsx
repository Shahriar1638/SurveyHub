import { useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";

/**
 * useDashboardUser — hooks for the regular logged-in user dashboard
 */

/** User dashboard stats overview */
export const useUserOverview = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["dashboard", "user", "overview", user?.email],
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/user/overview");
      return res.data?.data || {};
    },
  });
};

/** User participation ledger */
export const useUserParticipation = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["dashboard", "user", "participation", user?.email],
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/user/participation");
      return res.data?.data || [];
    },
  });
};

/** User submitted surveys/blogs reports status */
export const useUserReports = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["dashboard", "user", "reports", user?.email],
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/user/reports");
      return res.data?.data || [];
    },
  });
};

/** User general support / site feedback tickets */
export const useUserSupport = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["dashboard", "user", "support", user?.email],
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/user/support");
      return res.data?.data || [];
    },
  });
};

/** Submit a new support / feedback ticket */
export const useSubmitSupportTicket = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body) => {
      const res = await axiosSecure.post("/api/feedback", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "user", "support", user?.email] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "user", "overview", user?.email] });
    },
  });
};
