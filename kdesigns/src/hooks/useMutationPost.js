import { useMutation, useMutationState } from "@tanstack/react-query";
import Axios from "../services/axios/axios";
import { useToast } from "./useToast";

const useMutationPost = ({ retry = 0, retryDelay, mutationKey } = {}) => {
  const toast = useToast();

  const mutation = useMutation({
    ...(mutationKey && { mutationKey }),
    mutationFn: async ({ eventMessage, eventType, url = "", config = {} }) => {
      try {
        const response = await Axios.post({
          eventMessage,
          eventType,
          url,
          config,
        });

        return { data: response?.data?.eventMessage || response?.data };
      } catch (err) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") {
          throw err;
        }

        if (!err?.response && err.message === "Request timed out") {
          toast.error(err.message);
        } else {
          toast.error(err?.response?.data?.message || "Something went wrong");
        }
        throw err;
      }
    },
    retry,
    ...(retryDelay !== undefined && { retryDelay }),
  });

  // When a mutationKey is provided, read the latest result from the global
  // mutation cache so all instances sharing the same key see the same data.
  const cachedStates = useMutationState({
    filters: { mutationKey: mutationKey ?? [] },
    select: (m) => m.state,
  });
  const cached = mutationKey ? cachedStates[cachedStates.length - 1] : null;

  const data = cached?.data ?? mutation.data;
  const isSuccess = cached ? cached.status === "success" : mutation.isSuccess;
  const isError = cached ? cached.status === "error" : mutation.isError;
  const error = cached?.error ?? mutation.error;

  const postData = (eventMessage, eventType, url, config) => {
    return mutation
      .mutateAsync({ eventMessage, eventType, url, config })
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.name === "AbortError") {
          return null;
        }
        throw err;
      });
  };

  return {
    postData,
    loading: mutation.isPending,
    error,
    data,
    isError,
    isSuccess,
    reset: mutation.reset,
  };
};

export default useMutationPost;

 