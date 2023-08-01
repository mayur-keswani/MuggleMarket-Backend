const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the OrderSchema
const orderSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: false },
  },
  paymentMethod: {
    type: String,
    enum: ["Credit Card", "Debit Card", "PayPal"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
  paymentIntentId: {
    type: String,
    required: false,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

// Create the Order model
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
