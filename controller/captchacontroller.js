const User = require("../model/captchamodel");
const nodemailer = require("nodemailer");

// generate 6-digit captcha
const generateCaptcha = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendCaptcha = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const captcha = generateCaptcha();
    const expiryMinutes = 5;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // save or update captcha
    await User.findOneAndUpdate(
      { email },
      { captcha, expiresAt },
      { upsert: true, new: true }
    );

    // ⚡ Send response immediately
    res.status(200).json({
      message: "Captcha generated. Check your email.",
      captcha // optional for testing
    });

    // 🔹 Send mail async (does NOT block response)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      },
      tls: { rejectUnauthorized: false } // for dev only
    });

    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `${process.env.APP_NAME} - Verification Code`,
      html: `
        <h2>Email Verification</h2>
        <p>Your captcha code is:</p>
        <h1>${captcha}</h1>
        <p>This code will expire in <b>${expiryMinutes} minutes</b>.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    };

    transporter.sendMail(mailOptions)
      .then(() => console.log(`Mail sent to ${email}`))
      .catch(err => console.log("Mail error:", err));

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyCaptcha = async (req, res) => {
  try {
    const { email, captcha } = req.body;

    // check input
    if (!email || !captcha) {
      return res.status(400).json({
        success: false,
        message: "Email and captcha are required"
      });
    }

    // find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // check captcha
    if (user.captcha !== captcha) {
      return res.status(400).json({
        success: false,
        message: "Invalid captcha"
      });
    }

    // check expiry
    if (new Date() > user.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Captcha expired"
      });
    }

    // clear captcha after success
    user.captcha = null;
    user.expiresAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Captcha verified successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};