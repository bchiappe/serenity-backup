const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const checkAuthorization = require("../services/authorization");

router.post("/login", controller.login);
router.post("/logout", checkAuthorization, controller.logout);
router.get("/authorized", checkAuthorization, controller.authorized);
router.get("/", checkAuthorization, controller.getAll);
router.get("/me", checkAuthorization, controller.getMe);
router.get("/:id", checkAuthorization, controller.get);
router.post("/", checkAuthorization, controller.create);
router.put("/:id", checkAuthorization, controller.replace);
router.patch("/me", checkAuthorization, controller.updateMe);
router.patch("/:id", checkAuthorization, controller.update);
router.delete("/:id", checkAuthorization, controller.delete);

module.exports = router;
