const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendTokensPurchasedEmail = async ({
  email,
  firstName,
  lastName,
  purchaseDate,
  tokenAmount,
  purchasedTokens,
  currentTokens,
  dashboardUrl,
  settingData,
  unsubscribeUrl,
}) => {
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const userName = firstName + " " + lastName || "User";
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "tokensPurchased.ejs"
    );

    console.log(email,"email")

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      tokenAmount,
      purchaseDate,
      purchasedTokens,
      currentTokens,
      dashboardUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `🎉 ${userName}, Tokens Purchased Successfully!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `🎉 ${userName}, Tokens Purchased Successfully!`,
        html: htmlContent,
      };
    }
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending tokens purchased email:", error);
  }
};

module.exports = sendTokensPurchasedEmail;
