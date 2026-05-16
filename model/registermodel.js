const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    price: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      default: "",
    },

    experience: {
      type: Number,
      default: 0,
    },

    startlocation: {
      type: String,
      default: "",
    },

    endlocation: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "driver", "user"],
      default: "user",
      index: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["confirmed", "ongoing", "cancelled", "completed"],
      default: "confirmed",
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    driverLicense: {
      type: String,
      default: "",
    },

    vehicleNumber: {
      type: String,
      trim: true,
      default: "",
    },

    vehicleType: {
      type: String,
      enum: ["car", "bike", "auto", "truck"],
      default: "car",
    },

    payment: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);