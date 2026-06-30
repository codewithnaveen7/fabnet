import BrowserCookies from "../../utils/BrowserCookies";


export const onRequest = {
  FullFilled: (request) => {
    const token = BrowserCookies.getCookie("kxToken");
    let noTokenEvents = ['ENGINE_USER_LOGIN', 'KXUSER_LOGIN'];
    if (token && !noTokenEvents.includes(request.data.eventType)) {
      request.headers.kxtoken = token;
    }
    return request;
  },
  Rejected: () => null,
};
