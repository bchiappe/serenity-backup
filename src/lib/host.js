import Server from "./server";

export default class Host extends Server {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if ("page" in filters && filters.page !== null) {
      params.append("page", filters.page);
    }
    if ("limit" in filters && filters.limit !== null) {
      params.append("limit", filters.limit);
    }
    if ("filter" in filters && filters.filter !== null) {
      params.append("filter", filters.filter);
    }
    const resp = await this.get(`hosts?${params.toString()}`);
    return resp.data;
  }

  async getItem(id) {
    const resp = await this.get(`hosts/${id}`);
    return resp.data;
  }

  async create(host) {
    const resp = await this.post("hosts", host);
    if (resp.status !== 200) {
      throw Error("Failed to create host");
    }
    return resp.data;
  }

  async update(id, host) {
    const resp = await this.patch(`hosts/${id}`, host);
    if (resp.status !== 200) {
      throw Error("Failed to update host");
    }
    return resp.data;
  }

  async deleteItem(id) {
    const resp = await this.delete(`hosts/${id}`);
    if (resp.status !== 204) {
      throw Error("Failed to delete host");
    }
    return;
  }

  async connect(id) {
    const resp = await this.get(`hosts/${id}/connect`);
    if (resp.status !== 204) {
      throw Error("Failed to connect to host");
    }
    return;
  }

  async checkVersion(id) {
    const resp = await this.get(`hosts/${id}/version`);
    if (resp.status !== 200) {
      throw Error("Failed to get software version");
    }
    return resp.data;
  }
}
