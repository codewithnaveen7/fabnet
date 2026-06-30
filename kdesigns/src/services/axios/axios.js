// TODO: refactoring required
import axios from "axios";
import { axiosConfig } from "./axiosConfig";
import { onRequest } from "./interceptors";

export const axiosInstance = axios.create(axiosConfig);



axiosInstance.interceptors.request.use(
  onRequest.FullFilled,
  onRequest.Rejected
);
//* ************************************************************************** */
const Axios = () => ({
  post: ({ eventMessage, eventType, config,url='' }) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    axiosInstance.post(
      url,
      { eventMessage, eventType, eventTime: Date.now() },
      config
    ),


});
export default Axios();
