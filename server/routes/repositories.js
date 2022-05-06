const express = require("express");
const router = express.Router();
const controller = require("../controllers/respositoryController");
const checkAuthorization = require("../services/authorization");

router.get("/", checkAuthorization, controller.getAll);
router.get("/:id", checkAuthorization, controller.get);
router.post("/", checkAuthorization, controller.create);
router.patch("/:id", checkAuthorization, controller.update);
router.delete("/:id", checkAuthorization, controller.delete);

module.exports = router;
