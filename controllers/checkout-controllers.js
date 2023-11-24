const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);
const HttpError = require("../models/http-error");

exports.checkout = async (req, res, next) => {
  const { cart, email, address, mobile, total } = req.body;
  if (!cart || cart.length === 0) {
    return next(new HttpError("Please add items to Cart!", 406));
  }

  let lineItems = [];
  cart.map((item) => {
    let images = [];
    item.images.map((image) => {
      images.push(image.url);
    });
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          description: item.content,
          images: images,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    });
  });
  try {
    const session = await stripe.checkout.sessions.create({
      cancel_url: `${process.env.WEB_APP_URL}/cart`,
      success_url: `${process.env.WEB_APP_URL}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email,
      metadata: { address, mobile, total },
    });

    res.json({ sessionUrl: session.url });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

exports.getSession = async (req, res, next) => {
  const { session_id } = req.query;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.json(session);
  } catch (err) {
    return next(new HttpError("Invalid Session ID!", 404));
  }
};
