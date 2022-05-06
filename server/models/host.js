const Database = require("../services/database");

const db = new Database();
// Define schema
const schema = new db.db.Schema({
  name: { type: String, required: true },
  os: { type: String, required: true },
  host: { type: String, required: true },
  port: { type: String, required: false, default: 22 },
  username: { type: String, required: true },
  password: { type: String, required: true },
  lastConnection: {
    result: { type: String, required: false },
    date: { type: Date, required: false },
  },
  lastBackup: {
    result: { type: String, required: false },
    date: { type: Date, required: false },
  },
  resticVersion: { type: String, required: false },
  created: { type: Date, default: Date.now() },
  modified: { type: Date, default: Date.now() },
});

const Host = db.db.model("Host", schema);

module.exports = Host;
