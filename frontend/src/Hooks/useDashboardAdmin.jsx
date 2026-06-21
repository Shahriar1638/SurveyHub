import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

/**
 * useDashboardAdmin — hooks for the admin control center
 */

/** Overview KPIs + health metrics */
export const useAdminOverview = () => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["dashboard", "admin", "overview"],
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/homepages/admin");
      return res.data?.data || {};
    },
  });
};

/** Paginated reports */
export const useAdminReports = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  const { status, type, search, sort, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ["dashboard", "admin", "reports", status, type, search, sort, page, limit],
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (type) params.set("type", type);
      if (search) params.set("search", search);
      if (sort) params.set("sort", sort);
      params.set("page", page);
      params.set("limit", limit);
      const res = await axiosSecure.get(`/api/dashboard/admin/reports?${params.toString()}`);
      return res.data;
    },
  });
};

/** Update a report (status, admin response, action) */
export const useUpdateReport = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, ...body }) => {
      const res = await axiosSecure.patch(`/api/dashboard/admin/reports/${reportId}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin", "overview"] });
    },
  });
};

/** Paginated audit logs */
export const useAuditLogs = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  const { page = 1, limit = 30, action } = filters;

  return useQuery({
    queryKey: ["dashboard", "admin", "audit-logs", action, page, limit],
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (action) params.set("action", action);
      params.set("page", page);
      params.set("limit", limit);
      const res = await axiosSecure.get(`/api/dashboard/admin/audit-logs?${params.toString()}`);
      return res.data;
    },
  });
};

/** Site feedback (reuses existing /api/feedback admin endpoint) */
export const useAdminFeedback = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  const { status, feedbackType, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ["dashboard", "admin", "feedback", status, feedbackType, page, limit],
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (feedbackType) params.set("feedbackType", feedbackType);
      params.set("page", page);
      params.set("limit", limit);
      const res = await axiosSecure.get(`/api/feedback?${params.toString()}`);
      return res.data;
    },
  });
};

/** Update a feedback ticket (status + admin response) */
export const useUpdateFeedback = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ feedbackId, ...body }) => {
      const res = await axiosSecure.patch(`/api/feedback/${feedbackId}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin", "feedback"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "user", "support"] });
    },
  });
};

/** Send a broadcast */
export const useSendBroadcast = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body) => {
      const res = await axiosSecure.post("/api/dashboard/admin/broadcast", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin", "audit-logs"] });
    },
  });
};
