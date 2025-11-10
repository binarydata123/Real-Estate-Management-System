const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SendEmailVerification = async (
  email,
  otp,
  userName = "User",
  settingData,
  validityDuration = "10 minutes",
  unsubscribeUrl
) => {
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "emailVerification.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      otp,
      validityDuration,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: "Verify Your Email Address",
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: "Verify Your Email Address",
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Failed to send email verification:", error);
  }
};

module.exports = SendEmailVerification;
