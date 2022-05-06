const express = require("express");
const router = express.Router();
const userRouter = require("./users");
const hostRouter = require("./hosts");
const respositoryRouter = require("./repositories");
const backupRouter = require("./backups");
const snapshotRouter = require("./snapshots");
const activityRouter = require("./activity");
const schedulerRouter = require("./scheduler");
const settingsRouter = require("./settings");

// Add route collections
router.use("/users", userRouter);
router.use("/hosts", hostRouter);
router.use("/repositories", respositoryRouter);
router.use("/backups", backupRouter);
router.use("/snapshots", snapshotRouter);
router.use("/activity", activityRouter);
router.use("/scheduler", schedulerRouter);
router.use("/settings", settingsRouter);

// Return router
module.exports = router;
