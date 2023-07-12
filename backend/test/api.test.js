const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const config = require("../config");
const User = require("../models/user.model").User;
const Restaurant = require("../models/restaurant.model");
const apiRouter = require("../routes");

const app = express();

describe("api", () => {
  beforeAll((done) => {
    mongoose.Promise = global.Promise;
    mongoose
      .connect(config.mongoURL, {
        useNewUrlParser: true,
      })
      .then(() => console.log("connected to MongoDB..."))
      .catch((err) => console.error("Could not connect to  MongoDB..."));

    app.use(bodyParser.json({ limit: "20mb" }));
    app.use(bodyParser.urlencoded({ limit: "20mb", extended: false }));
    app.use("/", apiRouter);
    done();
  });

  beforeAll((done) => {
    User.deleteMany({ email: "testuser@test.com" }).then(() => {
      done();
    });
  });

  describe("auth", () => {
    test("should successfully register", () =>
      request(app)
        .post("/auth/signup")
        .send({
          email: "testuser@test.com",
          password: "test123",
          firstName: "test",
          lastName: "user",
        })
        .then((resp) => {
          expect(resp.statusCode).toBe(201);
        }));

    test("should successfully login with correct credentials", () =>
      request(app)
        .post("/auth/login")
        .send({
          email: "testuser@test.com",
          password: "test123",
        })
        .then((resp) => {
          expect(resp.statusCode).toBe(200);
        }));
  });

  describe("Restaurant", () => {
    let authToken = "";
    let userId = "";

    const testRestaurant = {
      name: "new",
    };

    const user = new User({
      firstName: "Userone",
      lastName: "Testone",
      email: "testuser@testone.com",
      password: "test1",
      role: "admin",
    });

    beforeAll((done) => {
      user.save().then((newUser) => {
        userId = newUser._id;
        authToken = `Bearer ${jwt.sign(
          {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role,
          },
          config.jwtSecret,
          { expiresIn: config.jwtExpires }
        )}`;
        done();
      });
    });

    afterAll((done) => {
      Restaurant.deleteMany({ owner: userId }).then(() => {
        User.deleteOne({ _id: userId }).then(() => {
          done();
        });
      });
    });

    test("should create restaurant", () =>
      request(app)
        .post("/restaurants/")
        .set("Authorization", authToken)
        .send({
          name: testRestaurant.name,
          owner: userId,
        })
        .then((resp) => {
          expect(resp.statusCode).toBe(200);
        }));

    describe("Restaurant detail", () => {
      let currentRestaurantId = "";

      beforeAll((done) => {
        const crudRestaurant = {
          name: "Test",
          owner: userId,
        };
        Restaurant.create(crudRestaurant).then((newRestaurant) => {
          currentRestaurantId = newRestaurant._id;
          done();
        });
      });

      test("should read restaurant", () =>
        request(app)
          .get(`/restaurants/${currentRestaurantId}`)
          .set("Authorization", authToken)
          .then((resp) => {
            expect(resp.statusCode).toBe(200);
          }));

      test("should update restaurant", () => {
        testRestaurant.name = "place";
        return request(app)
          .put(`/restaurants/${currentRestaurantId}`)
          .set("Authorization", authToken)
          .send({
            name: testRestaurant.name,
          })
          .then((resp) => {
            expect(resp.body.name).toBe("place");
          });
      });

      test("should delete restaurant", () =>
        request(app)
          .delete(`/restaurants/${currentRestaurantId}`)
          .set("Authorization", authToken)
          .then((resp) => {
            expect(resp.statusCode).toBe(200);
          }));
    });
  });

  afterAll((done) => {
    User.deleteMany({ email: "testuser@testone.com" }).then(() => {
      mongoose.disconnect();
      done();
    });
  });

  afterAll((done) => {
    User.deleteMany({ email: "testuser@test.com" }).then(() => {
      mongoose.disconnect();
      done();
    });
  });

  afterAll(() => mongoose.disconnect());
});
