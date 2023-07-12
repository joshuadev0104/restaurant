const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const ROLES = require("../role");
const config = require("../config");

const { Schema } = mongoose;
const SALT_ROUNDS = 10;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, default: "" },
    lastName: { type: String, required: true, trim: true, default: "" },
    email: {
      type: String,
      unique: [true, "Email is already taken"],
      required: true,
      trim: true,
    },
    password: { type: String, select: false },
    role: {
      type: String,
      required: true,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.methods.encryptPassword = function encryptPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
      if (err) {
        return reject(new Error("Failed to generate hash"));
      }
      return resolve(hash);
    });
  });
};

userSchema.methods.authenticate = function authenticate(password) {
  return new Promise((resolve, reject) => {
    bcrypt
      .compare(password, this.password)
      .then((allow) => {
        if (!allow) return reject();
        return resolve();
      })
      .catch(reject);
  });
};

userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.methods.createAuthToken = function createAuthToken() {
  const token = jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpires }
  );
  return token;
};

userSchema.pre("save", function preSave(next) {
  if (this.password && this.isModified("password")) {
    this.password = this.encryptPassword(this.password)
      .then((password) => {
        this.password = password;
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

const User = mongoose.model("User", userSchema);

const validateUser = (user) => {
  const schema = {
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(50).required().email(),
    password: Joi.string().min(3).max(50).required(),
    role: Joi.string().default(ROLES.USER),
  };

  return Joi.validate(user, schema);
};

exports.User = User;
exports.validate = validateUser;
