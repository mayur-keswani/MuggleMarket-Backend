const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

const storeSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      address: { type: String, required: true },
      city: {
        type: String,
        required: true,
      },
      lat: { type: Number },
      long: { type: Number },
    },

    storeType: {
      type: String,
      required: true,
    },
    contactNo: {
      type: Number,
      required: true,
    },
    landlineNo: {
      type: Number,
    },
    openingTime: {
      type: String,
      required: true,
    },
    closingTime: {
      type: String,
      required: true,
    },
    yearOfEstablish: {
      type: Number,
    },
    // storeItems: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Product",
    //   },
    // ],
    avgExpense: {
      type: Number,
    },
    ownerName: {
      type: String,
      required: true,
    },
    personalNo: {
      type: Number,
    },
    social: {
      site: { type: String },
      instagram: { type: String },
      youtube: { type: String },
      facebook: { type: String },
    },
    picture: {
      type: String,
      required: true,
    },
    categories: [
      {
        name: { type: String },
        description: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Store", storeSchema);
