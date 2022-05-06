const Activity = require("../models/activity");
const mongoose = require("mongoose");
const paginate = require("express-paginate");
const { encrypt } = require("../services/encryption");

// Get all activity
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
  if (req.query.scheduleId) {
    filter.schedule = req.query.scheduleId;
  }
  try {
    const [results, itemCount] = await Promise.all([
      Activity.find(filter)
        .populate("backup", "_id name")
        .populate("host", "_id name")
        .populate("repository", "_id name")
        .populate("schedule", "_id name")
        .limit(req.query.limit)
        .skip(req.skip)
        .lean()
        .exec(),
      Activity.find(filter).count(),
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

// Get activity
exports.get = async (req, res) => {
  try {
    const user = await Activity.findById(req.params.id).lean().exec();
    return res.status(200).json(user);
  } catch (err) {
    console.log("Failed to get activity", err.message);
    return res
      .status(500)
      .send("An error occurred getting the activity. Please try again later.");
  }
};

// Delete activity
exports.delete = async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    // Return no content
    return res.status(204).send();
  } catch (err) {
    console.log("Failed to delete activity", err.message);
    return res
      .status(500)
      .send("An error occurred deleting the activity. Please try again later.");
  }
};
