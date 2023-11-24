const HttpError = require("../models/http-error");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

exports.createOrder = async (req, res, next) => {
  const { address, mobile, cart, total } = req.body;
  const id = req.userId;

  try {
    const order = new Order({ user: id, address, mobile, cart, total });

    cart.map(async (item) => {
      await Product.findByIdAndUpdate(item._id, {
        inStock: item.inStock - item.quantity,
        sold: item.sold + item.quantity,
      });
    });

    await order.save();
    res.json(order);
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

exports.getOrders = async (req, res, next) => {
  const userId = req.userId;
  const userRole = req.userRole;
  let orders;

  try {
    if (userRole === "admin") {
      orders = await Order.find().populate("user", "-password");
    } else {
      orders = await Order.find({ user: userId }).populate("user", "-password");
    }

    if (!orders) {
      return next(new HttpError("Error"));
    }
    res.json({ orders });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

exports.deliverOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndUpdate(orderId, { delivered: true });
    const order = await Order.findById(orderId);
    res.json({
      message: "Order Marked as Delivered",
      order,
    });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};
