const { User, validate } = require("../models/user.model");

async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send("Email or Password can not be empty");
  }

  const user = await User.findOne({ email })
    .select("_id password email firstName lastName role")
    .exec();

  if (!user) {
    return res.status(404).send("User not found");
  }

  try {
    await user.authenticate(req.body.password);
  } catch (err) {
    return res.status(403).send("Incorrect password");
    next(err);
  }

  const token = user.createAuthToken();

  res.json({
    info: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    token,
  });
}

async function signup(req, res, next) {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (await User.findOne({ email: req.body.email })) {
    return res.status(409).send("Email is already taken");
  }

  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    return res.status(500).send("Internal Server error");
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ _id: req.user._id });
    Object.assign(user, req.body);
    user.role = req.user.role;
    const updatedUser = await user.save();
    const token = updatedUser.createAuthToken();
    res.json({
      info: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  signup,
  update,
};
