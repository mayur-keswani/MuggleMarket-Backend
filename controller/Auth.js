const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../modal/User");
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID = process.env.GOOGLE_AUTH2_SECRET_KEY; // Replace this with your actual

const signupController = async (req, res, next) => {
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
            const token = jwt.sign(payload, "ALOHOMORA", {
              expiresIn: "1h",
            });
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
};

const loginController = async (req, res, next) => {
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
};

const getAuthDetail = () => {
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
};

const googleSignup = async (req, res, next) => {
  const { idToken } = req.body; // Assuming the ID token is sent in the request body

  try {
    // Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID, // This should match your Google Client ID
    });

    const payload = ticket.getPayload();
    const { sub, name, email, picture } = payload;

    // At this point, you have successfully verified the user's identity with Google.
    // Now you can use the user information (sub, name, email, picture) as needed.

    // For demonstration purposes, you can log the user's information
    console.log("User ID:", sub);
    console.log("Name:", name);
    console.log("Email:", email);

    const user = await User.findOne({ googleId: sub });
    if (!user) {
      const newUser = new User({
        name,
        email,
        password: "GGOGLE_OAUTH_CREDENTIALS",
        googleId: sub,
      });
      await newUser.save();
    }

    // In a real application, you may want to check if the user already exists in your database
    // based on their Google ID (sub). If the user doesn't exist, you can create a new user
    // account with the default password.
    // Otherwise, you can proceed to log the user in based on their Google authentication.

    // Respond to the client indicating successful sign-in
    res.status(200).json({ message: "Sign-in successful", user: payload });
  } catch (error) {
    // If the verification fails or there's an error, handle it gracefully
    console.error("Error verifying Google ID token:", error);
    next(error);
  }
};

module.exports = {
  signupController,
  loginController,
  getAuthDetail,
  googleSignup,
};
