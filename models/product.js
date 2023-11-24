const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, trim: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    images: { type: Array, required: true },
    category: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    inStock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
