const express = require("express");
const isAuth = require("../middleware/isAuth");
const router = express.Router();

const {
  getStores,
  getStoreDetails,
  getCart,
  postCartProduct,
  removeCartProduct,
  updateCartProduct,
  postCheckout,
  getLastCheckout,
  postOrder,
  makePayment,
  createStripeCheckoutSession,
  getMyOrders,
} = require("../controller/Store");




router.get("/", (req, res) => {
  return res.json({
    message: "Welcome to MuggleMarket Backend",
    version: "1.0.0",
  });
});
router.get("/stores", getStores);
router.get("/store/:id", getStoreDetails);

/**********************   CART ,CHECKOUT AND PAYMENT ************************************ */
router.get("/cart", isAuth, getCart);
router.post("/cart/add", isAuth, postCartProduct);
router.post("/cart/remove", isAuth, removeCartProduct);
router.post("/cart/update", isAuth, updateCartProduct);

router.post("/checkout", isAuth, postCheckout);
router.get("/checkout", isAuth, getLastCheckout);

//@desc: Stripe payment gateway
router.post("/create-checkout-session", isAuth, createStripeCheckoutSession);
router.post("/payment", isAuth, makePayment);

//@desc: Placing Order Route
router.post("/order", isAuth, postOrder);

router.get("/my-orders", isAuth,getMyOrders);

module.exports = router;
