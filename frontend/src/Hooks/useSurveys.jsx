import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

/**
 * useSurveys — fetches public surveys (published + expired) with filtering & sorting.
 * @param {object} filters - { sort, category, search, length, statusFilter, dateFrom, dateTo }
 */
const useSurveys = (filters = {}) => {
  const axiosSecure = useAxiosSecure();

  const { sort, category, search, length, statusFilter, dateFrom, dateTo } = filters;

  return useQuery({
    queryKey: ["surveys", sort, category, search, length, statusFilter, dateFrom, dateTo],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sort) params.set("sort", sort);
      if (category && category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      if (length) params.set("length", length);
      if (statusFilter) params.set("statusFilter", statusFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await axiosSecure.get(`/api/surveys?${params.toString()}`);
      return res.data;
    },
  });
};

export default useSurveys;
