const Review = require("../models/review.model");
const Restaurant = require("../models/restaurant.model");
const ROLES = require("../role");
const baseController = require("./base.controller");

async function create(req, res, next) {
  const review = new Review(req.body);
  review.restaurant = req.restaurant._id;
  review.user = req.user._id;

  if (req.restaurant.owner == req.user._id) {
    return res
      .status(403)
      .send("You are not allowed to leave a review for your restaurant");
  }

  if (
    await Review.findOne({ user: req.user._id, restaurant: req.restaurant._id })
  ) {
    return res
      .status(403)
      .send("You are not allowed to leave multiple reviews for a restaurant");
  }

  try {
    const restaurant = await Restaurant.findById(req.restaurant._id);

    const reviewCount = restaurant.reviewCount + 1;
    const averageRate =
      (restaurant.averageRate * restaurant.reviewCount + review.rate) /
      reviewCount;

    restaurant.reviewCount = reviewCount;
    restaurant.averageRate = averageRate;

    await restaurant.save();

    const newReview = await review.save();

    res.json(newReview);
  } catch (err) {
    return res.status(500).send("err.message");
  }
}

async function update(req, res, next) {
  const { comment, date, rate, reply } = req.body;

  const updatedObj = {};

  if (
    req.user.role === ROLES.ADMIN ||
    (req.user.role === ROLES.OWNER && !req.review.reply)
  ) {
    updatedObj.reply = reply;
  }

  if (req.user.role !== ROLES.OWNER) {
    if (comment) {
      updatedObj.comment = comment;
    }
    if (date) {
      updatedObj.date = date;
    }
    if (rate) {
      updatedObj.rate = rate;
    }
  }

  Object.assign(req.review, updatedObj);

  try {
    const { restaurantId } = req.params;
    delete req.review.user;
    delete req.review.restaurant;

    const updatedReview = await req.review.save();
    const restaurant = await Restaurant.findById(restaurantId);

    const reviews = await Review.find({ restaurant: restaurantId });
    const totalRates = reviews.reduce((sum, review) => review.rate + sum, 0);
    const averageRate = totalRates / restaurant.reviewCount;

    restaurant.averageRate = averageRate;

    await restaurant.save();
    const populatedData = await Review.findById(updatedReview._id).populate(
      "user restaurant"
    );
    res.json(populatedData);
  } catch (err) {
    return res.status(500).send("err.message");
  }
}

async function read(req, res, next) {
  try {
    const result = await Review.findById(req.review._id).populate(
      "restaurant user"
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  const { restaurantId } = req.params;
  const { page, limit } = req.query;

  const skip = page * limit;

  const where = baseController.listWhere({});

  where.restaurant = restaurantId;

  try {
    const results = await Promise.all([
      Review.find(where)
        .populate("restaurant user")
        .skip(skip * 1 || 0)
        .limit(limit * 1 || 10)
        .lean(),
      baseController.getCount(Review, where),
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
    return res.status("403").send("You are not allowed to delete review.");
  }

  try {
    await req.review.remove();

    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);

    const reviews = await Review.find({ restaurant: restaurantId });
    if (!reviews.length) {
      restaurant.averageRate = 0;
      restaurant.reviewCount = 0;
    } else {
      const totalRates = reviews.reduce((sum, review) => review.rate + sum, 0);
      const reviewCount = restaurant.reviewCount - 1;
      const averageRate = totalRates / reviewCount;

      restaurant.averageRate = averageRate;
      restaurant.reviewCount = reviewCount;
    }

    await restaurant.save();

    res.json(req.review);
  } catch (err) {
    next(err);
  }
}

async function getReviewByID(req, res, next, id) {
  try {
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).send("Review not found");
    }
    req.review = review;
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
  getReviewByID,
};
