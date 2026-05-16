const User = require("../model/captchamodel");
const nodemailer = require("nodemailer");

// Generate 6-digit captcha
const generateCaptcha = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create transporter once
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

// ================= SEND CAPTCHA =================
exports.sendCaptcha = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Generate captcha
    const captcha = generateCaptcha();

    // Expiry time (5 minutes)
    const expiryMinutes = 5;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save or update user captcha
    await User.findOneAndUpdate(
      { email },
      {
        captcha,
        expiresAt
      },
      {
        upsert: true,
        returnDocument: "after"
      }
    );

    // Mail options
    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `${process.env.APP_NAME} - Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>

          <p>Your verification code is:</p>

          <h1 style="
            background:#f4f4f4;
            display:inline-block;
            padding:10px 20px;
            border-radius:5px;
            letter-spacing:4px;
          ">
            ${captcha}
          </h1>

          <p>
            This code will expire in
            <b>${expiryMinutes} minutes</b>.
          </p>

          <p>
            If you did not request this, please ignore this email.
          </p>
        </div>
      `
    };

    // Send email
    transporter.sendMail(mailOptions)
      .then(info => {
        console.log("MAIL SENT:", info.response);
      })
      .catch(err => {
        console.log("MAIL ERROR:", err);
      });

    // Send response
    return res.status(200).json({
      success: true,
      message: "Captcha sent successfully",
      captcha // remove this in production
    });

  } catch (error) {
    console.error("SEND CAPTCHA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ================= VERIFY CAPTCHA =================
exports.verifyCaptcha = async (req, res) => {
  try {
    const { email, captcha } = req.body;

    // Validate input
    if (!email || !captcha) {
      return res.status(400).json({
        success: false,
        message: "Email and captcha are required"
      });
    }

    // Find user
    const user = await User.findOne({ email });

    // User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Invalid captcha
    if (user.captcha !== captcha) {
      return res.status(400).json({
        success: false,
        message: "Invalid captcha"
      });
    }

    // Expired captcha
    if (new Date() > user.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Captcha expired"
      });
    }

    // Clear captcha after verification
    user.captcha = null;
    user.expiresAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Captcha verified successfully"
    });

  } catch (error) {
    console.error("VERIFY CAPTCHA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};