const Database = require("../services/database");

const db = new Database();
// Define schema
const schema = new db.db.Schema({
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      required: true,
    },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, required: true },
  },
  locked: { type: Boolean, default: false },
  failedAttempts: { type: Number, default: 0 },
  created: { type: Date, default: Date.now() },
  modified: { type: Date, default: Date.now() },
});

const User = db.db.model("User", schema);

module.exports = User;
