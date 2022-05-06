const User = require("../models/user");
const Session = require("../models/session");
const config = require("config");
const jwt = require("jsonwebtoken");

async function checkAuthorization(req, res, next) {
  // Check for bearer token
  const header = req.header("Authorization");
  const sections = String(header).split(" ");
  if (sections[0].toLowerCase() !== "bearer") {
    return res.status(401).send("Unauthorized");
  }
  const token = sections[1];
  // Validate token
  const secret = config.get("authentication.secret");
  let decoded;
  try {
    decoded = await jwt.verify(token, secret);
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }
  // Check that session is active
  try {
    const result = await Session.exists({ uid: decoded.uid, active: true });
    if (result === null) {
      return res.status(401).send("Unauthorized");
    }
  } catch (err) {
    return res
      .status(500)
      .send("An error occurred creating the user. Please try again later.");
  }
  // Get authorized user
  res.locals.uid = decoded.uid;
  res.locals.user = User.findById(decoded.uid);
  // Proceed with running operation
  next();
}

module.exports = checkAuthorization;
