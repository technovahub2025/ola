const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/registermodel");

const driverlogin = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone number are required" });
    }

    // Find user with driver role only
    const user = await User.findOne({ name: name, phone: phone, role: "driver" });
    if (!user) {
      return res.status(400).json({ message: "Driver not found" });
    }

    // Note: Since we're using name+phone instead of email+password,
    // you might want to remove or modify the password comparison
    // If users still have passwords in the database, you can keep this
    // If not, remove the bcrypt.compare logic
    
    // Optional: If you still want to verify a PIN/password later
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(400).json({ message: "Invalid credentials" });
    // }

    // Update driver's status to online in database
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate JWT (include name for WebSocket display)
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        name: user.name,
        phone: user.phone
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // WebSocket server URL for frontend connection
    const wsServerUrl = process.env.WS_SERVER_URL || 'ws://localhost:8080';

    res.status(200).json({
      message: "Driver login successful",
      token,
      wsServerUrl, // Send WebSocket server URL to frontend
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isOnline: true, // Mark as online
        lastSeen: user.lastSeen
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

module.exports = driverlogin;