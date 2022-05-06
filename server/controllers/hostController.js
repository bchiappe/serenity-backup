const Host = require("../models/host");
const mongoose = require("mongoose");
const paginate = require("express-paginate");
const { encrypt } = require("../services/encryption");
const BackupService = require("../services/backup");

// Get hosts
exports.getAll = async (req, res) => {
  try {
    const [results, itemCount] = await Promise.all([
      Host.find().limit(req.query.limit).skip(req.skip).lean().exec(),
      Host.count(),
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    return res.status(200).json({
      count: itemCount,
      pages: pageCount,
      hasMore: paginate.hasNextPages(req)(pageCount),
      items: results,
    });
  } catch (err) {
    console.log("Failed to get hosts", err.message);
    return res
      .status(500)
      .send("An error occurred getting the hosts. Please try again later.");
  }
};

// Get host
exports.get = async (req, res) => {
  try {
    const user = await Host.findById(req.params.id).lean().exec();
    return res.status(200).json(user);
  } catch (err) {
    console.log("Failed to get host", err.message);
    return res
      .status(500)
      .send("An error occurred getting the host. Please try again later.");
  }
};

// Add host
exports.create = async (req, res) => {
  try {
    // Encrypt password
    const password = await encrypt(req.body.password);
    // Attempt to insert host into database
    const host = await Host.create({
      ...req.body,
      password: password,
    });
    // Check for validation error
    if (host instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(host);
    } else {
      // Return new host
      return res.status(200).json(host);
    }
  } catch (err) {
    console.log("Failed to create host", err.message);
    return res
      .status(500)
      .send("An error occurred creating the host. Please try again later.");
  }
};

// Update host
exports.update = async (req, res) => {
  try {
    const data = { ...req.body };
    // Encrypt password (if needed)
    if ("password" in data) {
      data.password = await encrypt(data.password);
    }
    const host = await Host.findByIdAndUpdate(req.params.id, data);
    // Check for validation error
    if (host instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(host);
    } else {
      // Return new host
      return res.status(200).json(host);
    }
  } catch (err) {
    console.log("Failed to update host", err.message);
    return res
      .status(500)
      .send("An error occurred updating the host. Please try again later.");
  }
};

// Delete host
exports.delete = async (req, res) => {
  try {
    await Host.findByIdAndDelete(req.params.id);
    // Return no content
    return res.status(204).send();
  } catch (err) {
    console.log("Failed to delete host", err.message);
    return res
      .status(500)
      .send("An error occurred deleting the host. Please try again later.");
  }
};

// Attempt connection to host
exports.connect = async (req, res) => {
  try {
    const b = new BackupService();
    await b.connect(req.params.id);
    // Return no content
    return res.status(204).send();
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
};

// Check backup software version
exports.checkVersion = async (req, res) => {
  try {
    const b = new BackupService();
    await b.connect(req.params.id);
    const version = await b.checkVersion();
    // Return version
    return res.status(200).json({ version: version });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
};
