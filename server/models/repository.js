const Database = require("../services/database");

const db = new Database();
// Define schema
const schema = new db.db.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  host: { type: String, required: false },
  port: { type: Number, required: false },
  accessKeyId: { type: String, required: false },
  secretAccessKey: { type: String, required: false },
  accountId: { type: String, required: false },
  accountKey: { type: String, required: false },
  password: { type: String, required: false },
  bucketName: { type: String, required: false },
  path: { type: String, required: false },
  lastConnection: {
    result: { type: String, required: false },
    date: { type: Date, required: false },
  },
  lastBackup: {
    result: { type: String, required: false },
    date: { type: Date, required: false },
  },
  created: { type: Date, default: Date.now() },
  modified: { type: Date, default: Date.now() },
});

const Repository = db.db.model("Repository", schema);

module.exports = Repository;
