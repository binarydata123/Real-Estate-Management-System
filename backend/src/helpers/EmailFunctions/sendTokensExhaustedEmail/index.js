const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const sendTokensExhaustedEmail = async (settingData, unsubscribeUrl) => {
  const mockUser = {
    email: "binarydata.sale@gmail.com",
    firstName: "John",
    lastName: "Doe",
  };

  const planName = "Pro Plan";
  const expiryDate = "2025-09-01";
  const buyTokensUrl = "https://example.com/buy-tokens";
  const upgradeUrl = "https://example.com/upgrade-plan";
  const email = mockUser.email;
  const totalTokens = 100;
  const usedTokens = 100;
  const userName = mockUser.firstName + " " + mockUser.lastName || "User";
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "tokensExpired.ejs"
    );
    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      planName,
      expiryDate,
      buyTokensUrl,
      upgradeUrl,
      totalTokens,
      usedTokens,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `You've Used All Your Tokens, ${userName}`,
        html: htmlContent,
        socialLinks: socialLinks,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `You've Used All Your Tokens, ${userName}`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending tokens exhausted email:", error);
  }
};

module.exports = sendTokensExhaustedEmail;
