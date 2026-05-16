const bcrypt = require("bcryptjs");
const User = require("../model/registermodel");

const locationcontroller = async (req, res) => {
  try {
    const { startlocation, endlocation } = req.body;

    // Validation
    if (!startlocation || !endlocation) {
      return res.status(400).json({ message: "All fields are required" });
    }





    const user = new User({
      startlocation,
      endlocation,
      status: "confirmed"
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

module.exports = locationcontroller;
