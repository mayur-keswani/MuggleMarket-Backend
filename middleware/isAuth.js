const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
  const token = req.headers.authorization;

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "ALOHOMORA");
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
  if (!decodedToken) {
    const error = new Error("Not Authenticatd");
    error.statusCode = 401;
  }

  req.user = decodedToken.userID;
  next();
};
module.exports = isAuth;
