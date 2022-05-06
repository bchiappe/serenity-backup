const Database = require("../services/database");
const { Schema } = require("mongoose");

const db = new Database();
// Define schema
const schema = new db.db.Schema({
  name: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  created: { type: Date, default: Date.now() },
  modified: { type: Date, default: Date.now() },
});

const Setting = db.db.model("Setting", schema);

module.exports = Setting;
