import Server from "./server";

export default class Activity extends Server {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if ("backupId" in filters && filters.backupId !== null) {
      params.append("backupId", filters.backupId);
    }
    if ("hostId" in filters && filters.hostId !== null) {
      params.append("hostId", filters.hostId);
    }
    if ("repositoryId" in filters && filters.repositoryId !== null) {
      params.append("repositoryId", filters.repositoryId);
    }
    if ("scheduleId" in filters && filters.scheduleId !== null) {
      params.append("scheduleId", filters.scheduleId);
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
    const resp = await this.get(`activity?${params.toString()}`);
    return resp.data;
  }

  async getItem(id) {
    const resp = await this.get(`activity/${id}`);
    return resp.data;
  }

  async deleteItem(id) {
    const resp = await this.delete(`activity/${id}`);
    if (resp.status !== 204) {
      throw Error("Failed to delete activity");
    }
    return;
  }
}
