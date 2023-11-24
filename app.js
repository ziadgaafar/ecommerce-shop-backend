const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const HttpError = require("./models/http-error");
const userRouter = require("./routes/user-routes");
const productsRouter = require("./routes/product-routes");
const checkoutRouter = require("./routes/checkout-routes");
const ordersRouter = require("./routes/orders-routes");
const categoriesRouter = require("./routes/categories-routes");

const app = express();
const PORT = process.env.PORT || 3001;

//Middlewares
app.use(
  cors({
    origin: process.env.WEB_APP_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/user", userRouter);
app.use("/api/products", productsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/categories", categoriesRouter);

//Unexpected Route Handler
app.use((req, res, next) => {
  next(new HttpError("Route not found!", 404));
});

//Special Error Handler Middleware
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || "Something went wrong!" });
});

//Listenning to the PORT and Connecting to MongoDB
mongoose
  .connect(process.env.DB_KEY)
  .then((data) => {
    app.listen(PORT, () => console.log("server is running"));
  })
  .catch((err) => console.log(err.message));
