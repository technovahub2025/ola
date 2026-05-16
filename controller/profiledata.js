const bcrypt = require("bcryptjs");
const User = require("../model/registermodel");

const profiledata = async (req, res) => {
  try {
    const { name, email,  phone } = req.body;
const userId = req.params.id;
    // Validation
    if (!name || !email || phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

   

    

    

    const user = new User(
         userId,
        {
      name,
      email,
      phone
    });

    await user.save();

    res.status(201).json({
      message: "profile data retrived successfully",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load",
      error: error.message,
    });
  }
};

module.exports = profiledata;
