const HttpError = require("../models/http-error");
const User = require("../models/user");

const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return next(new HttpError("Please Login First!", 401));
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return next(
        new HttpError("Session Expired! Please Refresh the Page.", 401)
      );
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userRoot = decoded.root;
    next();
  } catch (err) {
    console.log(err.message);
    return next(new HttpError("Authorization Error", 401));
  }
};

module.exports = auth;
