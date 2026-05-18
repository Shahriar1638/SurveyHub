import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

/**
 * useBlogsInfinite — fetches paginated blogs for infinite feed list.
 */
export function useBlogsInfinite(limit = 5) {
  const axiosPublic = useAxiosPublic();

  return useInfiniteQuery({
    queryKey: ["blogs"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosPublic.get(`/api/blogs?page=${pageParam}&limit=${limit}`);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.pagination.hasMore ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * useBlogDetail — fetches a single blog by ID with comments and replies.
 */
export function useBlogDetail(id) {
  const axiosPublic = useAxiosPublic();

  return useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/api/blogs/${id}`);
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
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userEmail, reactionType }) => {
      const res = await axiosPublic.post(`/api/blogs/${id}/react`, {
        userEmail,
        reactionType,
      });
      return res.data.data;
    },
    onSuccess: () => {
      // Invalidate the cache to fetch fresh counts and user reactions
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}

/**
 * useBlogComment — adds a comment to a blog.
 */
export function useBlogComment(id) {
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userEmail, text }) => {
      const res = await axiosPublic.post(`/api/blogs/${id}/comments`, {
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
