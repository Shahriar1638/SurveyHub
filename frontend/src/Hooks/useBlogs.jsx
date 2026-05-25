import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

/**
 * useBlogsInfinite — fetches paginated blogs for infinite feed list.
 */
// initialSize: how many items for the first page (5 or 6),
// stepSize: how many items to load for subsequent pages (e.g., 2 or 3)
export function useBlogsInfinite(initialSize = 6, stepSize = 2) {
  const axiosSecure = useAxiosSecure();

  return useInfiniteQuery({
    // include sizes in the key so different UX choices don't collide
    queryKey: ["blogs", initialSize, stepSize],
    queryFn: async ({ pageParam = 1 }) => {
      const pageSize = pageParam === 1 ? initialSize : stepSize;
      const res = await axiosSecure.get(`/api/blogs?page=${pageParam}&limit=${pageSize}`);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.pagination?.hasMore ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * useBlogDetail — fetches a single blog by ID with comments and replies.
 */
export function useBlogDetail(id) {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/blogs/${id}`);
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
}

/**
 * useBlogReact — toggles a reaction on a blog.
 */
export function useBlogReact(id) {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userEmail, reactionType }) => {
      const res = await axiosSecure.post(`/api/blogs/${id}/react`, {
        userEmail,
        reactionType,
      });
      return res.data.data;
    },
    onSuccess: () => {
      // Invalidate the cache to fetch fresh counts and user reactions
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      // Invalidate all feed variants (different page sizes) by predicate
      queryClient.invalidateQueries({ predicate: (q) => q.queryKey?.[0] === "blogs" });
    },
  });
}

/**
 * useBlogComment — adds a comment to a blog.
 */
export function useBlogComment(id) {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userEmail, text }) => {
      const res = await axiosSecure.post(`/api/blogs/${id}/comments`, {
        userEmail,
        text,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
    },
  });
}

/**
 * useBlogReply — posts a reply to a specific comment on a blog
 */
export function useBlogReply(id) {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, userEmail, text }) => {
      const res = await axiosSecure.post(
        `/api/blogs/${id}/comments/${commentId}/replies`,
        { userEmail, text },
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
    },
  });
}
