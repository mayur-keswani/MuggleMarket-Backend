const express = require("express");
const User = require("../../modal/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuth = require("../../middleware/isAuth");

router.post("/auth/signup", (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        const error = new Error("User Already Existed");
        error.statusCode = 401;
        throw error;
      } else {
        bcrypt
          .hash(password, 12)
          .then((hashedPassword) => {
            const user = new User({
              username: username,
              email: email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((user) => {
            const payload = {
              userID: user._id.toString(),
              email: user.email,
            };
            const token = jwt.sign(payload, "ALOHOMORA", { expiresIn: "1h" });
            res.json({ token: token, username: user.username });
          })
          .catch((error) => {
            if (!error.statusCode) error.statusCode = 500;

            next(error);
          });
      }
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
});

router.post("/auth/login", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("User not existed !");
        error.statusCode = 401;
        throw error;
      }

      bcrypt
        .compare(password, user.password)
        .then((isMatched) => {
          if (!isMatched) {
            const error = new Error("Password Incorrect");
            error.statusCode = 401;
            throw error;
          } else {
            const payload = {
              userID: user._id.toString(),
              email: user.email,
            };
            const token = jwt.sign(payload, "ALOHOMORA", { expiresIn: "1h" });
            res.status(201).json({ token: token, username: user.username });
          }
        })
        .catch((error) => {
          if (!error.statusCode) {
            error.statusCode = 500;
          }
          next(error);
        });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
});

router.get("/auth-details", isAuth, (req, res, next) => {
  User.findById(req.user)
    .populate("cart.productID")
    .exec((error, user) => {
      if (error) {
        next(error);
      } else {
        if (!user) {
          const error = new Error("User not found");
          error.statusCode = 404;
          next(error);
        }
        res.status(200).json({ user: user });
      }
    });
});
module.exports = router;
