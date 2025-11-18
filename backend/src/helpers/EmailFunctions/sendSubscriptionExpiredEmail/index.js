const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendSubscriptionExpiredEmail = async (settingData, unsubscribeUrl) => {
  const mockUser = {
    email: "binarydata.sale@gmail.com",
    firstName: "John",
    lastName: "Doe",
  };

  const planName = "Pro Plan";
  const expiryDate = "2025-08-01";
  const renewUrl = "https://example.com/renew";
  const email = mockUser.email;
  const userName = mockUser.firstName + " " + mockUser.lastName || "User";
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "subscriptionExpired.ejs"
    );
    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      planName,
      expiryDate,
      renewUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `Your Subscription Has Expired, ${userName}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Your Subscription Has Expired, ${userName}`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending subscription expired email:", error);
  }
};

module.exports = sendSubscriptionExpiredEmail;
