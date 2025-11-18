const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const sendSubscriptionPurchasedEmail = async ({
  email,
  firstName,
  lastName,
  planName,
  planDuration,
  planPrice,
  dashboardUrl,
  companyName,
  settingData,
  unsubscribeUrl,
}) => {
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const userName = `${firstName} ${lastName}` || "User";

    const templatePath = path.join(
      __dirname,
      "../../../email-templates", // ✅ Corrected
      "subscriptionPurchased.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      companyName,
      planName,
      planDuration,
      planPrice,
      dashboardUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    // Get CC email from settings
    const ccEmail =
      settingData?.email?.fromEmail || process.env.MAIL_FROM_ADDRESS;
    let mailOptions = {};

    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        cc: ccEmail,
        subject: `🎉 ${userName}, Subscription Purchased Successfully!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        cc: ccEmail,
        subject: `🎉 ${userName}, Subscription Purchased Successfully!`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending subscription purchased email:", error);
  }
};

module.exports = sendSubscriptionPurchasedEmail;
