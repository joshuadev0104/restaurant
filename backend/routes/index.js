const express = require("express");

const authRoute = require("./auth.route");
const userRoute = require("./users.route");
const authMiddleware = require("../middleware/auth.middleware");
const restaurantRoute = require("./restaurant.route");

const router = express.Router();

router.use("/auth", authRoute);
router.use("/users", authMiddleware, userRoute);
router.use("/restaurants", authMiddleware, restaurantRoute);

module.exports = router;
