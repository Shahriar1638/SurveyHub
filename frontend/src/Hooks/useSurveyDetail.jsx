import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import useAxiosSecure from "./useAxiosSecure";

/**
 * useSurveyDetail — fetches a single survey by ID.
 */
export function useSurveyDetail(id) {
  const axiosPublic = useAxiosPublic();

  return useQuery({
    queryKey: ["survey", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/api/surveys/${id}`);
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
}

/**
 * useMyResponse — fetches an existing draft or submitted response for a user.
 */
export function useMyResponse(surveyId, userId) {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["survey-response", surveyId, userId],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/api/surveys/${surveyId}/my-response?userId=${userId}`
      );
      return res.data.data; // null if no existing response
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!surveyId && !!userId,
  });
}

/**
 * useSubmitResponse — submits or saves a draft response.
 */
export function useSubmitResponse(surveyId) {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, answers, isDraft }) => {
      const res = await axiosSecure.post(`/api/surveys/${surveyId}/respond`, {
        userId,
        answers,
        isDraft,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the survey (participantCount) and the user's response cache
      queryClient.invalidateQueries({ queryKey: ["survey", surveyId] });
      queryClient.invalidateQueries({
        queryKey: ["survey-response", surveyId, variables.userId],
      });
    },
  });
}

/**
 * useSubmitSurveyFeedback — submits feedback for a survey.
 */
export function useSubmitSurveyFeedback(surveyId) {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rating, comment, suggestions }) => {
      const res = await axiosSecure.post(`/api/surveys/${surveyId}/feedback`, {
        rating,
        comment,
        suggestions,
      });
      return res.data;
    },
    onSuccess: () => {
      // refresh survey data (feedback counts, etc.)
      queryClient.invalidateQueries({ queryKey: ["survey", surveyId] });
    },
    onError: (err) => {
      console.error("submitSurveyFeedback error:", err);
    },
  });
}
