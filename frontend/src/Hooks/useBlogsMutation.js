import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      queryClient.invalidateQueries({ queryKey: ["myBlogs"] });
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
      queryClient.invalidateQueries({ queryKey: ["myBlogs"] });
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
      queryClient.invalidateQueries({ queryKey: ["myBlogs"] });
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
      queryClient.invalidateQueries({ queryKey: ["myBlogs"] });
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

/**
 * useMyBlogs — fetches all blogs for the logged-in surveyor with sorting, search, filter.
 */
export function useMyBlogs({ sort, search, status } = {}) {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["myBlogs", { sort, search, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sort) params.set("sort", sort);
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await axiosSecure.get(`/api/blogs/mine?${params.toString()}`);
      return res.data?.data || [];
    },
  });
}

/**
 * useBlogForEdit — fetches a single blog for editing (owner only).
 */
export function useBlogForEdit(id) {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["blog", "edit", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/blogs/${id}/edit-data`);
      return res.data?.data;
    },
    enabled: !!id,
  });
}
