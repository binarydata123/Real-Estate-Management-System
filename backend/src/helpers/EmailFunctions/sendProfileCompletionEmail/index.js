const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const createTransporter = require("../emailTransporter");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sendProfileCompletionEmail = async (
  user,
  missingFields = [],
  profileCompletion = 0,
  settingData,
  unsubscribeUrl
) => {
  const email = user.email;
  const userName = user.firstName + " " + user.lastName || "User";
  const transporter = createTransporter(settingData);
  const socialLinks = settingData?.general?.socialLinks || {};

  try {
    const templatePath = path.join(
      __dirname,
      "../../../email-templates",
      "profileCompletion.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      userName,
      missingFields,
      profileCompletion,
      completionLink: `${process.env.FRONTEND_URL}candidate/completion`,
      socialLinks: socialLinks,
      unsubscribeUrl,
    });
    let mailOptions = {};
    if (settingData) {
      mailOptions = {
        from:
          settingData.email.fromName + " <" + settingData.email.fromEmail + ">",
        to: email,
        subject: `Complete Your Profile, ${userName}`,
        html: htmlContent,
      };
    } else {
      mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `Complete Your Profile, ${userName}`,
        html: htmlContent,
      };
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending profile completion email:", error);
  }
};

module.exports = sendProfileCompletionEmail;
