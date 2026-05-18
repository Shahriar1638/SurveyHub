import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { useContext } from "react";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";

// ── Fetch full profile ────────────────────────────────────────────────────────
export const useProfileStats = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: [user?.email, "profile-stats"],
    enabled: !!user?.email && !!localStorage.getItem("access-token"),
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/profile/stats");
      return res.data.data;
    },
  });
};

// ── Update profile mutation ───────────────────────────────────────────────────
export const useUpdateProfile = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates) => {
      const res = await axiosSecure.patch("/api/profile/me", updates);
      return res.data.data;
    },
    onSuccess: () => {
      // Invalidate both profile caches so they refetch fresh data
      queryClient.invalidateQueries({ queryKey: [user?.email, "profile"] });
      queryClient.invalidateQueries({ queryKey: [user?.email, "profile-stats"] });
    },
  });
};
