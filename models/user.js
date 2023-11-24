const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    root: { type: Boolean, default: false },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/ziadgaafar/image/upload/v1628608600/ecommerce_media/qxpnfd1pg1jaxrr8agbd.png",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
