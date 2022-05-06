const express = require("express");
const router = express.Router();
const controller = require("../controllers/settingsController");
const checkAuthorization = require("../services/authorization");

router.get("/", checkAuthorization, controller.getAll);
router.get("/:name", checkAuthorization, controller.get);
router.post("/", checkAuthorization, controller.update);

module.exports = router;
