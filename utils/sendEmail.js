// const nodemailer = require("nodemailer");
// const ejs = require("ejs");
// const path = require("path");
// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const templatePath = path.join(__dirname, "../templates/email-template.ejs");
//   const html = await ejs.renderFile(templatePath, options.templateData || {});

//   const mailOptions = {
//     from: `"Speed Up" <${process.env.EMAIL_USERNAME}>`,
//     to: options.email,
//     subject: options.subject || "Speed Up Notification",
//     html: html,
//     // text: options.message || 'Speed Up Notification',
//   };
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;

const sgMail = require("@sendgrid/mail");
const ejs = require("ejs");
const path = require("path");

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
  try {
    console.log("options in send email- -->", options);
    // 1. Render EJS template to HTML
    const templatePath = path.join(
      __dirname,
      "../templates/email-template.ejs"
    );

    const html = await ejs.renderFile(templatePath, options.templateData || {});

    // 2. Build email
    const msg = {
      from: {
        email: process.env.EMAIL_FROM,
        name: "Speed Up",
      },
      to: options.email, // receiver
      subject: options.subject || "Speed Up Notification",
      html: html,
    };

    // 3. Send mail via SendGrid
    const result = await sgMail.send(msg);
    console.log("result in send email- -->", result);
  } catch (error) {
    console.error("SendGrid email error:", error);

    if (error.response && error.response.body) {
      console.error("SendGrid response body:", error.response.body);
    }

    // rethrow so your catchAsyncHandler / ErrorHandler can catch it
    throw error;
  }
};

module.exports = sendEmail;
