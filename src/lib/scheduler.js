import Server from "./server";

export default class Scheduler extends Server {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if ("backupId" in filters && filters.backupId !== null) {
      params.append("backupId", filters.backupId);
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
    const resp = await this.get(`scheduler?${params.toString()}`);
    return resp.data;
  }

  async getItem(id) {
    const resp = await this.get(`scheduler/${id}`);
    return resp.data;
  }

  async create(schedule) {
    const resp = await this.post("scheduler", schedule);
    if (resp.status !== 200) {
      throw Error("Failed to create schedule");
    }
    return resp.data;
  }

  async update(id, schedule) {
    const resp = await this.patch(`scheduler/${id}`, schedule);
    if (resp.status !== 200) {
      throw Error("Failed to update schedule");
    }
    return resp.data;
  }

  async deleteItem(id) {
    const resp = await this.delete(`scheduler/${id}`);
    if (resp.status !== 204) {
      throw Error("Failed to delete schedule");
    }
    return;
  }

  async run(id) {
    const resp = await this.post(`scheduler/${id}/run`);
    if (resp.status !== 204) {
      throw Error("Failed to run schedule");
    }
    return;
  }
}
