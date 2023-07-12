const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const config = require("./config");
const apiRouter = require("./routes");

mongoose.Promise = global.Promise;
mongoose
  .connect(config.mongoURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB..."));

var app = express();
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRouter);

app.listen(8000, (err) => {
  if (err) {
    return console.log(err.message);
  }
  console.log("Listening on port 8000");
});

module.exports = app;
