const Backup = require("../models/backup");
const Snapshot = require("../models/snapshot");
const Activity = require("../models/activity");
const mongoose = require("mongoose");
const paginate = require("express-paginate");
const { encrypt } = require("../services/encryption");
const BackupService = require("../services/backup");

// Get backups
exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.hostId) {
    filter.host = req.query.hostId;
  }
  if (req.query.repositoryId) {
    filter.repository = req.query.repositoryId;
  }
  if (req.query.filter) {
    filter.$or = [
      { name: { $regex: req.query.filter, $options: "i" } },
      { path: { $regex: req.query.filter, $options: "i" } },
    ];
  }
  try {
    const [results, itemCount] = await Promise.all([
      Backup.find(filter)
        .populate("host", "_id name")
        .populate("repository", "_id name")
        .limit(req.query.limit)
        .skip(req.skip)
        .lean()
        .exec(),
      Backup.find(filter).count(),
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    return res.status(200).json({
      count: itemCount,
      pages: pageCount,
      hasMore: paginate.hasNextPages(req)(pageCount),
      items: results,
    });
  } catch (err) {
    console.log("Failed to get backups", err.message);
    return res
      .status(500)
      .send("An error occurred getting the backups. Please try again later.");
  }
};

// Get backup
exports.get = async (req, res) => {
  try {
    const user = await Backup.findById(req.params.id).lean().exec();
    return res.status(200).json(user);
  } catch (err) {
    console.log("Failed to get backup", err.message);
    return res
      .status(500)
      .send("An error occurred getting the backup. Please try again later.");
  }
};

// Add backup
exports.create = async (req, res) => {
  try {
    // Attempt to insert backup into database
    const backup = await Backup.create({
      ...req.body,
    });
    // Check for validation error
    if (backup instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(backup);
    } else {
      // Return new backup
      return res.status(200).json(backup);
    }
  } catch (err) {
    console.log("Failed to create backup", err.message);
    return res
      .status(500)
      .send("An error occurred creating the backup. Please try again later.");
  }
};

// Update backup
exports.update = async (req, res) => {
  try {
    const data = { ...req.body };
    const backup = await Backup.findByIdAndUpdate(req.params.id, data);
    // Check for validation error
    if (backup instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(backup);
    } else {
      // Return new backup
      return res.status(200).json(backup);
    }
  } catch (err) {
    console.log("Failed to update backup", err.message);
    return res
      .status(500)
      .send("An error occurred updating the backup. Please try again later.");
  }
};

// Delete backup
exports.delete = async (req, res) => {
  try {
    await Backup.findByIdAndDelete(req.params.id);
    // Return no content
    return res.status(204).send();
  } catch (err) {
    console.log("Failed to delete backup", err.message);
    return res
      .status(500)
      .send("An error occurred deleting the backup. Please try again later.");
  }
};

// Run backup
exports.run = async (req, res) => {
  try {
    const b = new BackupService();
    await b.backup(req.params.id);
    // Return no content
    return res.status(204).send();
  } catch (err) {
    console.log("Failed to run backup", err.message);
    return res
      .status(500)
      .send("An error occurred running the backup. Please try again later.");
  }
};

// Get snapshots
exports.getSnapshots = async (req, res) => {
  const filter = {};
  if (req.query.backupId) {
    filter.backup = backupId;
  }
  if (req.query.hostId) {
    filter.host = hostId;
  }
  if (req.query.repositoryId) {
    filter.repository = repositoryId;
  }
  try {
    const [results, itemCount] = await Promise.all([
      Snapshot.find(filter)
        .populate("backup", "_id name")
        .populate("host", "_id name")
        .populate("repository", "_id name")
        .limit(req.query.limit)
        .skip(req.skip)
        .lean()
        .exec(),
      Snapshot.count(),
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    return res.status(200).json({
      count: itemCount,
      pages: pageCount,
      hasMore: paginate.hasNextPages(req)(pageCount),
      items: results,
    });
  } catch (err) {
    console.log("Failed to get snapshots", err.message);
    return res
      .status(500)
      .send("An error occurred getting the snapshots. Please try again later.");
  }
};

// Get activity
exports.getActivity = async (req, res) => {
  const filter = {};
  if (req.query.backupId) {
    filter.backup = backupId;
  }
  if (req.query.hostId) {
    filter.host = hostId;
  }
  if (req.query.repositoryId) {
    filter.repository = repositoryId;
  }
  try {
    const [results, itemCount] = await Promise.all([
      Activity.find(filter)
        .populate("backup", "_id name")
        .populate("host", "_id name")
        .populate("repository", "_id name")
        .limit(req.query.limit)
        .skip(req.skip)
        .lean()
        .exec(),
      Activity.count(),
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    return res.status(200).json({
      count: itemCount,
      pages: pageCount,
      hasMore: paginate.hasNextPages(req)(pageCount),
      items: results,
    });
  } catch (err) {
    console.log("Failed to get activity", err.message);
    return res
      .status(500)
      .send("An error occurred getting the activity. Please try again later.");
  }
};
