const express = require("express");
const router = express.Router();
const controller = require("../controllers/activityController");
const checkAuthorization = require("../services/authorization");

router.get("/", checkAuthorization, controller.getAll);
router.get("/:id", checkAuthorization, controller.get);
router.delete("/:id", checkAuthorization, controller.delete);

module.exports = router;
