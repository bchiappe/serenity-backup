import Server from "./server";

export default class Backup extends Server {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if ("hostId" in filters && filters.hostId !== null) {
      params.append("hostId", filters.hostId);
    }
    if ("repositoryId" in filters && filters.repositoryId !== null) {
      params.append("repositoryId", filters.repositoryId);
    }
    if ("page" in filters && filters.page !== null) {
      params.append("page", filters.page);
    }
    if ("limit" in filters && filters.limit !== null) {
      params.append("limit", filters.limit);
    }
    if ("filter" in filters && filters.filter !== null) {
      params.append("filter", filters.filter);
    }
    const resp = await this.get(`backups?${params.toString()}`);
    return resp.data;
  }

  async getItem(id) {
    const resp = await this.get(`backups/${id}`);
    return resp.data;
  }

  async create(backup) {
    const resp = await this.post("backups", backup);
    if (resp.status !== 200) {
      throw Error("Failed to create backup");
    }
    return resp.data;
  }

  async update(id, backup) {
    const resp = await this.patch(`backups/${id}`, backup);
    if (resp.status !== 200) {
      throw Error("Failed to update backup");
    }
    return resp.data;
  }

  async deleteItem(id) {
    const resp = await this.delete(`backups/${id}`);
    if (resp.status !== 204) {
      throw Error("Failed to delete backup");
    }
    return;
  }

  async run(id) {
    const resp = await this.post(`backups/${id}/run`);
    if (resp.status !== 204) {
      throw Error("Failed to run backup");
    }
    return;
  }

  async getSnapshots() {
    const resp = await this.get("backups/snapshots");
    return resp.data;
  }

  async getActivity() {
    const resp = await this.get("backups/activity");
    return resp.data;
  }
}
