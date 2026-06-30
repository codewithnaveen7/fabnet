import { useState, useRef, useEffect, useCallback } from "react";
import Axios from "../services/axios/axios";
import { useToast } from "./useToast";

const useAxios = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const abortRequest = useCallback(() => {
    if (abortControllerRef?.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const makeRequest = async (eventMessage, eventType, allowCancellation, config,url='') => {
    const timeout= config?.timeout || 15000;
   abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      );

      const response = await Promise.race([
        Axios.post({
          eventMessage,
          eventType,
          config: allowCancellation
          ? { signal: abortControllerRef.current.signal, ...config }
          : { ...config },
          url
        }),
        timeoutPromise,
      ]);

      return { data: response?.data.eventMessage || response?.data };
    } catch (err) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") {
        setError(null);
        return null;
      }

      if (!err?.response) {
        // Handle timeout or network error
        if(err.message =='Request timed out'){
          toast.error(err.message);
        }
      } 

      setError(err);

      // To prevent breaking code when no `catch` is present, return a rejected promise
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = (eventMessage, eventType,url,config) =>
    makeRequest(eventMessage, eventType, true,config ,url);

  const postData = (eventMessage, eventType,url,config) =>
    makeRequest(eventMessage, eventType, false,config,url);

  useEffect(() => abortRequest, [abortRequest]);

  return {
    loading,
    error,
    fetchData,
    postData,
    abortRequest
  };
};

export default useAxios;
