const { User, validate } = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");
const ROLES = require("../role");
const userService = require("../services/user.service");
const baseController = require("./base.controller");

async function create(req, res, next) {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let exist = await User.findOne({ email: req.body.email });

  if (exist) {
    return res.status(409).send("User is already registered.");
  }

  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  if (req.user.role === ROLES.ADMIN && req.body.role) {
    user.role = req.body.role;
  }

  try {
    const newUser = await user.save();
    res.json(newUser);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

async function update(req, res, next) {
  const { firstName, lastName, email, password, role } = req.body;

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Object.assign(req.userModel, {
    firstName,
    lastName,
    email,
    password,
  });

  if (req.user.role === ROLES.ADMIN && role) {
    req.userModel.role = role;
  }

  try {
    const updatedUser = await req.userModel.save();

    if (updatedUser.role !== "owner") {
      await Restaurant.deleteMany({ owner: updatedUser._id });
    }

    res.json(updatedUser);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

function read(req, res) {
  res.json(req.userModel);
}

async function list(req, res, next) {
  try {
    const { users, count } = await userService.list(req.query, req.user);

    res.json({ users, count });
  } catch (error) {
    next(error);
  }
}

async function getOwners(req, res, next) {
  try {
    const owners = await User.find({ role: "owner" });
    res.json({ owners });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await req.userModel.remove();

    if (req.userModel.role === "owner") {
      await Restaurant.deleteMany({ owner: req.userModel._id });
    }

    res.json(req.userModel);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

async function getUserByID(req, res, next, id) {
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    req.userModel = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  update,
  read,
  list,
  remove,
  getUserByID,
  getOwners,
};
