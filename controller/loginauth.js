const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/registermodel");

const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // VALIDATION
    if (!email || !password) {

      return res.status(400).json({
        message: "All fields are required"
      });

    }

    // STATIC CREDENTIALS
    const STATIC_EMAIL = "user@gmail.com";
    const STATIC_PASSWORD = "user123";

    // CHECK EMAIL
    if (email !== STATIC_EMAIL) {

      return res.status(400).json({
        message: "Invalid email"
      });

    }

    // CHECK PASSWORD
    if (password !== STATIC_PASSWORD) {

      return res.status(400).json({
        message: "Invalid password"
      });

    }

    // GENERATE TOKEN
    const token = jwt.sign(
      {
        email: STATIC_EMAIL,
        role: "user"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        email: STATIC_EMAIL,
        role: "user"
      }
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });

  }

};

module.exports = login;

const forgotPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Email, old password, and new password are required",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from old password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Password update failed",
      error: error.message,
    });
  }
};

module.exports = { login, forgotPassword };
