const { Router } = require("express");
const { check } = require("express-validator");

const productController = require("../controllers/product-controllers");
const admin = require("../middlewares/admin");
const auth = require("../middlewares/auth");

const router = Router();

router.get("/:id", productController.getProductById);
router.get("/", productController.getProducts);

router.use(auth);
router.use(admin);

router.post(
  "/",
  [
    check("title").isLength({ min: 4 }).withMessage("Title is too short!"),
    check("price")
      .isFloat({ min: 1, max: 10000 })
      .withMessage("Invalid price range!"),
    check("inStock")
      .isFloat({ min: 1, max: 10000 })
      .withMessage("Invalid stock range!"),
    check("content")
      .isLength({ min: 20, max: 200 })
      .withMessage("Title is too short!"),
    check("description")
      .isLength({ min: 20, max: 400 })
      .withMessage("Title is too short!"),
    check("category")
      .isString()
      .isLength({ min: 1 })
      .withMessage("Wrong category!"),
  ],
  productController.createProduct
);
router.patch(
  "/:id",
  [
    check("title").isLength({ min: 4 }).withMessage("Title is too short!"),
    check("price")
      .isFloat({ min: 1, max: 10000 })
      .withMessage("Invalid price range!"),
    check("inStock")
      .isFloat({ min: 1, max: 10000 })
      .withMessage("Invalid stock range!"),
    check("content")
      .isLength({ min: 20, max: 200 })
      .withMessage("Title is too short!"),
    check("description")
      .isLength({ min: 20, max: 400 })
      .withMessage("Title is too short!"),
    check("category")
      .isString()
      .isLength({ min: 1 })
      .withMessage("Wrong category!"),
  ],
  productController.editProduct
);
router.delete("/", productController.deleteProducts);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
