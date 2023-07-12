const express = require("express");
const router = express.Router();

const authCtrl = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.route("/login").post(authCtrl.login);
router.route("/signup").post(authCtrl.signup);
router.route("/update").put(authMiddleware, authCtrl.update);

module.exports = router;
