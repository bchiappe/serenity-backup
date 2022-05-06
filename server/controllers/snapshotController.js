const Snapshot = require("../models/snapshot");
const mongoose = require("mongoose");
const paginate = require("express-paginate");
const { encrypt } = require("../services/encryption");
const BackupService = require("../services/backup");

// Get snapshots
exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.backupId) {
    filter.backup = req.query.backupId;
  }
  if (req.query.hostId) {
    filter.host = req.query.hostId;
  }
  if (req.query.repositoryId) {
    filter.repository = req.query.repositoryId;
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
      Snapshot.find(filter).count(),
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

// Get snapshot
exports.get = async (req, res) => {
  try {
    const user = await Snapshot.findById(req.params.id).lean().exec();
    return res.status(200).json(user);
  } catch (err) {
    console.log("Failed to get snapshot", err.message);
    return res
      .status(500)
      .send("An error occurred getting the snapshot. Please try again later.");
  }
};

// Delete snapshot
exports.delete = async (req, res) => {
  try {
    const b = new BackupService();
    await b.purge(req.params.id);
    // Return no content
    return res.status(204).send();
  } catch (err) {
    console.log("Failed to delete snapshot", err.message);
    return res
      .status(500)
      .send("An error occurred deleting the snapshot. Please try again later.");
  }
};

// List snapshot files
exports.listFiles = async (req, res) => {
  try {
    const b = new BackupService();
    const files = await b.listSnapshotFiles(req.params.id, req.query.path);
    // Return no content
    return res.status(200).json({
      count: files.length,
      pages: 1,
      hasMore: false,
      items: files,
    });
  } catch (err) {
    console.log("Failed to list snapshot files", err.message);
    return res
      .status(500)
      .send(
        "An error occurred listing the snapshot files. Please try again later."
      );
  }
};

// Restore snapshot file
exports.restoreFile = async (req, res) => {
  try {
    const b = new BackupService();
    await b.restoreSnapshotFile(req.params.id, req.body.file);
    // Return no content
    return res.status(204).send();
  } catch (err) {
    console.log("Failed to restore snapshot file", err.message);
    return res
      .status(500)
      .send(
        "An error occurred restoring the snapshot file. Please try again later."
      );
  }
};
