const jwt = require("jsonwebtoken");

const isAuth = async (req, res, next) => {
  let decodedToken;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      const token = req.headers.authorization.split(" ")[1];
      decodedToken = await jwt.verify(token, "ALOHOMORA");
    } else {
      throw new Error("Invalid Request!");
    }
  } catch (error) {
    error.statusCode = 401;
    return next(error);
  }
  if (!!!decodedToken?.userID) {
    const error = new Error("Invalud Request!");
    return next(error);
  }

  req.user = decodedToken.userID;
  next();
};
module.exports = isAuth;
