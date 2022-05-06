import Server from "./server";
import { SessionStorage } from "quasar";

export default class User extends Server {
  async login(username, password) {
    try {
      // Call server to verify credentials and get JWT
      const response = await this.post("users/login", {
        username: username,
        password: password,
      });
      if (response.status !== 200) {
        throw Error("Login failed");
      }
      this.token = response.data.token;
      // Store JWT
      SessionStorage.set("token", this.token);
      return true;
    } catch (err) {
      console.error("Login failed", err.message);
      throw Error("Login failed");
    }
  }

  async logout() {
    return this.post("users/logout").then(() => {
      SessionStorage.clear();
    });
  }

  async isAuthenticated() {
    try {
      if (this.getToken() === null) {
        return false;
      }
      const resp = await this.get("users/authorized");
      return resp.status === 204;
    } catch (err) {
      return false;
    }
  }

  async getMe() {
    const resp = await this.get("users/me");
    return resp.data;
  }

  async updateMe(profile) {
    const resp = await this.patch("users/me", profile);
    return resp.data;
  }
}
