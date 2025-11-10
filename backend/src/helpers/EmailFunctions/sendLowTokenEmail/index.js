const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendLowTokensEmail = async (
  settingData,
  templateData,
  unsubscribeUrl
) => {
  try {
    // Destructure templateData with defaults
    const {
      email = "user@example.com",
      firstName = "User",
      lastName = "",
      rechargeUrl = "#",
      minRequiredTokens = 0,
      currentTokens = 0,
    } = templateData;

    const userName = `${firstName} ${lastName}`.trim() || "User";
    const transporter = createTransporter(settingData);
    const socialLinks = settingData?.general?.socialLinks || {};

    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "lowTokens.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      minRequiredTokens,
      currentTokens,
      rechargeUrl,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `⚠️ ${userName}, Your Token Balance is Low!`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `⚠️ ${userName}, Your Token Balance is Low!`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending tokens purchased email:", error);
  }
};
module.exports = sendLowTokensEmail;
