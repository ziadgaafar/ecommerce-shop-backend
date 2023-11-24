const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const Order = require("../models/order");
const HttpError = require("../models/http-error");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    return next(new HttpError("Error getting users"));
  }
};

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return next(new HttpError(message, 400));
  }

  const { firstName, lastName, email, password } = req.body;

  try {
    const user = await User.find({ email });
    if (user.length > 0) {
      return next(new HttpError("Email already taken!", 409));
    }
  } catch (err) {
    return next(new HttpError(`Couldn't Register, Please try again!`));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError(`Couldn't Register, Please try again!`));
  }

  const newUser = User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  try {
    newUser.save();
    res.status(201).json({
      message: "Registered Successfully!",
      info: { firstName, lastName, email },
    });
  } catch (err) {
    return next(new HttpError(`Couldn't Register, Please try again!`));
  }
};

exports.login = async (req, res, next) => {
  if (req.headers.authorization) {
    return next(new HttpError("Already Logged in", 406));
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new HttpError("Email is incorrect!"), 422);
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (passwordIsValid === false) {
      return next(new HttpError("Password is incorrect"), 422);
    }

    const accessToken = generateAccessToken({
      id: user._id,
      role: user.role,
      root: user.root,
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
      role: user.role,
      root: user.root,
    });

    res.status(200).json({
      message: "Logged in Successfully",
      accessToken,
      refreshToken,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        root: user.root,
      },
    });
  } catch (err) {
    return next(new HttpError(`Couldn't Login! Please try again`));
  }
};

exports.updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return next(new HttpError(message, 400));
  }
  const { firstName, lastName, newPassword, currentPassword } = req.body;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError("User not found!", 404));
    }
    const passwordHash = await bcrypt.compare(currentPassword, user.password);
    if (!passwordHash) {
      return next(new HttpError("Wrong Password", 403));
    }

    if (newPassword !== "" && newPassword.length < 8) {
      return next(new HttpError("New Password is too short!", 400));
    }

    user.firstName = firstName;
    user.lastName = lastName;
    if (newPassword !== "") {
      user.password = await bcrypt.hash(newPassword, 12);
    }

    user.save();
    res.json({ message: "Updated Successfully!" });
  } catch (err) {
    return next(new HttpError("Update Failed"));
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const selectedUserId = req.params.id;
    if (!selectedUserId) return next(new HttpError("User not found!", 404));

    await User.findByIdAndDelete(selectedUserId);
    await Order.deleteMany({
      user: selectedUserId,
    });

    res.json({ message: "User has been Deleted!" });
  } catch (err) {
    return next(new HttpError("failed to delete user"));
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { isAdmin } = req.body;
    const selecterUserId = req.params.id;
    const selectedUser = await User.findById(selecterUserId);
    if (!selectedUser) return next(new HttpError(`User not found!`, 404));

    if (selectedUser.root)
      return next(new HttpError(`You're Unauthorized to do that!`, 401));

    selectedUser.role = isAdmin ? "admin" : "user";
    await selectedUser.save();
    res.json({ message: "Role Updated Successfully!", user: selectedUser });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

exports.updateAvatar = async (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.userId;

  try {
    await User.findByIdAndUpdate(userId, { avatar });
    res.json({ message: "Avatar Changed Successfully!" });
  } catch (err) {
    return next(new HttpError("Failed to change avatar"));
  }
};

exports.accessToken = async (req, res, next) => {
  try {
    const refreshToken = req.headers.authorization.split(" ")[1];
    if (!refreshToken) {
      return next(new HttpError("Please login!", 400));
    }
    const result = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!result) {
      return next(new HttpError("Session Expired, Please login again!", 401));
    }

    const user = await User.findById(result.id).select("-password");
    if (!user) {
      return next(new HttpError("Unauthorized User", 401));
    }

    const accessToken = generateAccessToken({
      id: user._id,
      role: user.role,
      root: user.root,
    });
    res.json({
      accessToken,
      user,
    });
  } catch (err) {
    return next(new HttpError("Please Login Again!", 401));
  }
};

exports.logout = async (req, res, next) => {
  res.json({ message: "Successfully Logged Out!", messageType: "info" });
};
