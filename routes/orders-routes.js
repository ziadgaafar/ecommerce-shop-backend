const { Router } = require("express");
const { check } = require("express-validator");

const ordersController = require("../controllers/orders-controllers");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

const router = Router();

router.use(auth);

router.get("/", ordersController.getOrders);
router.post("/", ordersController.createOrder);

router.use(admin);
router.patch("/:id", ordersController.deliverOrder);

module.exports = router;
