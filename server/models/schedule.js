const Database = require("../services/database");
const { Schema } = require("mongoose");

const db = new Database();
// Define schema
const schema = new db.db.Schema({
  name: { type: String, required: true },
  tasks: [{ backup: { type: Schema.Types.ObjectId, ref: "Backup" } }],
  cron: { type: String, required: true },
  active: { type: Boolean, required: false, default: false },
  notifications: {
    success: {
      send: { type: Boolean, required: false, default: false },
      to: { type: String, required: false },
      cc: { type: String, required: false },
      bcc: { type: String, required: false },
      subject: { type: String, required: false },
      message: { type: String, required: false },
    },
    error: {
      send: { type: Boolean, required: false, default: false },
      to: { type: String, required: false },
      cc: { type: String, required: false },
      bcc: { type: String, required: false },
      subject: { type: String, required: false },
      message: { type: String, required: false },
    },
  },
  lastRun: {
    result: { type: String, required: false },
    date: { type: Date, required: false },
  },
  nextRun: { type: Date, required: false },
  created: { type: Date, default: Date.now() },
  modified: { type: Date, default: Date.now() },
});

const Schedule = db.db.model("Schedule", schema);

module.exports = Schedule;
