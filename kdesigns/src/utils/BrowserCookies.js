class BrowserCookies {
  static getCookie(cname) {
    const name = `${cname}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  static setCookie(cname, cvalue, exdays = 2) {
    const domain = window.location.hostname;
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cname}=${cvalue};${expires};domain=${domain};path=/; Secure`;
  }

  // static deleteCookie(name) {
  //   document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  // }

  static getMainDomain() {
    var parts = window.location.hostname.split(".");
    if (parts.length >= 2) {
      return parts.slice(parts.length - 2).join(".");
    } else {
      // Handle cases where the hostname is just one part (e.g., localhost)
      return window.location.hostname;
    }
  }

  static deleteCookie(name) {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie =
        name +
        "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" +
        window.location.hostname;
    }
    let mainDmain = this.getMainDomain();
    document.cookie =
      name +
      "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" +
      mainDmain;
  }
}

export default BrowserCookies;
