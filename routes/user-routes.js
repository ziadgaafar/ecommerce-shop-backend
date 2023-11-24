const { Router } = require("express");
const { check } = require("express-validator");

const userController = require("../controllers/user-controllers");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

const router = Router();

router.post("/login", userController.login);
router.post(
  "/register",
  [
    check("firstName")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters!"),
    check("lastName")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters!"),
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please Enter a Correct Email!"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Your Password is to short!"),
  ],
  userController.register
);
router.get("/accessToken", userController.accessToken);
router.get("/logout", userController.logout);

router.use(auth);

router.patch(
  "/update",

  [
    check("firstName")
      .isLength({ min: 4 })
      .withMessage("Name must be more that 3 characters!"),
    check("lastName")
      .isLength({ min: 4 })
      .withMessage("Name must be more that 3 characters!"),
  ],
  userController.updateUser
);
router.patch("/update/avatar", userController.updateAvatar);

router.use(admin);
router.get("/all", userController.getUsers);
router.delete("/delete/:id", userController.deleteUser);
router.patch("/update/role/:id", userController.updateRole);

module.exports = router;
