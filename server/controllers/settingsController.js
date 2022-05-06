const Setting = require("../models/setting");
const mongoose = require("mongoose");
const paginate = require("express-paginate");
const { encrypt } = require("../services/encryption");

// Get all settings
exports.getAll = async (req, res) => {
  try {
    const [results, itemCount] = await Promise.all([
      Setting.find().limit(req.query.limit).skip(req.skip).lean().exec(),
      Setting.count(),
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    return res.status(200).json({
      count: itemCount,
      pages: pageCount,
      hasMore: paginate.hasNextPages(req)(pageCount),
      items: results,
    });
  } catch (err) {
    console.log("Failed to get settings", err.message);
    return res
      .status(500)
      .send("An error occurred getting settings. Please try again later.");
  }
};

// Get setting
exports.get = async (req, res) => {
  try {
    const user = await Setting.findOne({ name: req.params.name }).lean().exec();
    return res.status(200).json(user);
  } catch (err) {
    console.log("Failed to get setting", err.message);
    return res
      .status(500)
      .send("An error occurred getting the setting. Please try again later.");
  }
};

// Update setting
exports.update = async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { name: req.body.name },
      { value: req.body.value },
      { upsert: true }
    );
    // Check for validation error
    if (setting instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(setting);
    } else {
      // Return new setting
      return res.status(200).json(setting);
    }
  } catch (err) {
    console.log("Failed to update setting", err.message);
    return res
      .status(500)
      .send("An error occurred updating the setting. Please try again later.");
  }
};
