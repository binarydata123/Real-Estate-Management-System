const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const sendPaymentFailedEmail = async (settingData, unsubscribeUrl) => {
  const mockUser = {
    email: "binarydata.sale@gmail.com",
    firstName: "John",
    lastName: "Doe",
  };

  const planName = "Pro Plan";
  const attemptDate = "2025-08-01";
  const retryPaymentUrl = "https://example.com/renew";
  const amount = "$40";
  const email = mockUser.email;
  const userName = mockUser.firstName + " " + mockUser.lastName || "User";
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "paymentFailed.ejs"
    );
    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      planName,
      amount,
      attemptDate,
      retryPaymentUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `Payment Failed - ${planName}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Payment Failed - ${planName}`,
        html: htmlContent,
      };
    }
    // const mailOptions = {
    //   from: process.env.MAIL_FROM_ADDRESS,
    //   to: email,
    //   subject: `Payment Failed - ${planName}`,
    //   html: htmlContent,
    //   // attachments: [
    //   //   {
    //   //     filename: "logo.png",
    //   //     path: path.join(__dirname, "../../../../public/images/logo.jpg"),
    //   //     cid: "logoImage",
    //   //   },
    //   // ],
    // };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending payment failed email:", error);
  }
};

module.exports = sendPaymentFailedEmail;
