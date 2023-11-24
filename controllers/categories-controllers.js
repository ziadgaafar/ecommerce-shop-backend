const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Category = require("../models/category");
const Product = require("../models/product");

exports.createCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return next(new HttpError(message, 400));
  }

  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
    await newCategory.save();
    res.json({
      message: "Category Created Successfully!",
      category: newCategory,
    });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({ categories });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

exports.updateCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return next(new HttpError(message, 400));
  }
  try {
    const categoryId = req.params.id;
    const { name } = req.body;
    await Category.findByIdAndUpdate(categoryId, {
      name,
    });
    const updatedCategory = await Category.findById(categoryId);
    res.json({
      message: "Category Name Updated Successfully!",
      updatedCategory,
    });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    await Category.findByIdAndDelete(categoryId);
    await Product.deleteMany({ category: categoryId });
    res.json({ message: "Category has been successfully deleted!" });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};
