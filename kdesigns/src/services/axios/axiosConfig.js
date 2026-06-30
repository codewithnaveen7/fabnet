export const axiosConfig = {
  baseURL:
    localStorage.getItem("baseUrl") || process.env.REACT_APP_BASE_API_URL,
  method: "post",
  transformRequest: [
    (data) => {
      data.eventTime = Date.now();
      return JSON.stringify(data);
    },
  ],
  timeout: 30000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};
export default axiosConfig;
