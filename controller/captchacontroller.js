const User = require("../model/captchamodel");

// =========================
// GENERATE 6-DIGIT CAPTCHA
// =========================
const generateCaptcha = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "Captcha generated successfully",
      captcha
    });

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