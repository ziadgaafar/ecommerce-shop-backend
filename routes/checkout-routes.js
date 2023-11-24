const { Router } = require("express");

const checkoutControllers = require("../controllers/checkout-controllers");
const auth = require("../middlewares/auth");

const router = Router();

router.use(auth);

router.get("/session", checkoutControllers.getSession);
router.post("/", checkoutControllers.checkout);

module.exports = router;
