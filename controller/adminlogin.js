

const jwt = require("jsonwebtoken");

const adminlogin = async (req, res) => {

  try {

    const { email, password } = req.body;

    // VALIDATION
    if (!email || !password) {

      return res.status(400).json({
        message: "All fields are required",
      });

    }

    // STATIC ADMIN CREDENTIALS
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin123";

    // CHECK CREDENTIALS
    if (
      email !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {

      return res.status(400).json({
        message: "Invalid credentials",
      });

    }

    // GENERATE JWT TOKEN (1 WEEK EXPIRY)
    const token = jwt.sign(
      {
        email: ADMIN_EMAIL,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // SUCCESS RESPONSE
    return res.status(200).json({
      message: "Login successful",
      token,
      expiresIn: "7 days",
      user: {
        email: ADMIN_EMAIL,
        role: "admin",
      },
    });

  } catch (error) {

    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });

  }

};

module.exports = adminlogin;