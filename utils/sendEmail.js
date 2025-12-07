const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const sendEmail = async (options) => {
  // Create Transport
  // const transporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   secure: false,
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const templatePath = path.join(__dirname, "../templates/email-template.ejs");
  const html = await ejs.renderFile(templatePath, options.templateData || {});

  const mailOptions = {
    from: `"Speed Up" <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject || "Speed Up Notification",
    html: html,
    // text: options.message || 'Speed Up Notification',
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
