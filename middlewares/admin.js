const HttpError = require("../models/http-error");

const admin = (req, res, next) => {
  const { userRole } = req;
  if (userRole !== "admin") {
    return next(new HttpError("Unauthorized!", 401));
  }
  next();
};

module.exports = admin;
