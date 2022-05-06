import { api } from "boot/axios";
import { SessionStorage } from "quasar";

export default class Server {
  // token;

  getToken() {
    return SessionStorage.getItem("token");
  }

  callAPI(method, url, body, query = {}) {
    if (Object.keys(query) > 0) {
      const params = new URLSearchParams();
      for (const [key, val] of Object.entries(query)) {
        params.append(key, val);
      }
      url += `?${params.toString()}`;
    }
    return api({
      method: method,
      url: url,
      data: body,
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    });
  }

  get(url, query) {
    return this.callAPI("GET", url, null, query);
  }

  post(url, body, query) {
    return this.callAPI("POST", url, body, query);
  }

  put(url, body, query) {
    return this.callAPI("PUT", url, body, query);
  }

  patch(url, body, query) {
    return this.callAPI("PATCH", url, body, query);
  }

  delete(url, query) {
    return this.callAPI("DELETE", url, null, query);
  }
}
