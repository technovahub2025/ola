const express = require("express");
const router = express.Router();

// Import controllers
const { register } = require("../controller/registerauth");
const { login, forgotPassword } = require("../controller/loginauth");
const adminregister = require("../controller/adminregister");
const adminlogin = require("../controller/adminlogin");
const { addUser, updateUser, deleteUser, getAllUsersForAdmin, getbyrole } = require("../controller/driverprofile");
const locationcontroller = require("../controller/locationcontroller");
const driverregister = require("../controller/driver register");
const driverlogin = require("../controller/driverlogin");
const bookingController = require("../controller/bookingapi");
const { userprofile } = require("../controller/userprofileupdate");
const paymentMethod = require("../controller/paymentcontroller");
const generateCaptcha = require("../controller/captchacontroller");

// Auth routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.put("/auth/forgot-password", forgotPassword);

// Admin routes
router.post("/admin/register", adminregister);
router.post("/admin/login", adminlogin);
router.post("/admin/addprofile", addUser);
router.put("/admin/editprofile/:id", updateUser);
router.delete("/admin/deleteprofile/:id", deleteUser);
router.get("/admin/getall", getAllUsersForAdmin);
router.get("/admin/role", getbyrole);
router.post("/admin/updateprofile/:id", updateUser);

// User routes
router.post("/bookinghistory/:id", userprofile);
router.get("/users", userprofile);




// Location routes
router.post("/location/pickupanddrop", locationcontroller);
//catcha verify//

router.post("/sendcaptcha", generateCaptcha.sendCaptcha);
//payment route//

router.post("/payment",paymentMethod);
// Driver routes
router.post("/driver/register", driverregister);
router.post("/driver/driverlogin", driverlogin);

// Booking routes
router.post("/booking", bookingController.createBooking);
router.get("/booking/driver/:driverId", bookingController.getDriverBookings);
router.get("/booking/:bookingId", bookingController.getBookingById);
router.put("/booking/status/:bookingId", bookingController.updateBookingStatus); // Fixed route parameter name to match controller


module.exports = router;

