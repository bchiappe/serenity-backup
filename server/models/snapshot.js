const Database = require("../services/database");
const { Schema } = require("mongoose");

const db = new Database();
// Define schema
const schema = new db.db.Schema({
  identifier: { type: String, required: true },
  host: { type: Schema.Types.ObjectId, ref: "Host", required: false },
  repository: {
    type: Schema.Types.ObjectId,
    ref: "Repository",
    required: false,
  },
  backup: { type: Schema.Types.ObjectId, ref: "Backup" },
  filesNew: { type: Number, required: false, default: 0 },
  filesChanged: { type: Number, required: false, default: 0 },
  filesUnmodified: { type: Number, required: false, default: 0 },
  dirNew: { type: Number, required: false, default: 0 },
  dirChanged: { type: Number, required: false, default: 0 },
  dirUnmodified: { type: Number, required: false, default: 0 },
  dataAdded: { type: Number, required: false, default: 0 },
  totalFilesProcessed: { type: Number, required: false, default: 0 },
  totalBytesProcessed: { type: Number, required: false, default: 0 },
  totalDuration: { type: Schema.Types.Decimal, required: false, default: 0 },
  created: { type: Date, default: Date.now() },
  modified: { type: Date, default: Date.now() },
});

const Snapshot = db.db.model("Snapshot", schema);

module.exports = Snapshot;
