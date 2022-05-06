const User = require("../models/user");
const Session = require("../models/session");
const mongoose = require("mongoose");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

function generateAccessToken(payload = {}) {
  const secret = config.get("authentication.secret");
  return jwt.sign(payload, secret);
}

function generateGravatar(email) {
  const hash = crypto
    .createHash("md5")
    .update(String(email).toLowerCase())
    .digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=26&d=retro`;
}

// Get users
exports.getAll = async (req, res) => {
  try {
    const [results, itemCount] = await Promise.all([
      User.find({}, "-profile.password")
        .limit(req.query.limit)
        .skip(req.skip)
        .lean()
        .exec(),
      User.count(),
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    return res.status(200).json({
      count: itemCount,
      hasMore: paginate.hasNextPages(req)(pageCount),
      items: results,
    });
  } catch (err) {
    console.log("Failed to get users", err.message);
    return res
      .status(500)
      .send("An error occurred getting the users. Please try again later.");
  }
};

// Get user
exports.get = async (req, res) => {
  const user = await User.findById(req.params.id, "-profile.password")
    .lean()
    .exec();
  return res.status(200).json(user);
};

// Get current user
exports.getMe = async (req, res) => {
  const user = await User.findById(res.locals.uid, "-profile.password")
    .lean()
    .exec();
  const profile = { ...user.profile };
  return res.status(200).json({
    uid: res.locals.uid,
    profile: profile,
  });
};

// Add user
exports.create = async (req, res) => {
  try {
    // Salt and hash password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    // Create user profile
    const profile = {
      ...req.body,
      password: password,
      avatar: generateGravatar(req.body.email),
    };
    console.log("Profile", profile);
    // Attempt to insert user into database
    const user = await User.create({
      profile: profile,
    });
    // Check for validation error
    if (user instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(user);
    } else {
      // Return new user
      return res.status(200).json(user);
    }
  } catch (err) {
    console.log("Failed to create user", err.message);
    return res
      .status(500)
      .send("An error occurred creating the user. Please try again later.");
  }
};

// Replace user
exports.replace = async (req, res) => {
  const user = await User.findOneAndReplace({ _id: req.params.id }, req.body);
  return res.status(200).json(user);
};

// Update user
exports.update = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);
  return res.status(200).json(user);
};

// Update current user
exports.updateMe = async (req, res) => {
  const existing = await User.findById(res.locals.uid).lean().exec();
  // Create user profile
  const profile = {
    ...existing.profile,
    ...req.body,
    avatar: generateGravatar(req.body.email),
  };
  if ("password" in req.body) {
    // Salt and hash password
    const salt = await bcrypt.genSalt(10);
    profile.password = await bcrypt.hash(req.body.password, salt);
  }
  const user = await User.findByIdAndUpdate(res.locals.uid, {
    profile: profile,
    modified: Date.now(),
  });
  return res.status(200).json({
    uid: res.locals.uid,
    profile: { ...user.profile },
  });
};

// Delete user
exports.delete = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  return res.status(204).send();
};

// Login user
exports.login = async (req, res) => {
  try {
    // Get username and password
    const username = req.body.username;
    const password = req.body.password;
    // Find user by username
    const user = await User.findOne({ "profile.username": username });
    console.log("User", user);
    // Check if user was found
    if (user) {
      // Check user password with hashed password stored in the database
      const validPassword = await bcrypt.compare(
        password,
        user.profile.password
      );
      if (validPassword) {
        // Create new JWT
        const token = generateAccessToken({ uid: user._id });
        // Create session
        await Session.create({ uid: user._id, token: token });
        return res.status(200).json({ token: token });
      } else {
        return res.status(401).json({ error: "Authentication failed" });
      }
    } else {
      return res.status(401).json({ error: "Authentication failed" });
    }
  } catch (err) {
    console.log("Failed to authenticate user", err.message);
    return res
      .status(500)
      .send("An error occurred logging in. Please try again later.");
  }
};

// Logout user
exports.logout = async (req, res) => {
  // Get logged in user
  const uid = res.locals.uid;
  // Update all sessions for user
  await Session.find({ uid: uid, active: true }).updateMany({
    active: false,
    modified: Date.now(),
  });
  return res.status(204).send();
};

// Check if user has an active session
exports.authorized = (req, res) => {
  return res.status(204).send();
};
