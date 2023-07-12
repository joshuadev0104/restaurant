const Restaurant = require("../models/restaurant.model");
const Review = require("../models/review.model");
const ROLES = require("../role");

const baseController = require("./base.controller");

async function create(req, res, next) {
  const { name } = req.body;

  if (!name) {
    return res.status(422).send("Name can not be empty");
  }

  const restaurant = new Restaurant(req.body);

  if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.OWNER) {
    res.status(403).send("You are not allowed to add restaurant");
  }

  restaurant.owner =
    req.user.role === ROLES.OWNER ? req.user._id : req.body.owner;

  if (!restaurant.owner) {
    return res.status(422).send("Owner can not be empty");
  }

  try {
    const newRestaurant = await restaurant.save();
    res.json(newRestaurant);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  Object.assign(req.restaurant, req.body);
  if (req.user.role === ROLES.ADMIN) {
    try {
      const updatedRestaurant = await req.restaurant.save();
      const populated = await Restaurant.findById(
        updatedRestaurant._id
      ).populate("owner");
      res.json(populated);
    } catch (err) {
      next(err);
    }
  } else {
    return res.status(403).send("You are not allowed to update restaurant");
  }
}

async function read(req, res, next) {
  try {
    const authUserReview = await Review.findOne({
      restaurant: req.restaurant._id,
      user: req.user._id,
    });

    const result = await Restaurant.findById(req.restaurant._id).lean();

    res.json({ ...result, authUserReview });
  } catch (err) {
    return res.status(500).send("err.message");
  }
}

async function list(req, res, next) {
  let { filters, page, limit = 5 } = req.query;

  const skip = page * limit;

  filters = JSON.parse(filters);

  const where = baseController.listWhere(filters || {});
  //const sort = baseController.listSort(sorts || []);

  if (req.user.role === ROLES.OWNER) {
    where.owner = req.user._id; // eslint-disable-line
  }

  try {
    const results = await Promise.all([
      Restaurant.find(where)
        .populate("owner")
        .skip(skip * 1 || 0)
        .limit(limit * 1 || 10)
        .lean(),
      baseController.getCount(Restaurant, where),
    ]);
    const [items, total] = results;

    res.send({
      skip: skip * 1 || 0,
      limit: limit * 1 || 10,
      total,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).send("You are not allowed to delete restaurant");
  }

  try {
    await req.restaurant.remove();
    res.json(req.restaurant);
  } catch (err) {
    next(err);
  }
}

async function report(req, res, next) {
  try {
    const max = await Review.find({ restaurant: req.restaurant._id })
      .sort([["rate", -1]])
      .limit(1);

    const min = await Review.find({ restaurant: req.restaurant._id })
      .sort([["rate", 1]])
      .limit(1);

    res.json({ max: max[0], min: min[0] });
  } catch (err) {
    next(err);
  }
}

async function getRestaurantByID(req, res, next, id) {
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).send("Restaurant not found.");
    }

    req.restaurant = restaurant;
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
  report,
  getRestaurantByID,
};
