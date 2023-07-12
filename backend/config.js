const dotenv = require("dotenv");

try {
  dotenv.config();
} catch (e) {
  console.log(e);
}

module.exports = {
  mongoURL: process.env.MONGO_URL || "mongodb://localhost:27017/toptal",
  jwtSecret: process.env.JWT_SECRET || "jwtSecret",
  jwtExpires: process.env.JWT_EXPIRES || "50d",
};
