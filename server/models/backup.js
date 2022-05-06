const Database = require("../services/database");
const { Schema } = require("mongoose");

const db = new Database();
// Define schema
const schema = new db.db.Schema({
  name: { type: String, required: true },
  host: { type: Schema.Types.ObjectId, ref: "Host" },
  repository: { type: Schema.Types.ObjectId, ref: "Repository" },
  path: { type: String, required: false, default: 22 },
  lastRun: {
    result: { type: String, required: false },
    date: { type: Date, required: false },
  },
  created: { type: Date, default: Date.now() },
  modified: { type: Date, default: Date.now() },
});

const Backup = db.db.model("Backup", schema);

module.exports = Backup;
