const User = require("../model/registermodel");

const bookinghistory = async (req, res) => {
  try {
    const { startlocation, endlocation } = req.body;
    const userId = req.params.id;

    if (!startlocation || !endlocation) {
      return res.status(400).json({
        message: "Start location and end location are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        startlocation,
        endlocation,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("name email phone startlocation endlocation");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Booking saved successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save booking",
      error: error.message,
    });
  }
};

module.exports = bookinghistory;