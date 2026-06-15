import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { useContext } from "react";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";

// ── Fetch full profile ────────────────────────────────────────────────────────
export const useProfileStats = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["profile-stats", user?.email],
    enabled: !!user?.email,
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
      queryClient.invalidateQueries({ queryKey: ["profile", user?.email] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats", user?.email] });
    },
  });
};

// ── Toggle auto AI insight ────────────────────────────────────────────────────
export const useToggleAutoAIInsight = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await axiosSecure.patch("/api/profile/auto-ai-insight");
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.email] });
    },
  });
};
