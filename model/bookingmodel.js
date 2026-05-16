const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    dropoffLocation: {
      type: String,
      required: true,
      trim: true,
    },

    pickupCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    dropoffCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    status: {
      type: String,
      enum: ["pending", "assigned", "ongoing", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    price: {
      type: Number,
      required: true,
    },

    distance: {
      type: Number,
      default: 0,
    },

    estimatedTime: {
      type: Number,
      default: 0,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      default: "",
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "wallet"],
      default: "cash",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);