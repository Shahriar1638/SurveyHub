import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

/**
 * useGeminiUsage — fetches today's Gemini API usage stats.
 */
export function useGeminiUsage() {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["geminiUsage"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/usage/gemini");
      return res.data?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // refetch every 5 min
  });
}
