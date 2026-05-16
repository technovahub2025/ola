const bcrypt = require("bcryptjs");
const User = require("../model/registermodel");

const driverregister = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, startlocation, endlocation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password mismatch" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone: phone || "",
      password: hashedPassword,
      role: "driver",
      startlocation: startlocation || "",
      endlocation: endlocation || ""
    });

    await user.save();

    res.status(201).json({
      message: "Driver registered successfully",
      userId: user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        startlocation: user.startlocation,
        endlocation: user.endlocation,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

module.exports = driverregister;
