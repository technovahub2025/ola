const express = require("express");
const User = require("../model/registermodel");
const router = express.Router();

router.get("/api/drivers/online", async (req, res) => {
  try {
    const onlineDrivers = await User.find({ 
      role: "driver", 
      isOnline: true 
    }).select('name email _id lastSeen phone rating experience');

    res.status(200).json({
      success: true,
      drivers: onlineDrivers,
      count: onlineDrivers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch online drivers",
      error: error.message
    });
  }
});

router.get("/api/drivers/status/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await User.findById(driverId).select('isOnline lastSeen name email');
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    res.status(200).json({
      success: true,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        isOnline: driver.isOnline,
        lastSeen: driver.lastSeen
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch driver status",
      error: error.message
    });
  }
});

module.exports = router;
