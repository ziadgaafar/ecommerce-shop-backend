const { validationResult } = require("express-validator");

const Product = require("../models/product");
const Category = require("../models/category");
const HttpError = require("../models/http-error");

exports.getProducts = async (req, res, next) => {
  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  try {
    const search = req.query.search || "";
    const regex = new RegExp(escapeRegex(search), "gi");
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit) || 100;
    const min = parseInt(req.query.min) || 0;
    const max = parseInt(req.query.max) || 10000;
    const { category } = req.query;
    let sort;
    let filterQuery = {};
    switch (req.query.sort) {
      case "bestSeller":
        sort = { sold: "desc" };
        break;
      case "newestAdded":
        sort = { createdAt: "desc" };
        break;
      case "htl":
        sort = { price: "desc" };
        break;
      case "lth":
        sort = { price: "ascending" };
        break;
      default:
        sort = { createdAt: "ascending" };
        break;
    }

    if (category && category !== "all") {
      filterQuery.category = category;
    }
    filterQuery.price = { $lte: max, $gte: min };
    const products = await Product.find({ title: regex, ...filterQuery })
      .populate("category")
      .sort(sort)
      .limit(limit)
      .skip(skip);
    res.json({ products });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

exports.getProductById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return next(new HttpError("Product not found!", 404));
    }
    res.json({ product });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

exports.createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return next(new HttpError(message, 400));
  }

  try {
    const { title, price, inStock, content, description, category, images } =
      req.body;
    if (images.length === 0 || images.length > 5) {
      return next(
        new HttpError("Images should be between 1 and 5 images!", 406)
      );
    }

    const foundCategory = await Category.findById(category);
    if (!foundCategory) {
      return next(new HttpError("Please select a correct category!", 406));
    }

    const newProduct = new Product({
      title,
      price,
      inStock,
      content,
      description,
      category,
      images,
    });

    await newProduct.save();
    res.json({ message: "Procuct has been successfully created!", newProduct });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

exports.editProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return next(new HttpError(message, 400));
  }
  try {
    const selectedId = req.params.id;
    const { title, price, inStock, content, description, category, images } =
      req.body;

    if (images.length === 0 || images.length > 5) {
      return next(
        new HttpError("Images should be between 1 and 5 images!", 406)
      );
    }

    const foundCategory = await Category.findById(category);
    if (!foundCategory) {
      return next(new HttpError("Please select a correct category!", 406));
    }

    await Product.findByIdAndUpdate(selectedId, {
      title,
      price,
      inStock,
      content,
      description,
      category,
      images,
    });

    res.json({ message: "Product has been successfully updated!" });
  } catch (err) {
    return nexT(new HttpError(err.message));
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const selectedId = req.params.id;
    await Product.findByIdAndDelete(selectedId);
    res.json({
      message: "Product has been successfully deleted!",
    });
  } catch (err) {
    return nexT(new HttpError(err.message));
  }
};

exports.deleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await Product.deleteMany({ _id: { $in: ids } });
    res.json({
      message: "Selected Products have been successfully deleted!",
    });
  } catch (err) {
    return nexT(new HttpError(err.message));
  }
};
