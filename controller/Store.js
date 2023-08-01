const { sendWhatsappMessage } = require("../helper/sendWhatsaapMessage");
const Checkout = require("../modal/Checkout");
const Order = require("../modal/Order");
const Product = require("../modal/Product");
const Store = require("../modal/Store");
const User = require("../modal/User");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const getStores = async (req, res, next) => {
  Store.find()
    .then((stores) => {
      res.status(200).json({ stores: stores });
    })
    .catch((error) => {
      if (!error.statusCode) error.statusCode = 500;
      next(error);
    });
};

const getStoreDetails = async (req, res, next) => {
  const id = req.params.id;
  try {
    const storeProducts = await Product.find({ storeID: id });
    const storeDetails = await Store.findById(id).lean();

    if (!!!storeDetails && !!!storeDetails?._id) {
      const error = new Error("Store Not Found!");
      error.statusCode = 404;
      next(error);
    } else {
      // let isOwner = false
      // if(req.user){
      //   console.log(req.user)
      //   console.log(storeDetails.owner)
      //   if(storeDetails.owner.toString() == req.user.toString()){
      //     isOwner=true
      //   }
      // }
      return res
        .status(200)
        .json({ store: { ...storeDetails, products: storeProducts } });
    }
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  User.findById(req.user)
    .populate("cart.product")
    .exec((error, user) => {
      if (error) {
        console.log(err);
        const error = new Error("Something went wrong!");
        next(error);
      }
      if (!user) {
        const error = new Error("User Not Found!");
        error.statusCode = 404;
        next(error);
      } else {
        res.status(200).json({ cart: user.cart });
      }
    });
};

const postCartProduct = async (req, res, next) => {
  const jsonBody = req.body; //{id:""}

  try {
    const user = await User.findById(req.user);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
    }

    user.cart = user.cart.concat({ product: jsonBody.id, quantity: 1 });
    const result = await user.save();
    let newCartItem = result.cart.find(
      (cartItem) => cartItem.product.toString() === jsonBody.id.toString()
    );

    return res.status(201).json({ cart: newCartItem });
  } catch (error) {
    next(error);
  }
};

const removeCartProduct = async (req, res, next) => {
  const jsonBody = req.body; //{id:""}

  User.findById(req.user)
    .then((user) => {
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 401;
      }
      const cartItemIndex = user.cart.findIndex(
        (item) => item.product.toString() === jsonBody.id
      );

      // Check if the cart item exists
      if (cartItemIndex === -1) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      // Remove the cart item from the user's cart array
      user.cart.splice(cartItemIndex, 1);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ cart: result });
    })
    .catch((error) => {
      next(error);
    });
};

const updateCartProduct = async (req, res, next) => {
  const jsonBody = req.body; //{id:"",quantity}

  User.findById(req.user)
    .then((user) => {
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 401;
      }

      // Find the index of the cart item with the specified cart item ID
      const cartItemIndex = user.cart.findIndex(
        (item) => item.product.toString() === jsonBody.id
      );
      user.cart[cartItemIndex].quantity = jsonBody.quantity;
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ cart: result });
    })
    .catch((error) => {
      next(error);
    });
};

const postCheckout = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;

  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const postalCode = req.body.postalCode;

  const totalAmount = req.body.totalAmount;
  const products = req.body.products;

  const paymentStatus = req.body.paymentStatus;
  const paymentMethod = req.body.paymentMethod;
  try {
    const checkout = new Checkout({
      user: req.user,
      shippingAddress: {
        address,
        city,
        state,
        postalCode,
      },
      products,
      totalAmount,
      paymentStatus,
      paymentMethod,
    });
    const resp = await checkout.save();
    return res.status(201).json({ checkout: resp });
  } catch (error) {
    next(error);
  }
};

const getLastCheckout = async (req, res, next) => {
  try {
    const lastCheckoutOrder = await Checkout.findOne(
      { user: req.user },
      {},
      { sort: { created_at: -1 } }
    )
      .populate("user")
      .exec();
    return res.json({ order: lastCheckoutOrder });
  } catch (error) {
    next(error);
  }
};

const makePayment = async (req, res, next) => {
  const { paymentMethodId, amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // amount in cents
      currency: "inr",
      payment_method: paymentMethodId,
      confirm: true,
    });

    res.json({ success: true, paymentIntentId: paymentIntent.id });
  } catch (error) {
    next(error);
  }
};
const postOrder = async (req, res, next) => {
  try {
    const address = req.body.address;
    const city = req.body.city;
    const state = req.body.state;
    const postalCode = req.body.postalCode;

    const totalAmount = req.body.totalAmount;
    const products = req.body.products;

    const paymentStatus = req.body.paymentStatus;
    const paymentMethod = req.body.paymentMethod;
    const paymentIntentId = req.body.paymentIntentId ?? "";

    const checkoutObj = await Checkout.find({ user: req.user });

    const order = new Order({
      user: req.user,
      shippingAddress: {
        address,
        city,
        state,
        postalCode,
      },
      products,
      totalAmount,
      paymentStatus,
      paymentMethod,
      paymentIntentId,
    });

    const result = await order.save();
    // await sendWhatsappMessage(
    //   `You have revieved an order.Pls.get it deliver at Address : ${order.shippingAddress.address}  `
    // );

    const user = await User.findById(req.user);
    user.cart = [];
    await user.save();

    await Checkout.findByIdAndDelete(checkoutObj._id);

    return res.status(201).json({
      message: "Your Order is successfully being placed",
      order: result,
    });
  } catch (error) {
    next(error);
  }
};

const createStripeCheckoutSession = async (req, res, next) => {
  try {
    const items = req.body.items;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items,
      mode: "payment",
      success_url: `http://127.0.0.1:5173/checkout?success=true&transaction_id={transaction_id}`,
      cancel_url: "http://127.0.0.1:5173/checkout",
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getMyOrders=async(req,res,next)=>{
  try{
    const orders = await Order.find({ user: req.user }).populate("products.product").exec();
    return res.json({orders})
  }catch(error){
    next(error)
  }
}

module.exports = {
  getStores,
  getStoreDetails,
  getCart,
  postCartProduct,
  removeCartProduct,
  updateCartProduct,
  postCheckout,
  makePayment,
  getLastCheckout,
  postOrder,
  createStripeCheckoutSession,
  getMyOrders,
};
