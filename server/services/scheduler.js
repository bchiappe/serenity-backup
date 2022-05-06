const Schedule = require("../models/schedule");
const Backup = require("../models/backup");
const Activity = require("../models/activity");
const mongoose = require("mongoose");
const parser = require("cron-parser");
const BackupService = require("../services/backup");
const { getSettings } = require("../services/settings");
const { sendEmail } = require("../services/email");

class Scheduler {
  constructor(id) {
    this.scheduleId = id;
  }

  async run() {
    const schedule = await Schedule.findById(this.scheduleId);
    try {
      // Log schedule start activity
      await this.createActivity({ status: "Running" });
      await this.addActivityMessage({ message: "Started running schedule" });
      // Check that there are backup tasks to run
      if (Array.isArray(schedule.tasks) && schedule.tasks.length > 0) {
        // Iterate through backup tasks
        for (const task of schedule.tasks) {
          // Run backup task
          const b = new BackupService();
          await b.backup(task.backup);
        }
      }
      // Update last run
      schedule.lastRun = {
        result: "success",
        date: Date.now(),
      };
      schedule.save();
      // Log schedule finish activity
      await this.addActivityMessage({ message: "Finished running schedule" });
      // Send alert
      await this.sendAlert("success", {
        schedule: {
          id: schedule._id,
          name: schedule.name,
          runDate: schedule.lastRun.date,
        },
      });
    } catch (err) {
      console.error(`Failed to run schedule: ${err.message}`);
      await this.addActivityMessage({
        message: `Failed to run schedule: ${err.message}`,
      });
      // Send alert
      await this.sendAlert("failure", {
        schedule: {
          id: schedule._id,
          name: schedule.name,
          runDate: schedule.lastRun.date,
        },
      });
    }
  }

  async runDueSchedules() {
    // Update next run dates
    await this.updateNextRunDates();
    // Get due schedules
    const schedules = await this.getDue();
    console.log("Schedules to run", schedules.length);
    // Iterate through due schedules
    for (const schedule of schedules) {
      // Run schedule
      this.scheduleId = schedule._id;
      await this.run();
    }
  }

  async getDue() {
    // Get nearest minute for date calculation
    const nowExact = new Date();
    const interval = 60 * 10000;
    const now = new Date(Math.ceil(nowExact.getTime() / interval) * interval);
    // Get active schedules
    const schedules = await Schedule.find({ active: true });
    const schedulesToRun = [];
    // Iterate through active schedules
    for (const schedule of schedules) {
      const nextRun = new Date(schedule.nextRun);
      if (nextRun.getTime() === now.getTime()) {
        schedulesToRun.push(schedule);
      }
    }
    // Return schedules due to run
    return schedulesToRun;
  }

  async updateNextRunDates() {
    // Get all schedules
    const schedules = await Schedule.find();
    // Iterate through schedules
    for (const schedule of schedules) {
      // Parse cron
      const interval = parser.parseExpression(schedule.cron, {
        iterator: true,
        tz: "America/New_York",
      });
      schedule.nextRun = interval.next().value.toString();
      await schedule.save();
    }
  }

  async createActivity(details) {
    const activity = await Activity.create({
      backup: this.backup._id,
      host: this.backup.host._id,
      repository: this.backup.repository._id,
      ...details,
    });
    this.activity = activity;
  }

  async updateActivity(progress, status = null) {
    this.activity.progress = progress;
    if (status !== null) {
      this.activity.status = status;
    }
    await this.activity.save();
  }

  async addActivityMessage(message) {
    this.activity.messages.push(message);
    await this.activity.save();
  }

  async sendAlert(type, vars = {}) {
    const notifications = await getSettings("notifications");
    console.log("Notifications", notifications);
    if (!["success", "failure"].includes(type)) {
      throw Error(`Cannot handle alert of type: ${type}`);
    }
    const options = {
      from: notifications[type].from,
      to: notifications[type].to,
      cc: notifications[type].cc,
      bcc: notifications[type].bcc,
      subject: notifications[type].subject,
      body: notifications[type].body,
      vars: vars,
    };
    await sendEmail(options);
  }
}

module.exports = Scheduler;
