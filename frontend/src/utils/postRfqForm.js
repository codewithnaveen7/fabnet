import { axiosInstance } from "kdesigns/KDesign";
import { getToken } from "./storage";

/**
 * Post RFQ create/update as multipart (JSON payload + optional drawing files).
 */
export async function postRfqForm(url, payload, files = {}, eventType) {
  const form = new FormData();
  form.append("payload", JSON.stringify(payload));
  form.append("eventType", eventType);

  if (Array.isArray(files.drawings)) {
    files.drawings.forEach((file) => {
      if (file) form.append("drawings", file);
    });
  }

  const token = getToken();
  const response = await axiosInstance.post(url, form, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": undefined,
    },
    transformRequest: [(data) => data],
  });

  return { data: response?.data?.eventMessage || response?.data };
}
