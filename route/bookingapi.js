const express = require("express");
const { 
  createBooking, 
  assignBookingToDriver, 
  getDriverBookings, 
  updateBookingStatus, 
  getAllBookings,
  getBookingById,
  cancelBooking,
  getUserBookings
} = require("../controller/bookingapi");

const router = express.Router();

// Booking CRUD operations
router.post("/booking/create", createBooking);
router.post("/booking/assign", assignBookingToDriver);
router.get("/booking/:bookingId", getBookingById);
router.put("/booking/status/:bookingId", updateBookingStatus);
router.delete("/booking/cancel/:bookingId", cancelBooking);

// Booking listings
router.get("/bookings", getAllBookings);
router.get("/booking/driver/:driverId", getDriverBookings);
router.get("/booking/user/:userId", getUserBookings);

module.exports = router;
