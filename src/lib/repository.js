import Server from "./server";

export default class Repository extends Server {
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
    const resp = await this.get(`repositories?${params.toString()}`);
    return resp.data;
  }

  async getItem(id) {
    const resp = await this.get(`repositories/${id}`);
    return resp.data;
  }

  async create(repository) {
    const resp = await this.post("repositories", repository);
    if (resp.status !== 200) {
      throw Error("Failed to create repository");
    }
    return resp.data;
  }

  async update(id, repository) {
    const resp = await this.patch(`repositories/${id}`, repository);
    if (resp.status !== 200) {
      throw Error("Failed to update repository");
    }
    return resp.data;
  }

  async deleteItem(id) {
    const resp = await this.delete(`repositories/${id}`);
    if (resp.status !== 204) {
      throw Error("Failed to delete repository");
    }
    return;
  }
}
