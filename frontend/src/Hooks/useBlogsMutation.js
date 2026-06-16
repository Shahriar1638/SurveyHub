import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

/**
 * useCreateBlog — creates a new blog post (draft).
 */
export function useCreateBlog() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogData) => {
      const res = await axiosSecure.post("/api/blogs", blogData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "surveyor"] });
      queryClient.invalidateQueries({ predicate: (q) => q.queryKey?.[0] === "blogs" });
    },
  });
}

/**
 * useUpdateBlog — updates an existing blog post by ID.
 */
export function useUpdateBlog() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...blogData }) => {
      const res = await axiosSecure.put(`/api/blogs/${id}`, blogData);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "surveyor"] });
      queryClient.invalidateQueries({ queryKey: ["blog", variables.id] });
      queryClient.invalidateQueries({ predicate: (q) => q.queryKey?.[0] === "blogs" });
    },
  });
}

/**
 * useDeleteBlog — deletes a blog post by ID.
 */
export function useDeleteBlog() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/api/blogs/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "surveyor"] });
      queryClient.invalidateQueries({ predicate: (q) => q.queryKey?.[0] === "blogs" });
    },
  });
}

/**
 * useAppealBlog — submits an appeal for a rejected blog.
 */
export function useAppealBlog() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, message }) => {
      const res = await axiosSecure.post(`/api/blogs/${id}/appeal`, { message });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "surveyor"] });
      queryClient.invalidateQueries({ predicate: (q) => q.queryKey?.[0] === "blogs" });
    },
  });
}

/**
 * useAdminModerateBlog — admin approves/rejects a blog.
 */
export function useAdminModerateBlog() {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, decision, reason }) => {
      const res = await axiosSecure.patch(`/api/blogs/${id}/moderate`, { decision, reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["moderationQueue"] });
    },
  });
}
