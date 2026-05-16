const jwt = require("jsonwebtoken");
const User = require("../model/registermodel");

const logout = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Update user status to offline in database
    await User.findByIdAndUpdate(userId, { 
      isOnline: false,
      lastSeen: new Date()
    });

    // In a real app, you might want to blacklist the token
    // For now, we'll just clear the user's online status
    
    res.status(200).json({
      message: "Logout successful",
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: "Logout failed",
      error: error.message,
    });
  }
};

module.exports = logout;
