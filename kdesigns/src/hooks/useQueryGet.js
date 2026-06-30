import { useQuery, useQueryClient } from "@tanstack/react-query";
import Axios from "../services/axios/axios";
import { useToast } from "./useToast";

const useQueryGet = ({
  eventMessage,
  eventType,
  url = "",
  config = {},
  enabled = false,
  cacheTime = 0,
  staleTime = 0,
  retry = 0,
  select,
  refetchOnWindowFocus = false,
  placeholderData = [],
  queryKey = [eventType],
  onSuccess,
  refetchInterval,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const finalQueryKey = ["queryGet", ...queryKey, url];

  const query = useQuery({
    queryKey: finalQueryKey,
    queryFn: async ({ signal }) => {
      try {
        const response = await Axios.post({
          eventMessage,
          eventType,
          url,
          config: { ...config, signal },
        });

        return { data: response?.data?.eventMessage || response?.data };
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
          throw err; // Throw abort errors so React Query doesn't cache them as success
        }

        if (!err?.response && err.message === "Request timed out") {
          toast.error(err.message);
        } else {
          toast.error(err?.response?.data?.message || "Something went wrong");
        }
        throw err;
      }
    },
    enabled,
    retry: retry,
    gcTime: cacheTime,
    staleTime,
    select,
    refetchOnWindowFocus,
    placeholderData,
    onSuccess,
    retryOnMount: true, // Retry failed queries when component remounts
    refetchInterval,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: finalQueryKey });

  // Reset error state for a specific query
  const resetQuery = (customQueryKey) => {
    const key = Array.isArray(customQueryKey)
      ? ["queryGet", ...customQueryKey, url]
      : finalQueryKey;
    queryClient.resetQueries({ queryKey: key });
  };

  // Helper to check state of any query by its key parts
  const getQueryState = (customQueryKey) => {
    const key = Array.isArray(customQueryKey)
      ? ["queryGet", ...customQueryKey, url]
      : finalQueryKey;
    return queryClient.getQueryState(key);
  };
  const getCachedData = (customQueryKey) => {
    const key = Array.isArray(customQueryKey)
      ? ["queryGet", ...customQueryKey, url]
      : finalQueryKey;
    return queryClient.getQueryData(key);
  };

  const updateCache = (updaterFn) => {
    queryClient.setQueryData(finalQueryKey, updaterFn);
  };

  return {
    ...query,
    data: query.data,
    invalidate,
    resetQuery,
    getQueryState,
    getCachedData,
    updateCache,
  };
};

export default useQueryGet;
