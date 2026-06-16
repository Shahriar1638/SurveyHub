import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

/**
 * useCreateSurvey — creates a new survey (draft or published).
 */
export function useCreateSurvey() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (surveyData) => {
      const res = await axiosSecure.post("/api/surveys", surveyData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "surveyor"] });
    },
  });
}

/**
 * useUpdateSurvey — updates an existing survey by ID.
 */
export function useUpdateSurvey() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...surveyData }) => {
      const res = await axiosSecure.put(`/api/surveys/${id}`, surveyData);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "surveyor"] });
      queryClient.invalidateQueries({ queryKey: ["survey", variables.id] });
    },
  });
}

/**
 * useDeleteSurvey — deletes a survey by ID.
 */
export function useDeleteSurvey() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/api/surveys/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "surveyor"] });
    },
  });
}

/**
 * useAppealSurvey — submits an appeal for a rejected survey.
 */
export function useAppealSurvey() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, message }) => {
      const res = await axiosSecure.post(`/api/surveys/${id}/appeal`, { message });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "surveyor"] });
    },
  });
}

/**
 * useAdminModerateSurvey — admin approves/rejects a survey.
 */
export function useAdminModerateSurvey() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, decision, reason }) => {
      const res = await axiosSecure.patch(`/api/surveys/${id}/moderate`, { decision, reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["moderationQueue"] });
    },
  });
}
