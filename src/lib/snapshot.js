import Server from "./server";

export default class Snapshot extends Server {
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
    if ("page" in filters && filters.page !== null) {
      params.append("page", filters.page);
    }
    if ("limit" in filters && filters.limit !== null) {
      params.append("limit", filters.limit);
    }
    if ("filter" in filters && filters.filter !== null) {
      params.append("filter", filters.filter);
    }
    const resp = await this.get(`snapshots?${params.toString()}`);
    return resp.data;
  }

  async getItem(id) {
    const resp = await this.get(`snapshots/${id}`);
    return resp.data;
  }

  async deleteItem(id) {
    const resp = await this.delete(`snapshots/${id}`);
    if (resp.status !== 204) {
      throw Error("Failed to delete snapshot");
    }
    return;
  }

  async listFiles(id, path) {
    const resp = await this.get(`snapshots/${id}/files?path=${path}`);
    return resp.data;
  }

  async restoreFile(id, file) {
    const resp = await this.post(`snapshots/${id}/restore`, { file: file });
    return resp.data;
  }
}
