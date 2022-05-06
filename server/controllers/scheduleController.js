const Schedule = require("../models/schedule");
const Backup = require("../models/backup");
const Activity = require("../models/activity");
const mongoose = require("mongoose");
const paginate = require("express-paginate");
const parser = require("cron-parser");
const Scheduler = require("../services/scheduler");

// Get schedules
exports.getAll = async (req, res) => {
  try {
    const [results, itemCount] = await Promise.all([
      Schedule.find()
        //.populate("backup", "_id name")
        .limit(req.query.limit)
        .skip(req.skip)
        .lean()
        .exec(),
      Schedule.count(),
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    return res.status(200).json({
      count: itemCount,
      pages: pageCount,
      hasMore: paginate.hasNextPages(req)(pageCount),
      items: results,
    });
  } catch (err) {
    console.log("Failed to get schedules", err.message);
    return res
      .status(500)
      .send("An error occurred getting the schedules. Please try again later.");
  }
};

// Get schedule
exports.get = async (req, res) => {
  try {
    const user = await Schedule.findById(req.params.id).lean().exec();
    return res.status(200).json(user);
  } catch (err) {
    console.log("Failed to get schedule", err.message);
    return res
      .status(500)
      .send("An error occurred getting the schedule. Please try again later.");
  }
};

// Add schedule
exports.create = async (req, res) => {
  try {
    // Check for valid cron
    let nextRun;
    try {
      const interval = parser.parseExpression(req.body.cron, {
        iterator: true,
        tz: "America/New_York",
      });
      nextRun = interval.next().value.toString();
    } catch (err) {
      console.error("Unable to parse cron", err.message);
      return res.status(400).send(`Unable to parse cron: ${err.message}`);
    }
    // Attempt to insert schedule into database
    const schedule = await Schedule.create({
      ...req.body,
      nextRun: nextRun,
    });
    // Check for validation error
    if (schedule instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(schedule);
    } else {
      // Return new schedule
      return res.status(200).json(schedule);
    }
  } catch (err) {
    console.log("Failed to create schedule", err.message);
    return res
      .status(500)
      .send("An error occurred creating the schedule. Please try again later.");
  }
};

// Update schedule
exports.update = async (req, res) => {
  try {
    // Check for valid cron
    let nextRun;
    try {
      const interval = parser.parseExpression(req.body.cron, {
        iterator: true,
        tz: "America/New_York",
      });
      nextRun = interval.next().value.toString();
    } catch (err) {
      console.error("Unable to parse cron", err.message);
      return res.status(400).send(`Unable to parse cron: ${err.message}`);
    }
    const data = { ...req.body, nextRun: nextRun };
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, data);
    // Check for validation error
    if (schedule instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(schedule);
    } else {
      // Return new schedule
      return res.status(200).json(schedule);
    }
  } catch (err) {
    console.log("Failed to update schedule", err.message);
    return res
      .status(500)
      .send("An error occurred updating the schedule. Please try again later.");
  }
};

// Delete schedule
exports.delete = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    // Return no content
    return res.status(204).send();
  } catch (err) {
    console.log("Failed to delete schedule", err.message);
    return res
      .status(500)
      .send("An error occurred deleting the schedule. Please try again later.");
  }
};

// Run schedule
exports.run = async (req, res) => {
  try {
    // Retrieve schedule
    const scheduleId = req.params.id;
    const s = new Scheduler(scheduleId);
    await s.run();
    // Return no content
    return res.status(204).send();
  } catch (err) {
    console.log("Failed to run schedule", err.message);
    return res
      .status(500)
      .send("An error occurred running the schedule. Please try again later.");
  }
};
