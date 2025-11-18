const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendPasswordResetEmail = async (settingData, unsubscribeUrl) => {
  const email = "binarydata.sale@gmail.com";
  const userName = "User";
  const expirationTime = "2 hours";
  const resetLink = "fhsdhjahf";
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "passwordReset.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      resetLink,
      expirationTime,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `Reset Your Password, ${userName}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Reset Your Password, ${userName}`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

module.exports = SendPasswordResetEmail;
