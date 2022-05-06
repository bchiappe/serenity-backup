const express = require("express");
const router = express.Router();
const controller = require("../controllers/backupController");
const checkAuthorization = require("../services/authorization");

router.get("/", checkAuthorization, controller.getAll);
router.get("/snapshots", checkAuthorization, controller.getSnapshots);
router.get("/activity", checkAuthorization, controller.getActivity);
router.get("/:id", checkAuthorization, controller.get);
router.post("/", checkAuthorization, controller.create);
router.patch("/:id", checkAuthorization, controller.update);
router.delete("/:id", checkAuthorization, controller.delete);

router.post("/:id/run", checkAuthorization, controller.run);

module.exports = router;
