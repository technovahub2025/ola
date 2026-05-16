const User = require("../model/captchamodel");
const nodemailer = require("nodemailer");

// =========================
// GENERATE 6-DIGIT CAPTCHA
// =========================
const generateCaptcha = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// =========================
// NODEMAILER TRANSPORTER
// =========================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // IMPORTANT for port 587

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,

  tls: {
    rejectUnauthorized: false
  }
});

// =========================
// VERIFY SMTP CONNECTION
// =========================
transporter.verify((error, success) => {

  if (error) {
    console.error("SMTP VERIFY ERROR:", error);
  } else {
    console.log("SMTP READY");
  }

});

// =========================
// SEND CAPTCHA
// =========================
exports.sendCaptcha = async (req, res) => {

  try {

    // SAFE BODY READ
    const { email } = req.body || {};

    console.log("REQ BODY:", req.body);

    // VALIDATE EMAIL
    if (!email) {

      return res.status(400).json({
        success: false,
        message: "Email is required"
      });

    }

    // GENERATE CAPTCHA
    const captcha = generateCaptcha();

    // CAPTCHA EXPIRY
    const expiryMinutes = 5;

    const expiresAt = new Date(
      Date.now() + expiryMinutes * 60 * 1000
    );

    // SAVE OR UPDATE CAPTCHA
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

    // =========================
    // EMAIL TEMPLATE
    // =========================
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
            If you did not request this,
            please ignore this email.
          </p>

        </div>
      `
    };

    // =========================
    // SEND EMAIL
    // =========================
    try {

      const info = await transporter.sendMail(mailOptions);

      console.log("MAIL SENT:", info.response);

      // SUCCESS RESPONSE
      return res.status(200).json({
        success: true,
        message: "Captcha sent successfully",
        captcha // REMOVE IN PRODUCTION
      });

    } catch (mailError) {

      console.error("MAIL ERROR:", mailError);

      return res.status(500).json({
        success: false,
        message: "Email sending failed"
      });

    }

  } catch (error) {

    console.error("SEND CAPTCHA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

// =========================
// VERIFY CAPTCHA
// =========================
exports.verifyCaptcha = async (req, res) => {

  try {

    // SAFE BODY READ
    const { email, captcha } = req.body || {};

    // VALIDATION
    if (!email || !captcha) {

      return res.status(400).json({
        success: false,
        message: "Email and captcha are required"
      });

    }

    // FIND USER
    const user = await User.findOne({ email });

    // USER NOT FOUND
    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    // INVALID CAPTCHA
    if (user.captcha !== captcha) {

      return res.status(400).json({
        success: false,
        message: "Invalid captcha"
      });

    }

    // EXPIRED CAPTCHA
    if (new Date() > user.expiresAt) {

      return res.status(400).json({
        success: false,
        message: "Captcha expired"
      });

    }

    // CLEAR CAPTCHA
    user.captcha = null;
    user.expiresAt = null;

    await user.save();

    // SUCCESS
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