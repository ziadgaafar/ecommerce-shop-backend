const { Router } = require("express");
const { check } = require("express-validator");

const categoriesController = require("../controllers/categories-controllers");
const admin = require("../middlewares/admin");
const auth = require("../middlewares/auth");

const router = Router();

router.get("/", categoriesController.getCategories);

router.use(auth);
router.use(admin);

router.post(
  "/",
  [
    check("name")
      .isLength({ min: 4 })
      .withMessage("Category Name is too short!"),
  ],
  categoriesController.createCategory
);
router.patch(
  "/:id",
  [
    check("name")
      .isLength({ min: 4 })
      .withMessage("Category Name is too short!"),
  ],
  categoriesController.updateCategory
);
router.delete("/:id", categoriesController.deleteCategory);

module.exports = router;
