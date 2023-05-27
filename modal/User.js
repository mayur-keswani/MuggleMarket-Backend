const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = require("./Product");
const Store = require("./Store");
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    cart: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
      },
    ],
    wishlist: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],

    storeID: [
      {
        type: Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
