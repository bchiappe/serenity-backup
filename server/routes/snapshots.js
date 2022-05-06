const express = require("express");
const router = express.Router();
const controller = require("../controllers/snapshotController");
const checkAuthorization = require("../services/authorization");

router.get("/", checkAuthorization, controller.getAll);
router.get("/:id", checkAuthorization, controller.get);
router.delete("/:id", checkAuthorization, controller.delete);

router.get("/:id/files", checkAuthorization, controller.listFiles);
router.post("/:id/restore", checkAuthorization, controller.restoreFile);

module.exports = router;
