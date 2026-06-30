import React, { useRef, useEffect, useCallback } from "react";
import { axiosInstance } from "../services/axios/axios";
import { useToast } from './useToast'

const getDefaultUrlForDocumentUpload = ( bucketName = '' ) => (`${axiosInstance.defaults.baseURL.replace(
  /\/events$/,
  ""
)}/uploadTo/${bucketName}`
)

const useFileUpload = () => {
  const toast = useToast();
  const abortControllerRef = useRef(null);

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const uploadDocuments = async ({
    url = "",
    bucketName='',
    files=[],
    config = {},
  }) => {
    
    url = url || getDefaultUrlForDocumentUpload(bucketName);

    abortControllerRef.current = new AbortController();

    try {
      const response = await axiosInstance.post(url, files, {
        ...config,
        headers: {
          ...(config?.headers ?? {}),
          "Content-Type": "multipart/form-data",
        },
        transformRequest: null,
        transformResponse: null,
      });
      return response;
    } catch (error) {
      toast.error(<div>{error.message}</div>);
    }
  };

  useEffect(() => abortRequest, [abortRequest]);

  return {
    uploadDocuments,
    abortRequest,
  };
};

export default useFileUpload;
