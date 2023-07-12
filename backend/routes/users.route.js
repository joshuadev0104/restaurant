const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/user.controller");
const Roles = require("../role");
const permission = require("../permission");

router.use(permission.isRole([Roles.ADMIN]));

router.route("/").get(userCtrl.list).post(userCtrl.create);
router.route("/owners").get(userCtrl.getOwners);

router
  .route("/:id")
  .get(userCtrl.read)
  .put(userCtrl.update)
  .delete(userCtrl.remove);

router.param("id", userCtrl.getUserByID);

module.exports = router;
