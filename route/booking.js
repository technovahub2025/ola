const express = require("express");
const { 
  createBooking, 
  assignBookingToDriver, 
  getDriverBookings, 
  updateBookingStatus, 
  getAllBookings 
} = require("../controller/bookingcontroller");
const logout = require("../controller/logout");

const router = express.Router();

// Logout endpoint
router.post("/api/auth/logout", logout);

// Booking endpoints
router.post("/api/booking/create", createBooking);
router.post("/api/booking/assign", assignBookingToDriver);
router.get("/api/booking/driver/:driverId", getDriverBookings);
router.put("/api/booking/status/:bookingId", updateBookingStatus);
router.get("/api/bookings", getAllBookings);

module.exports = router;
