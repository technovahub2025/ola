const express = require("express");
const { 
  getDriverProfile,
  updateDriverProfile,
  uploadDriverImage,
  driverLogout
} = require("../controller/driverprofilecontroller");

const router = express.Router();

// Driver profile endpoints
router.get("/api/driver/profile/:driverId", getDriverProfile);
router.put("/api/driver/profile/:driverId", updateDriverProfile);
router.post("/api/driver/upload-image/:driverId", uploadDriverImage);
router.post("/api/driver/logout", driverLogout);

module.exports = router;
