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

    // 5 MINUTES EXPIRY
    const expiryMinutes = 15;

    // EXACT EXPIRY TIME
    const expiresAt = new Date(
      Date.now() + expiryMinutes * 60 * 1000
    );

    console.log("GENERATED CAPTCHA:", captcha);
    console.log("EXPIRES AT:", expiresAt);

    // SAVE OR UPDATE USER
    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        captcha,
        expiresAt
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    console.log("SAVED USER:", user);

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "Captcha generated successfully",
      captcha,
      expiresAt
    });

  } catch (error) {

    console.error("SEND CAPTCHA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// =========================
// VERIFY CAPTCHA
// =========================
exports.verifyCaptcha = async (req, res) => {
  try {

    console.log("BODY:", req.body);

    const { captcha } = req.body || {};

    // VALIDATE CAPTCHA
    if (!captcha) {
      return res.status(400).json({
        success: false,
        message: "Captcha is required"
      });
    }

    console.log("SEARCH CAPTCHA:", captcha);

    // FIND USER
    const user = await User.findOne({ captcha });

    console.log("FOUND USER:", user);

    // CAPTCHA NOT FOUND
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid captcha"
      });
    }

    // EXACT TIME CHECK
    const currentTime = Date.now();

    const expiryTime = new Date(user.expiresAt).getTime();

    console.log("CURRENT TIME:", new Date(currentTime));
    console.log("EXPIRY TIME:", new Date(expiryTime));

    // CAPTCHA EXPIRED
    if (currentTime > expiryTime) {

      return res.status(400).json({
        success: false,
        message: "Captcha expired"
      });

    }

    // CLEAR CAPTCHA AFTER VERIFY
    user.captcha = null;
    user.expiresAt = null;

    await user.save();

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "Captcha verified successfully"
    });

  } catch (error) {

    console.error("VERIFY CAPTCHA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};