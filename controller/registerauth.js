const bcrypt = require("bcryptjs");
const User = require("../model/registermodel");

const register = async (req, res) => {
  try {
    let {
      name,
      email,
      phone,
      password,
      confirmPassword,
      startlocation,
      endlocation,
      role
    } = req.body;

    // Normalize input
    email = email?.toLowerCase().trim();
    name = name?.trim();

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password mismatch",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check existing user (fast because of index)
    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Hash password (optimized rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      startlocation: startlocation || "",
      endlocation: endlocation || "",
      role: role || "user",
    });

    return res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        startlocation: user.startlocation,
        endlocation: user.endlocation,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

module.exports = { register };