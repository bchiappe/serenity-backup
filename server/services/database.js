const config = require("config");
const mongoose = require("mongoose");

class Database {
  constructor() {
    this.db = mongoose;
  }

  // Connect to MongoDB using Mongoose
  connect() {
    // Get connection settings from config
    const host = config.get("database.host");
    const port = config.get("database.port");
    const database = config.get("database.database");
    const username = config.get("database.username");
    const password = encodeURIComponent(config.get("database.password"));
    // Connect to MongoDB
    return this.db.connect(
      `mongodb://${username}:${password}@${host}:${port}/${database}`
    );
  }
}

module.exports = Database;
