import Server from "./server";

export default class Settings extends Server {
  async getAll() {
    const resp = await this.get("settings");
    return resp.data;
  }

  async getItem(name) {
    const resp = await this.get(`settings/${name}`);
    return resp.data;
  }

  async update(name, value) {
    const resp = await this.post("settings", { name: name, value: value });
    if (resp.status !== 200) {
      throw Error("Failed to update settings");
    }
    return resp.data;
  }
}
