const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const {
  signupController,
  loginController,
  getAuthDetail,
  googleSignup,
} = require("../controller/Auth");

router.post("/signup", signupController);

router.post("/login", loginController);

router.get("/me", isAuth, getAuthDetail);

router.post("/google-signin", googleSignup);

module.exports = router;
