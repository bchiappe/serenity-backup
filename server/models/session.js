const Database = require("../services/database");

const db = new Database();
// Define schema
const schema = new db.db.Schema({
  uid: String,
  token: String,
  active: { type: Boolean, default: true },
  created: { type: Date, default: Date.now() },
  modified: { type: Date, default: Date.now() },
});

const Session = db.db.model("Session", schema);

module.exports = Session;
