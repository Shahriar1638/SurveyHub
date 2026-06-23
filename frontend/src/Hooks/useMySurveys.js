import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

/**
 * useMySurveys — fetches all surveys for the logged-in surveyor.
 * keepPreviousData: true so the table doesn't flash empty during refetch.
 */
export function useMySurveys({ status, search, sort, order } = {}) {
  const axiosSecure = useAxiosSecure();

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  if (order) params.set("order", order);

  return useQuery({
    queryKey: ["mySurveys", { status, search, sort, order }],
    keepPreviousData: true,
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/surveys/mine?${params.toString()}`);
      return res.data?.data || [];
    },
  });
}

/**
 * useSurveyFeedback — fetches all feedback for a specific survey.
 */
export function useSurveyFeedback(surveyId) {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["surveyFeedback", surveyId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/surveys/${surveyId}/feedback`);
      return res.data?.data || { feedbacks: [], total: 0, avgRating: null };
    },
    enabled: !!surveyId,
  });
}

/**
 * useToggleAIInsight — toggles aiInsight.autoGenerate for a single survey.
 */
export function useToggleAIInsight() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, autoGenerate }) => {
      const res = await axiosSecure.patch(`/api/surveys/${id}/ai-insight`, { autoGenerate });
      return res.data;
    },
    onMutate: async ({ id, autoGenerate }) => {
      await queryClient.cancelQueries({ queryKey: ["mySurveys"] });
      const previous = queryClient.getQueriesData({ queryKey: ["mySurveys"] });

      queryClient.setQueriesData({ queryKey: ["mySurveys"] }, (old) => {
        if (!old) return old;
        return old.map((s) =>
          s._id === id ? { ...s, aiInsight: { ...s.aiInsight, autoGenerate } } : s
        );
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["mySurveys"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "surveyor"] });
    },
  });
}

/**
 * useRecycleBin — fetches soft-deleted surveys for the logged-in surveyor.
 */
export function useRecycleBin() {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["recycleBin"],
    keepPreviousData: true,
    queryFn: async () => {
      const res = await axiosSecure.get("/api/surveys/recycle-bin");
      return res.data?.data || [];
    },
  });
}

/**
 * useRestoreSurvey — restores a soft-deleted survey with optimistic update.
 */
export function useRestoreSurvey() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.post(`/api/surveys/${id}/restore`);
      return res.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["recycleBin"] });
      const previous = queryClient.getQueriesData({ queryKey: ["recycleBin"] });

      queryClient.setQueriesData({ queryKey: ["recycleBin"] }, (old) => {
        if (!old) return old;
        return old.filter((s) => s._id !== id);
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recycleBin"] });
      queryClient.invalidateQueries({ queryKey: ["mySurveys"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "surveyor"] });
    },
  });
}
