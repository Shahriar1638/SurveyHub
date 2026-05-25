import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

/**
 * useDashboardUser — hooks for the regular logged-in user dashboard
 */

/** User dashboard stats overview */
export const useUserOverview = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["dashboard", "user", "overview"],
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/user/overview");
      return res.data?.data || {};
    },
  });
};

/** User participation ledger */
export const useUserParticipation = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["dashboard", "user", "participation"],
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/user/participation");
      return res.data?.data || [];
    },
  });
};

/** User submitted surveys/blogs reports status */
export const useUserReports = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["dashboard", "user", "reports"],
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/user/reports");
      return res.data?.data || [];
    },
  });
};

/** User general support / site feedback tickets */
export const useUserSupport = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["dashboard", "user", "support"],
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/dashboard/user/support");
      return res.data?.data || [];
    },
  });
};

/** Submit a new support / feedback ticket */
export const useSubmitSupportTicket = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body) => {
      const res = await axiosSecure.post("/api/feedback", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "user", "support"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "user", "overview"] });
    },
  });
};
