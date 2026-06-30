import { axiosInstance } from "kdesigns/KDesign";
import { API_BASE_URL } from "../config/env";
import { getToken } from "../utils/storage";

const NO_AUTH_EVENTS = ["FABNET_LOGIN"];

axiosInstance.defaults.baseURL = API_BASE_URL;

axiosInstance.interceptors.request.use((config) => {
  let eventType;
  if (typeof config.data === "string") {
    try {
      eventType = JSON.parse(config.data)?.eventType;
    } catch {
      eventType = undefined;
    }
  } else if (config.data && typeof config.data === "object") {
    eventType = config.data.eventType;
  }

  const token = getToken();
  if (token && !NO_AUTH_EVENTS.includes(eventType)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
