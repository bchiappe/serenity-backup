const Database = require("../services/database");
const { Schema } = require("mongoose");

const db = new Database();
// Define schema
const schema = new db.db.Schema({
  host: { type: Schema.Types.ObjectId, ref: "Host", required: false },
  repository: {
    type: Schema.Types.ObjectId,
    ref: "Repository",
    required: false,
  },
  backup: { type: Schema.Types.ObjectId, ref: "Backup", required: false },
  schedule: { type: Schema.Types.ObjectId, ref: "Schedule", required: false },
  type: { type: String, required: false, default: "Backup" },
  status: { type: String, required: false, default: "Queued" },
  progress: { type: Number, required: false, default: 0 },
  messages: [
    {
      message: { type: String, required: true },
      level: { type: String, required: true, default: "info" },
      date: { type: Date, default: Date.now() },
    },
  ],
  created: { type: Date, default: Date.now() },
  modified: { type: Date, default: Date.now() },
});

const Activity = db.db.model("Activity", schema);

module.exports = Activity;
