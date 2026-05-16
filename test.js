process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.MAIL_USER,
  to: process.env.MAIL_USER,
  subject: "Test Mail",
  text: "Mail config working",
})
.then(() => console.log("Mail sent successfully"))
.catch(err => console.log("Mail error", err));
